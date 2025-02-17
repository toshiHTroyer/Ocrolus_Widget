'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bent = require('bent');
const bodyParser = require('body-parser');

const PORT = process.env.APP_PORT || 8000;
const ENV = process.env.OCROLUS_WIDGET_ENVIRONMENT || 'production';
const OCROLUS_CLIENT_ID = process.env.OCROLUS_CLIENT_ID?.trim();
const OCROLUS_CLIENT_SECRET = process.env.OCROLUS_CLIENT_SECRET?.trim();
const OCROLUS_WIDGET_UUID = process.env.OCROLUS_WIDGET_UUID?.trim();

// Required API URLs for token and upload functionality
const TOKEN_ISSUER_URLS = {
    production: 'https://widget.ocrolus.com',
};
const OCROLUS_API_URLS = {
    production: 'https://api.ocrolus.com',
};

const token_issuer = TOKEN_ISSUER_URLS[ENV];
const OCROLUS_API = OCROLUS_API_URLS[ENV];

// Initialize HTTP clients
const issuer = bent(token_issuer, 'POST', 'json', 200);
const ocrolusBent = (method, token) =>
    bent(`${OCROLUS_API}`, method, 'json', { authorization: `Bearer ${token}` });

const app = express();

app.use(bodyParser.json());
app.use(cors({
    origin: ['https://www.ocrolusexample.com', 'http://localhost:3000', 'http://localhost:8000'],
    credentials: true
}));

app.post('/token', async function(request, response) {
    try {
        const { userId, bookName } = request.body;
        console.log('Token request received:', { userId, bookName });

        const tokenResponse = await issuer(`/v1/widget/${OCROLUS_WIDGET_UUID}/token`, {
            client_id: OCROLUS_CLIENT_ID,
            client_secret: OCROLUS_CLIENT_SECRET,
            custom_id: userId || 'default-user',
            grant_type: 'client_credentials',
            book_name: bookName || 'Widget Book'
        });

        console.log('Token received from Ocrolus');
        // Return only the access_token as expected by the widget
        response.json({access_token: tokenResponse.access_token });
    } catch (error) {
        console.error('Error in token request:', error);
        response.status(500).json({ error: error.message });
    }
});

const server = app.listen(PORT, function() {
    console.log('Server listening on port ' + PORT);
});