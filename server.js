const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// API route for current weather
app.get('/api/weather', async (req, res) => {
    try {
        const city = req.query.city;
        const apiKey = process.env.API_KEY;

        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch weather" });
    }
});

// API route for forecast
app.get('/api/forecast', async (req, res) => {
    try {
        const city = req.query.city;
        const apiKey = process.env.API_KEY;

        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
        );

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch forecast" });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});