require('dotenv').config();
const ActivityEncoder = require('../fit-encoder-js-main/examples/fitEncodeActivity.js').ActivityEncoder;
const fetch = require('node-fetch');
const fs = require('fs');
const auth_link = "https://www.strava.com/oauth/token";

async function authenticate(refresh_token) {
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
        const authResponse = await response.json();
        if (!response.ok) {
            throw new Error(`Failed to authenticate: ${authResponse.message}`);
        }
        return authResponse;
    } catch (error) {
        console.error('Error re-authorizing:', error);
        throw error;
    }
}


async function getActivityStream(activityId, accessToken) {
    const keys = [
        'time', 'distance', 'latlng', 'altitude', 'velocity_smooth',
        'heartrate', 'cadence', 'watts', 'temp', 'moving', 'grade_smooth'
    ];
    const keysParam = keys.join(',');
    const url = `https://www.strava.com/api/v3/activities/${activityId}/streams?keys=${keysParam}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!response.ok) {
        console.error('Failed to fetch activity details:', response.status, response.statusText);
        throw new Error(`Failed to fetch activity details: ${response.statusText}`);
    }

    return response.json();
}


async function saveActivityAsFit(activityId, accessToken, filename) {
    try {
        const activityData = await getActivityStream(activityId, accessToken);
        console.log(activityData)
        return

        var encoder = new ActivityEncoder(activityData);
  
        const arrayBuffer = encoder.getFile();
        const buffer = Buffer.from(arrayBuffer);
        
        fs.writeFileSync(filename, buffer);
        
        console.log(`File saved to ${filename}`);
    } catch (error) {
        console.error('Error creating FIT file:', error);
    }
}

async function main() {
    const activity_id = //00000000;
    const accessToken = (await authenticate(process.env.MY_REFRESH_TOKEN)).access_token
    const filename = 'resources/activity.fit';

    await saveActivityAsFit(activity_id, accessToken, filename);
}

main();