import express from 'express';
import { createServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import * as path from 'path';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/api/voice' });

const PORT = process.env.PORT || 3000;

app.use(express.json());

wss.on('connection', (ws) => {
  console.log('[Backend] New WebSocket connection established!');
  let geminiWs: WebSocket | null = null;
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    ws.send(JSON.stringify({ error: "API Key is missing." }));
    ws.close();
    return;
  }

  const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;
  
  console.log('[Backend] Attempting to connect to Gemini API...');
  geminiWs = new WebSocket(url);

  geminiWs.on('open', () => {
    console.log('[Backend] SUCCESSFULLY connected to Gemini API!');
    // Send initial configuration to Gemini
    const setupMsg = {
      setup: {
        model: "models/gemini-3.1-flash-live-preview",
        generationConfig: {
          responseModalities: ["AUDIO", "TEXT"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } } },
          systemInstruction: {
            parts: [{ text: "Role: Ultra-Premium Real Estate AI Consultant. You speak conversational Hinglish smoothly. Goal: Understand the user's needs, explain property dimensions and localities in extreme detail, and push for a site visit. CRITICAL INSTRUCTION: Whenever you discuss a specific property, you MUST execute the highlight_property function call with its ID to show it to the user. Keep audio responses under 20 seconds." }]
          },
          tools: [{
            functionDeclarations: [{
              name: "highlight_property",
              description: "Highlights a specific property on the user's screen when discussing it.",
              parameters: {
                type: "OBJECT",
                properties: {
                  property_id: {
                    type: "STRING",
                    description: "The unique ID of the property to highlight (e.g., 'prop_1')"
                  }
                },
                required: ["property_id"]
              }
            }]
          }]
        }
      }
    };
    geminiWs?.send(JSON.stringify(setupMsg));
  });

  geminiWs.on('message', (data, isBinary) => {
    if (ws.readyState !== WebSocket.OPEN) return;
    
    try {
      const response = JSON.parse(data.toString());
      if (response.serverContent) {
        if (response.serverContent.interrupted) {
          ws.send(JSON.stringify({ interrupted: true }));
        }
        
        if (response.serverContent.modelTurn && response.serverContent.modelTurn.parts) {
          for (const part of response.serverContent.modelTurn.parts) {
            if (part.text) {
              ws.send(JSON.stringify({ text: part.text }));
            }
            if (part.inlineData && part.inlineData.data) {
              ws.send(JSON.stringify({ audio: part.inlineData.data }));
            }
            if (part.functionCall) {
              ws.send(JSON.stringify({ functionCall: part.functionCall }));
              
              // Automatically send matching tool response for simplicity
              if (geminiWs && geminiWs.readyState === WebSocket.OPEN) {
                geminiWs.send(JSON.stringify({
                  toolResponse: {
                    functionResponses: [{
                      id: part.functionCall.id,
                      name: part.functionCall.name,
                      response: { result: "Property highlighted successfully" }
                    }]
                  }
                }));
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  });

  geminiWs.on('close', (code, reason) => {
    console.log(`[Backend] Gemini API Connection Closed. Code: ${code}, Reason: ${reason}`);
    ws.close();
  });

  geminiWs.on('error', (error) => {
    console.error('[Backend] Gemini API Connection Error:', error);
  });

  ws.on('message', (message) => {
    if (!geminiWs || geminiWs.readyState !== WebSocket.OPEN) return;
    
    try {
      const parsed = JSON.parse(message.toString());
      if (parsed.audio) {
        geminiWs.send(JSON.stringify({ 
          realtimeInput: { 
            mediaChunks: [{ mimeType: "audio/pcm;rate=16000", data: parsed.audio }] 
          } 
        }));
      }
      if (parsed.text) {
        geminiWs.send(JSON.stringify({ 
          clientContent: { 
            turns: [{ role: "user", parts: [{ text: parsed.text }] }],
            turnComplete: true 
          } 
        }));
      }
      if (parsed.clientContent && parsed.clientContent.turnComplete) {
        geminiWs.send(JSON.stringify({ clientContent: { turnComplete: true } }));
      }
    } catch (err) {
      console.error(err);
    }
  });

  ws.on('close', () => {
    if (geminiWs) geminiWs.close();
  });
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Backend] Server & WebSockets running on port ${PORT}`);
  });
}

startServer();
