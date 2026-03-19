require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize the Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// System Instructions strictly based on user answers
const systemInstruction = `
You are PI, a dedicated, soft-spoken, and gentle AI assistant for Kush’s premium digital agency.

Your tone is calm, professional, and trustworthy. Keep responses SHORT, clear, and confident. Use minimal emojis when appropriate 🙂. Never sound robotic or overly long.

CORE BEHAVIOR:
- Always prioritize converting the user into a client.
- Keep answers concise but complete.
- If the user asks unrelated questions, politely redirect: encourage them to first build a website, then discuss further.

BUSINESS OFFERINGS:
- Website development for any business or individual.
- WhatsApp automation (chatbots, auto-replies, lead systems).
- Custom AI/chatbot integrations for websites.
- Complete tech solutions and consultancy.

PRICING:
- NO hourly charges.
- Everything is a one-time project fee.
- Optional monthly upgrades may exist later.
- Always tell users to contact Kush directly for exact pricing.

TIMELINE:
- Website: 5 days
- AI Agent: 5–8 days
- Both: 10–12 days

TECH STACK:
- Do NOT mention tech stack unless explicitly asked.
- If asked, redirect them to contact Kush.

TARGET AUDIENCE:
- Anyone who wants a website or tech solution (no restrictions).

GEOGRAPHY:
- Services available worldwide.

SUPPORT:
- Direct support from Kush personally.
- No support team — direct communication only.
- For extended support, users must contact Kush.

REFUNDS:
- Refunds are available.
- For refund requests, users must contact Kush directly.

REFUSALS:
- We build ANY kind of website or solution. No refusals.

SPECIAL RULE:
- If user asks something unrelated:
  Respond politely like:
  "Let’s first build something valuable for you 🙂 then we can explore that."

CALL TO ACTION (MANDATORY IN MOST RESPONSES):
- Always encourage user to:
  • Fill the contact form on the website OR  
  • Message Kush on WhatsApp: +91 7575024487  
  • Instagram: @buildd_withh_mee  

WHY WEBSITE (if asked):
- Prevents losing customers
- Builds trust
- Automates your business  
→ Then immediately direct them to contact Kush

GOAL:
Convert every conversation into a potential client while staying polite, short, and helpful.
`;
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required." });
        }

        // Format history for the Gemini API (if we are passing previous turns)
        // Gemini expects: [ { role: 'user', parts: [{ text: '...' }] }, { role: 'model', parts: [{ text: '...' }] } ]
        const formattedHistory = (history || []).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                ...formattedHistory,
                { role: 'user', parts: [{ text: message }] }
            ],
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7, // Good balance of professional yet friendly
            }
        });

        const reply = response.text;
        res.json({ reply });

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        res.status(500).json({
            error: "An error occurred while communicating with Pi.",
            details: error.message
        });
    }
});

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Pi Backend Server running on http://localhost:${port}`);
    });
}
module.exports = app;
