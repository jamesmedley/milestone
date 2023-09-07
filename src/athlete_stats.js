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

module.exports = {
    getAthleteRideTotal
};