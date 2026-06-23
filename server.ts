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
  
  function connectGemini() {
    console.log('[Backend] Attempting to connect to Gemini API...');
    geminiWs = new WebSocket(url);

    geminiWs.on('open', () => {
      console.log('[Backend] SUCCESSFULLY connected to Gemini API!');
      // CRITICAL: Every single time the geminiWs fires the 'open' event, you MUST immediately send the setup payload
      geminiWs?.send(JSON.stringify({
          setup: {
              tools: [{ 
                functionDeclarations: [{ 
                  name: "display_properties", 
                  description: "Trigger this to show properties on the UI.",
                  parameters: { 
                      type: "OBJECT", 
                      properties: { 
                          ids: { type: "ARRAY", items: { type: "STRING" } },
                          uiState: { type: "STRING", description: "State of UI, e.g., 'SHOW_LIST', 'SHOW_DETAILS'" }
                      },
                      required: ["ids", "uiState"]
                  }
                }]
              }],
              generationConfig: {
                  responseModalities: ["AUDIO"],
                  speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } } } // Force Aoede on EVERY connect
              },
              systemInstruction: {
                parts: [{ text: "Role: You are an expert, highly intelligent Real Estate Consultant. Speak entirely in natural, conversational Hindi mixed with English. Keep responses under 20 seconds. Focus on budget, location, property type, and pushing for a site visit. CRITICAL INSTRUCTION: Whenever you discuss or suggest a specific property or location, YOU MUST immediately execute the 'display_properties' function call. Do not just speak about it, call the tool." }]
              }
          }
      }));
    });

    geminiWs.on('message', (data, isBinary) => {
      if (ws.readyState !== WebSocket.OPEN) return;
      
      try {
        const rawMsg = data.toString();
        const response = JSON.parse(rawMsg);
        
        // Deep search for functionCall in Gemini's response payload
        let functionCall = null;
        if (response?.toolCall) { functionCall = response.toolCall.functionCalls[0]; }
        else if (response?.serverContent?.modelTurn?.parts?.[0]?.functionCall) {
            functionCall = response.serverContent.modelTurn.parts[0].functionCall;
        }

        if (functionCall && functionCall.name === "display_properties") {
            console.log("🛠️ TOOL CALL DETECTED:", functionCall.args);
            
            // Send to Frontend React App
            ws.send(JSON.stringify({ 
                type: "TOOL_CALL", 
                name: functionCall.name,
                args: functionCall.args 
            }));

            // Reply to Gemini so it continues speaking
            if (geminiWs && geminiWs.readyState === WebSocket.OPEN) {
                geminiWs.send(JSON.stringify({
                    toolResponse: {
                        functionResponses: [{
                            id: functionCall.id,
                            name: functionCall.name,
                            response: { status: "OK", message: "UI Updated on client screen." }
                        }]
                    }
                }));
            }
        }

        // Handle normal audio/text chunks if they exist
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
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    });

    geminiWs.on('close', (code, reason) => {
      console.log(`[Backend] Gemini API Connection Closed. Code: ${code}, Reason: ${reason}`);
      if (ws.readyState === WebSocket.OPEN) {
         console.log('[Backend] Reconnecting to Gemini API...');
         connectGemini();
      }
    });

    geminiWs.on('error', (error) => {
      console.error('[Backend] Gemini API Connection Error:', error);
    });
  }

  connectGemini();

  ws.on('message', (message) => {
    if (!geminiWs || geminiWs.readyState !== WebSocket.OPEN) return;
    
    try {
      const parsed = JSON.parse(message.toString());
      if (parsed.audio) {
        geminiWs.send(JSON.stringify({ 
          realtimeInput: { 
            audio: { mimeType: "audio/pcm;rate=16000", data: parsed.audio }
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

  const portNum = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;
  server.listen(portNum, '0.0.0.0', () => {
    console.log(`[Backend] Server & WebSockets running on port ${portNum}`);
  });
}

startServer();
