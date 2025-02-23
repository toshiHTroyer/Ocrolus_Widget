'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bent = require('bent');
const bodyParser = require('body-parser');
const multer = require('multer'); // Make sure multer is installed
const upload = multer(); // Initialize multer
const FormData = require('form-data'); // Make sure form-data is installed

const PORT = process.env.APP_PORT || 8000;
const ENV = process.env.OCROLUS_WIDGET_ENVIRONMENT || 'production';
const OCROLUS_CLIENT_ID = process.env.OCROLUS_CLIENT_ID;
const OCROLUS_CLIENT_SECRET = process.env.OCROLUS_CLIENT_SECRET;
const OCROLUS_WIDGET_UUID = process.env.OCROLUS_WIDGET_UUID;

// Required API URLs for token and upload functionality
const TOKEN_ISSUER_URLS = {
    production: 'https://widget.ocrolus.com',
};

const API_ISSUER_URLS = {
    production: 'https://auth.ocrolus.com',
};
const OCROLUS_API_URLS = {
    production: 'https://api.ocrolus.com',
    //production: 'https://auth.ocrolus.com',
};

const token_issuer = TOKEN_ISSUER_URLS[ENV];
const auth_issuer = API_ISSUER_URLS[ENV];
const OCROLUS_API = OCROLUS_API_URLS[ENV];

// Initialize HTTP clients
//const issuer = bent(token_issuer, 'POST', 'json', 200);
//const ocrolusBent = (method, token) =>
   //bent(`${OCROLUS_API}`, method, 'json', { authorization: `Bearer ${token}` });

const issuer = bent(token_issuer, 'POST', 'json', 200);
//const api_issuer = bent(auth_issuer, 'POST', 'json', 200);
//onst ocrolusBent = (method, token) =>
    //bent(`${OCROLUS_API}`, method, 'json', { authorization: `Bearer ${token}` });

const app = express();

app.use(bodyParser.json());
app.use(cors({
    origin: ['https://www.ocrolusexample.com', 'http://localhost:3000', 'http://localhost:8000'],
    credentials: true
}));

function getUserExternalId(userId) {
    console.log('hypothetical user lookup', userId);
    return Promise.resolve('Hello');
}

app.post('/token', function (request, response) {
    const user_token = request.headers.authorization || 1234;
    const { userId: passedUserId, bookName } = request.body;
    console.log('user_token', user_token);
    console.log('Passed User Id', passedUserId);
    console.log('Passed Book Name', bookName);
    //return here causes 
    return getUserExternalId(user_token).then(userId => {
        return issuer(`/v1/widget/${OCROLUS_WIDGET_UUID}/token`, {
            client_id: OCROLUS_CLIENT_ID,
            client_secret: OCROLUS_CLIENT_SECRET,
            custom_id: passedUserId || userId,
            grant_type: 'client_credentials',
            book_name: bookName || 'Widget Book',
            //scope: 'upload:create read:book'
            scope: 'upload:create read:book',
            widget_uuid: OCROLUS_WIDGET_UUID,
            upload_domain: 'https://widget.ocrolus.com'
        }).then(token_response => {
            const token = token_response.access_token;
            console.log('Complete token response:', JSON.stringify(token_response, null, 2));
            //response.json({ token_response });
            response.json({ accessToken: token });
        }).catch(error => {
            console.error('Token error:', error);
            response.status(500).json({ error: error.message });
        });
    });
});

/*
app.post('/direct-upload', upload.single('file'), async function(request, response) {
    try {
        console.log(request.body);
        console.log(request.body.event_name);
        const file = request.file;
        const bookUuid = request.body.book_uuid;

        // Get API token for direct upload
        const tokenResponse = await api_issuer('/oauth/token', {
            client_id: OCROLUS_CLIENT_ID,
            client_secret: OCROLUS_CLIENT_SECRET,
            grant_type: 'client_credentials'
        });
        
        // Create form data
        const form = new FormData();
        form.append('file', file.buffer, file.originalname);
        form.append('book_uuid', bookUuid);

        // Upload to Ocrolus API
        const uploadResponse = await bent(OCROLUS_API, 'POST', 'json', {
            'Authorization': `Bearer ${tokenResponse.access_token}`,
            ...form.getHeaders()
        })('/v1/book/upload/mixed', form);

        response.json(uploadResponse);
    } catch (error) {
        console.error('Direct upload error:', error);
        response.status(500).json({ error: error.message });
    }
});

app.post('/webhook', function(request, response) {
    console.log('Webhook received:', request.body);
    response.json({ status: 'success' });
});
*/


app.post('/upload', function (request, response) {
    console.log('Upload request received');
    response.json({ status: 'success' });
});


/*
app.post('/upload', function(request, response) {
    console.log('Upload request received:', request.body);
    
    // If this is from the widget, help by adding token metadata
    if (request.headers['x-source'] === 'ocrolus-widget') {
        // Get token from store if available
        const tokenResponse = global.tokenStore && global.tokenStore.values().next().value;
        if (tokenResponse) {
            console.log('Adding token metadata to response');
            response.json({
                status: 'success',
                token_type: tokenResponse.token_type,
                expires_in: tokenResponse.expires_in
            });
        } else {
            response.json({ status: 'success' });
        }
    } else {
        response.json({ status: 'success' });
    }
});
*/
const server = app.listen(PORT, function() {
    console.log('Server listening on port ' + PORT);
});