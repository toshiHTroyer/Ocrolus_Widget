'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bent = require('bent');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();
const FormData = require('form-data');

const PORT = process.env.APP_PORT || 8000;
const ENV = process.env.OCROLUS_WIDGET_ENVIRONMENT || 'production';
const OCROLUS_CLIENT_ID = process.env.OCROLUS_CLIENT_ID;
const OCROLUS_CLIENT_SECRET = process.env.OCROLUS_CLIENT_SECRET;
const OCROLUS_WIDGET_UUID = process.env.OCROLUS_WIDGET_UUID;

if (!OCROLUS_CLIENT_ID && !OCROLUS_CLIENT_SECRET) {
    throw Error(
        'Ocrolus client and secret undefined in env. modify .env to contain client id and secret for ocrolus widget.'
    )
}
// Required API URLs for token and upload functionality
const TOKEN_ISSUER_URLS = {
    production: 'https://widget.ocrolus.com',
};

const API_ISSUER_URLS = {
    production: 'https://auth.ocrolus.com',
};
const OCROLUS_API_URLS = {
    production: 'https://api.ocrolus.com',
};

const OCROLUS_IP_ALLOWLIST = [
    '18.205.30.63',
    '18.208.79.114',
    '18.213.224.210',
    '18.233.250.22',
    '35.173.140.133',
    '35.174.183.80',
    '54.164.238.206',
]

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
const api_issuer = bent(auth_issuer, 'POST', 'json', 200);
const jsonParser = bodyParser.json();
const app = express();

app.use(bodyParser.json());
app.use( bodyParser.urlencoded({extended: false,}))
app.use(jsonParser)

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
            //scope: 'upload:create read:book',
            //widget_uuid: OCROLUS_WIDGET_UUID,
            //upload_domain: 'https://widget.ocrolus.com'
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
app.post('/upload', function (request, response) {
    // Validate allowed IPs
    const sender = request.headers['x-forwarded-for']
    console.log(sender)
    console.log(request.body)
    console.log(request.body.event_name)
    console.log(request.body.event_name !== DOCUMENT_CLASSIFIED)
    if (OCROLUS_IP_ALLOWLIST.indexOf(sender) === -1) {
        console.log('ignored sender')
        return response.sendStatus(401)
    }
    // Validate that the document is ready to be downloaded
    if (request.body.event_name !== DOCUMENT_READY && request.body.event_name !== DOCUMENT_CLASSIFIED) {
        return response.json({})
    }
    console.log('Downloading file', request.body.book_uuid, request.body.mixed_uploaded_doc_uuid)

    return api_issuer('/oauth/token', {
        client_id: OCROLUS_CLIENT_ID,
        client_secret: OCROLUS_CLIENT_SECRET,
        grant_type: 'client_credentials',
    }).then(token_response => {
        console.log('Downloading document')
        console.log(token_response)
        const webhookData = request.body
        const { access_token: accessToken } = token_response

        return ocrolusBent('GET', accessToken)(
            `/v1/book/info?book_uuid=${webhookData.book_uuid}`,
            undefined
        ).then(bookQueryResp => {
            console.log(bookQueryResp)
            const bookData = bookQueryResp.response
            if (bookData.book_type != WIDGET_BOOK_TYPE) {
                return response.json({})
            }

            return downloadOcrolus(
                'GET',
                accessToken
            )(`/v2/document/download?doc_uuid=${webhookData.doc_uuid}`).then(doc => {
                console.log(doc)
                console.log('Download of file started')
                writeFile('ocrolus_document.pdf', doc)
                response.json({})
            })
        })
    })
})
    */

app.post('/upload', function (request, response) {
    console.log('Upload request received');
    response.json({ status: 'success' });
});


const server = app.listen(PORT, function() {
    console.log('Server listening on port ' + PORT);
});