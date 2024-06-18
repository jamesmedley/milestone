require('dotenv').config();
const fetch = require('node-fetch');
const FitDecoder = require('fit-decoder');
const FormData = require('form-data');

const ACTIVITY_ID = 'your_activity_id';

async function authenticate(refresh_token){
    try {
        const response = await fetch(auth_link, {
            method: 'post',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                refresh_token: refresh_token,
                grant_type: 'refresh_token'
            })
        });
        return await response.json();
    }  catch (error) {
        console.error('Error re-authorizing:', error);
        throw error;
    }
}



async function downloadFitFile(activityId, accessToken) {
    const url = `https://www.strava.com/api/v3/activities/${activityId}/export_original`;
    const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!response.ok) throw new Error(`Failed to download .fit file: ${response.statusText}`);
    return await response.buffer();
}

function stripDistanceField(fitData) {
    const fitDecoder = new FitDecoder(fitData);
    const messages = fitDecoder.getMessages();
    const strippedMessages = messages.map(message => {
        if (message.type === 'record') {
            const filteredFields = message.fields.filter(field => field.key !== 'distance');
            return { ...message, fields: filteredFields };
        }
        return message;
    });
    return FitDecoder.encode({ messages: strippedMessages });
}

async function uploadFitFile(modifiedFitData, accessToken) {
    const form = new FormData();
    form.append('file', modifiedFitData, { filename: 'activity.fit', contentType: 'application/octet-stream' });
    form.append('data_type', 'fit');

    const response = await fetch('https://www.strava.com/api/v3/uploads', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` },
        body: form
    });
    if (!response.ok) throw new Error(`Failed to upload .fit file: ${response.statusText}`);
    return await response.json();
}

async function main(refreshToken) {
    try {
        ACCESS_TOKEN = authenticate(refreshToken).access_token
        
        
        console.log("Downloading .fit file from Strava...");
        const fitData = await downloadFitFile(ACTIVITY_ID, ACCESS_TOKEN);
        
        console.log("Stripping distance field from .fit file...");
        const modifiedFitData = stripDistanceField(fitData);
        
        console.log("Uploading modified .fit file to Strava...");
        const uploadResponse = await uploadFitFile(modifiedFitData, ACCESS_TOKEN);
        
        console.log(`Upload successful: ${JSON.stringify(uploadResponse)}`);
    } catch (error) {
        console.error(`An error occurred: ${error.message}`);
    }
}

main();
