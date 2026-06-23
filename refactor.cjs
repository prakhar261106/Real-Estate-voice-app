const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Rewrite handleIncomingSimulatedText
content = content.replace(
  /const handleIncomingSimulatedText = \(text: string\) => {[\s\S]*?const handleInputSendMessage/g,
  `const handleIncomingSimulatedText = async (text: string) => {
    const userMsg: TranscriptMessage = {
      id: "usr_" + Date.now(),
      speaker: "USER",
      text,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);

    const apiKeyToUse = config.apiKey || "";
    if (!apiKeyToUse) {
      addSystemMessage("Error: Missing Gemini API Key. Please add it in settings.", true);
      return;
    }

    try {
      // Build history for context
      const history = messages.filter(m => m.speaker === "USER" || m.speaker === "AGENT").map(m => ({
        role: m.speaker === "USER" ? "user" : "model",
        parts: [{ text: m.text }]
      }));
      
      history.push({
        role: "user",
        parts: [{text}]
      });

      const payload = {
        contents: history,
        systemInstruction: {
          parts: [{text: config.systemInstruction}]
        },
        generationConfig: {
            temperature: 0.7,
        }
      };

      const response = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=\${apiKeyToUse}\`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }

      let aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf karna, main samjha nahi.";
      
      const res = getSimulatedSalesmanReply(aiText);
      if (res.propId) {
        setSelectedPropertyId(res.propId);
      }
      if (res.bookVisit) {
        setSiteVisitBooked(true);
      }

      const agMsg: TranscriptMessage = {
        id: "ag_" + Date.now(),
        speaker: "AGENT",
        text: aiText,
        timestamp: new Date()
      };
      
      setMessages((prev) => [...prev, agMsg]);
      speakSimulatedResponse(aiText);

    } catch (e: any) {
      addSystemMessage(e.message, true);
    }
  };

  const handleInputSendMessage`
);

// 2. Remove websocket and bidi code.
content = content.replace(/\/\/ Setup WebSocket connection to Google Gemini Multimodal Live service[\s\S]*?const stopLiveSession = \(\) => {/g, 'const startLiveSession = startSimulatedSession;\n\n  const stopLiveSession = () => {');

// 3. Remove startMicrophoneCapture
content = content.replace(/\/\/ High performance audio processor chunker[\s\S]*?\/\/ Resource cleaner/g, '// Resource cleaner');

fs.writeFileSync('src/App.tsx', content);
