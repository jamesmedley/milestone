require('dotenv').config();
const fetch = require('node-fetch');

const auth_link = "https://www.strava.com/oauth/token";


async function getAthleteRideTotal(refresh_token, athlete_id) {
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
        const data = await response.json();
        const stats_link = `https://www.strava.com/api/v3/athletes/${athlete_id}/stats?access_token=${data.access_token}`;
        try {
            const response = await fetch(stats_link);
            const json = await response.json();
            const distance = json.all_ride_totals.distance / 1000;
            return distance;
        } catch (error) {
            console.error('Error getting athlete ride total:', error);
            throw error;
        }

    } catch (error) {
        console.error('Error re-authorizing:', error);
        throw error;
    }
}


async function getAthleteRunTotal(refresh_token, athlete_id) {
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
        const data = await response.json();
        const stats_link = `https://www.strava.com/api/v3/athletes/${athlete_id}/stats?access_token=${data.access_token}`;
        try {
            const response = await fetch(stats_link);
            const json = await response.json();
            const distance = json.all_run_totals.distance / 1000;
            return distance;
        } catch (error) {
            console.error('Error getting athlete ride total:', error);
            throw error;
        }

    } catch (error) {
        console.error('Error re-authorizing:', error);
        throw error;
    }
}


async function updateDescription(refresh_token, activity_id, description) {
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
        const data = await response.json();
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

        const activityData = await activityResponse.json();

        const currentDescription = activityData.description || '';
        let updatedDescription = null;
        if (currentDescription != '') {
            updatedDescription = `${currentDescription}\n${description}`;
        } else {
            updatedDescription = description;
        }
        const updatableActivity = {
            description: updatedDescription
        };
        try {
            const response = await fetch(activity_link, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${data.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatableActivity)
            });
            console.log("Activity description updated.")
        } catch (error) {
            console.error('Error updating activity description:', error);
            throw error;
        }

    } catch (error) {
        console.error('Error re-authorizing:', error);
        throw error;
    }
}


async function updateActivityType(refresh_token, activity_id, newType) {
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

        const data = await response.json();
        const activity_link = `https://www.strava.com/api/v3/activities/${activity_id}`;

        const activityResponse = await fetch(activity_link, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${data.access_token}`
            }
        });

        if (!activityResponse.ok) {
            throw new Error('Failed to fetch activity data');
        }

        const activityData = await activityResponse.json();
        const currentName = activityData.name || '';
        if(newType.name == ""){ // set to "{Morning/Afternoon etc.} {newType}"
            let currNameSplit = currentName.split(" ");
            if (currNameSplit.length > 1) {
                currNameSplit = [currNameSplit[0], newType.type];
            }
            return currNameSplit.join(" ");
        }
        const updatableActivity = {
            name: newType.name,
            type: newType.type
        };

        try {
            const updateResponse = await fetch(activity_link, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${data.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatableActivity)
            });

            if (!updateResponse.ok) {
                throw new Error('Failed to update activity type');
            }

            console.log(`Activity ${activity_id} type updated to ${newType}.`);
        } catch (error) {
            console.error('Error updating activity type:', error);
            throw error;
        }

    } catch (error) {
        console.error('Error re-authorizing:', error);
        throw error;
    }
}


async function getActivityType(refresh_token, activity_id) {
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
        const data = await response.json();
        const activity_link = `https://www.strava.com/api/v3/activities/${activity_id}?include_all_efforts=False`;
        try {
            const response = await fetch(activity_link, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${data.access_token}`,
                    'Content-Type': 'application/json'
                },
            });
            const json = await response.json();
            const activity_type = json.type
            console.log("Activity found.")
            return activity_type
        } catch (error) {
            console.error('Error getting activity:', error);
            throw error;
        }

    } catch (error) {
        console.error('Error re-authorizing:', error);
        throw error;
    }
}

function splitCamelCase(string) {
    return string.replace(/([a-z])([A-Z])/g, '$1 $2');
}

module.exports = {
    getAthleteRideTotal,
    getAthleteRunTotal,
    updateDescription,
    updateActivityType,
    getActivityType
};