// require is to import function/values from a different file
// when the require does not begin with a ./, it defaults
// to the node_modules folder
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { GoogleGenAI } = require('@google/genai');
// create the client for the gemini which allows to use the models later on
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
})

const app = express();
app.use(express.json());
app.user(cors());

app.post('/api/gemini/chat', async function (req, res) {
    // we expect the request's body to have a key named `userMessage`
    const userMessage = - req.body.userMessage;
    const prompt = "You are a helpful assistant which answers the user's question. Question: " + userMessage;
    const aiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: prompt
    })

    // candidate - the array of possible responses (Options prefer)
    // parts - gemini will return multi-parts response
    const reply = aiResponse.candidates[0].content.parts[0].text;
    res.json({
        reply: reply
    })
})

app.post('/api/gemini/trip-advisor', async function (req, res) {
    const userMessage = req.body.userMessage;
    const lat = req.body.lat;
    const lng = req.body.lng;

    const prompt = `You are a professional travel advisor. The user is at latitude : ${lat} and longitude: ${lng} 
    The user asks: ${userMessage}
    
    1. You must use the Google Map Tools to look up real operating places
    2. You must include every place returned by the Google Map Tool. Do not invent new places and do not skip anymore. 
    3. For each place, copy its exact name, address, latitude, longitude from the Google Map Results. Do not paraphrase
    the name or guess the latitude or longitude.
    4. List the places in the "Locations" array in the same order as the Google Map grounding results,
    so each location[i] matches groundingChunks[i]

    Respond ONLY with a raw JSON object (no markdown, no code fences) of the form
    {
        "location":[
            {
            "name":"Exact place name from Google Maps",
            "lat":1.334,
            "lng":103.456,
            "description":"Short description from Google Maps results",
            "address":"Full address from Google Maps"
            }
        ]
    }
    `

    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
            tools: [
                { googleMaps: {} }
            ],
            toolConfig: {
                retrievalConfig: {
                    latLng: {
                        latitude: Number(lat),
                        longitude: Number(lng)
                    }
                }
            }
        }
    })

    const text = response.candidates[0].content.parts[0].text;
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    // text itself stores JSON string, we need convert it to a JSON object using JSON.parse
    const jsonResponse = JSON.parse(cleanedText);
    res.json({
        response: jsonResponse
    })

})

app.get('/health', function (req, res) {
    res.send("Working");
})

// the first parameter of app.listen is the port number
// that the server is running on 
// for testing and development, usually we use port number above 3000
// typical for development is 3000, or 8000 etc.
app.listen(3000, function (req, res) {
    console.log("Server has started");
})