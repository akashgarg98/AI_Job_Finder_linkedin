const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

async function test() {
    const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        apiVersion: 'v1beta'
    });
    try {
        console.log('Listing models (v1beta)...');
        const pager = await ai.models.list();
        const modelNames = [];
        for await (const model of pager) {
            modelNames.push(model.name);
        }
        console.log('Available models (v1beta):', modelNames.join(', '));

        const result = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: 'Hello'
        });
        console.log('Success:', result.text);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

test();
