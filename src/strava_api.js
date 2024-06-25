require('dotenv').config();
const fetch = require('node-fetch');
const FormData = require('form-data');
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
        return await response.json();
    } catch (error) {
        console.error('Error re-authorizing:', error);
        throw error;
    }
}

async function getActivityData(activity_id, refresh_token) {
    const data = await authenticate(refresh_token)
    const activity_link = `https://www.strava.com/api/v3/activities/${activity_id}/`;
    const activityResponse = await fetch(activity_link, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${data.access_token}`
        }
    });

    if (!activityResponse.ok) {
        throw new Error('Failed to fetch activity data');
    }
    return await activityResponse.json();
}

async function getActivityStream(activityId, refresh_token) {
    const data = await authenticate(refresh_token)
    const keys = [
        'time', 'distance', 'latlng', 'altitude', 'velocity_smooth',
        'heartrate', 'cadence', 'watts', 'temp', 'moving', 'grade_smooth'
    ];
    const keysParam = keys.join(',');
    const url = `https://www.strava.com/api/v3/activities/${activityId}/streams?keys=${keysParam}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${data.access_token}` }
    });

    if (!response.ok) {
        console.error('Failed to fetch activity details:', response.status, response.statusText);
        throw new Error(`Failed to fetch activity details: ${response.statusText}`);
    }

    return response.json();
}

async function updateActivity(activity_id, data, updated_fields) {
    const activity_link = `https://www.strava.com/api/v3/activities/${activity_id}/`;
    try {
        const updateResponse = await fetch(activity_link, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${data.access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updated_fields)
        });
        if (!updateResponse.ok) {
            throw new Error('Failed to update activity');
        }
    } catch (error) {
        console.error('Error updating activity:', error);
        throw error;
    }
}


async function getAthleteActivityDistanceTotals(refresh_token, athlete_id) {
    const data = authenticate(refresh_token)
    const stats_link = `https://www.strava.com/api/v3/athletes/${athlete_id}/stats?access_token=${data.access_token}`;
    try {
        const response = await fetch(stats_link);
        const json = await response.json();
        const distance = { run: json.all_run_totals.distance / 1000, ride: json.all_ride_totals.distance / 1000 };
        return distance;
    } catch (error) {
        console.error('Error getting athlete ride total:', error);
        throw error;
    }
}


async function updateDescription(refresh_token, activity_id, description) {
    const data = authenticate(refresh_token)
    const activityData = getActivityData(activity_id, data.access_token)

    const currentDescription = activityData.description || '';
    let updatedDescription = null;
    if (currentDescription != '') {
        updatedDescription = `${currentDescription}\n${description}`;
    } else {
        updatedDescription = description;
    }
    const updated_fields = {
        description: updatedDescription
    };
    updateActivity(activity_id, data, updated_fields)
}


async function updateActivityType(refresh_token, activity_id, newType) {
    const data = authenticate(refresh_token)
    const activityData = getActivityData(activity_id, data.access_token)

    if (newType.name == "") { // set to "{Morning/Afternoon etc.} {newType}"
        const currentName = activityData.name || '';
        let currNameSplit = currentName.split(" ");
        if (currNameSplit.length > 1) {
            currNameSplit = [currNameSplit[0], newType.type];
        }
        newType.name = currNameSplit.join(" ");
    }
    newType.type = newType.type.split(' ').join('')
    const updated_fields = {
        name: newType.name,
        type: newType.type
    };
    updateActivity(activity_id, data, updated_fields)

}


async function getActivityType(refresh_token, activity_id) {
    const data = authenticate(refresh_token)
    const activityData = getActivityData(activity_id, data.access_token)
    return activityData.type
}

async function uploadFITActivity(refresh_token, file, activityName) {
    const uploadUrl = 'https://www.strava.com/api/v3/uploads';
    const data = authenticate(refresh_token)
    const filePath = file;
    const name = activityName;
    const description = "test";

    // Create a new FormData object
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('name', name);
    formData.append('description', description)
    formData.append("trainer", "false");
    formData.append("commute", "false");
    formData.append("data_type", "fit");

    // Make a POST request using fetch
    const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${data.access_token}`,
            ...formData.getHeaders()
        },
    });
    console.log(response)
    if (!response.ok) {
        throw new Error(`Failed to upload activity: ${response.statusText}`);
    }

    const responseJSON= await response.json();
    return responseJSON;
}

async function deleteActivity(refresh_token, activity_id) {
    return
}

module.exports = {
    getAthleteActivityDistanceTotals,
    updateDescription,
    updateActivityType,
    getActivityType,
    getActivityData,
    uploadFITActivity,
    getActivityStream,
    authenticate
};