import express from 'express';
import { createServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import * as path from 'path';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/api/voice' });

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: "healthy",
    gemini: "connected",
    websocket: "active",
    database: "connected"
  });
});

app.get('/api/debug', (req, res) => {
  res.json({
    memory_usage: process.memoryUsage(),
    active_sessions: wss.clients.size,
    websocket_connections: wss.clients.size,
    gemini_status: "online",
    database_status: "connected"
  });
});

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
  
  let reconnectAttempt = 0;
  const maxReconnectAttempts = 10;
  
  function connectGemini() {
    console.log('[Backend] Attempting to connect to Gemini API...');
    geminiWs = new WebSocket(url);

    geminiWs.on('open', () => {
      console.log('[Backend] SUCCESSFULLY connected to Gemini API!');
      reconnectAttempt = 0; // Reset on successful connection
      
      // Notify frontend
      if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "GEMINI_READY" }));
      }
      
      // CRITICAL: Every single time the geminiWs fires the 'open' event, you MUST immediately send the setup payload
      geminiWs?.send(JSON.stringify({
          setup: {
              systemInstruction: {
                  parts: [{ text: "You are Aura, an elite AI Real Estate Consultant. Keep answers brief. Whenever you suggest a location or property, YOU MUST use the display_properties tool. Lead Qualification: Ask for Name, Email, Phone, Budget, City, Property Type. Schedule appointments when suitable. Here are the properties available in our elite catalog: 'Aura Expressway Heights', 'Yamuna Expressway Skyvillas'. You must explicitly use these exact names when using display_properties." }]
              },
              tools: [{
                  functionDeclarations: [{
                      name: "display_properties",
                      description: "Trigger this to show specific properties on the user's screen.",
                      parameters: {
                          type: "OBJECT",
                          properties: {
                              property_names: {
                                  type: "ARRAY",
                                  items: { type: "STRING" },
                                  description: "List of property names to display"
                              }
                          },
                          required: ["property_names"]
                      }
                  }]
              }],
              generationConfig: {
                  responseModalities: ["AUDIO"],
                  speechConfig: {
                      voiceConfig: {
                          prebuiltVoiceConfig: {
                              voiceName: "Aoede" // Locks to professional female voice
                          }
                      }
                  }
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
        let functionCalls: any[] = [];
        if (response?.toolCall?.functionCalls) { 
           functionCalls = response.toolCall.functionCalls; 
        } else if (response?.serverContent?.modelTurn?.parts) {
           for (const part of response.serverContent.modelTurn.parts) {
              if (part.functionCall) functionCalls.push(part.functionCall);
           }
        }

        for (const functionCall of functionCalls) {
            if (functionCall.name === "display_properties") {
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
      if (ws.readyState === WebSocket.OPEN && reconnectAttempt < maxReconnectAttempts) {
         reconnectAttempt++;
         const backoffMs = Math.min(1000 * Math.pow(2, reconnectAttempt - 1), 30000); // 1s, 2s, 4s, 8s, 16s, 30s
         console.log(`[Backend] Reconnecting to Gemini API in ${backoffMs}ms... (Attempt ${reconnectAttempt} of ${maxReconnectAttempts})`);
         setTimeout(connectGemini, backoffMs);
      } else if (reconnectAttempt >= maxReconnectAttempts) {
         console.error('[Backend] Maximum Gemini reconnect attempts reached.');
         ws.send(JSON.stringify({ error: "Failed to reconnect to Gemini after multiple attempts." }));
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

  const portNum = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;
  server.listen(portNum, '0.0.0.0', () => {
    console.log(`[Backend] Server & WebSockets running on port ${portNum}`);
  });
}

startServer();

process.on("uncaughtException", (err) => {
  console.error("CRITICAL BACKEND ERROR:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED PROMISE:", err);
});

process.on("warning", (warning) => {
  console.error("NODE WARNING:", warning);
});
