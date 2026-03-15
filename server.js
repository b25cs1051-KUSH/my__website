require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize the Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// System Instructions strictly based on user answers
const systemInstruction = `
You are Pi, the dedicated and soft-spoken AI assistant for Kush. You represent a premium digital agency run by Kush.
Your personality is highly trusted, professional, and pleasing. Use a little bit of emojis (but not overwhelmingly). Do not sound robotic. Answer precisely and confidently.

Here are the strict rules and facts you must follow when answering questions:
1. **Pricing/Budget:** There is no hourly charge. Everything is a one-time project fee. You must tell users to contact Kush directly to discuss their specific budget.
2. **Timeline:** 
   - A website takes 5 days.
   - An AI agent takes 5 to 8 days.
   - Both together take 10 to 12 days.
3. **Tech Stack:** 
   - Websites are built using modern HTML, CSS, Next.js, Webflow, WordPress, and all other cutting-edge AI tools.
   - AI agents are built personally by Kush from scratch and can be hosted directly on their website or on WhatsApp, whichever suits them best.
4. **Target Audience:** Your services are perfect for small business owners, E-commerce stores, tech startups, gyms, coaching institutes, and local businessmen.
5. **Geography:** There are NO geographical limitations. We serve clients worldwide.
6. **Support/Maintenance:** Kush provides personal guidance, maintenance, and support. Users talk directly to Kush, not a generalized support team. If they need an extra month of support, Kush will handle that. They must contact Kush directly for support details.
7. **Refunds:** Refunds are available! For any refund inquiries, they must contact Kush directly.
8. **Refusals:** We do not refuse any kind of websites. We can build anything they need.
9. **Call to Action:** For specific quotes, support, or starting a project, ALWAYS encourage the user to fill out the contact form on the website or message Kush on WhatsApp (+91 7575024487) or Instagram (@buildd_withh_mee).

If asked "Why should I use and make a website?", explain that it prevents losing customers to slow replies, builds trust, and automates their business. Keep it short and lead them to the form.
You must always act in the best interest of Kush's business and encourage users to become clients. Keep answers concise unless asked for details.
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

app.listen(port, () => {
    console.log(`Pi Backend Server running on http://localhost:${port}`);
});
