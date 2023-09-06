require('dotenv').config();

const auth_link = "https://www.strava.com/oauth/token";

async function getAthleteRideTotal(res, athlete_id) {
    const stats_link = `https://www.strava.com/api/v3/athletes/${athlete_id}/stats?access_token=${res.access_token}`;
    response = await fetch(stats_link)
    const json = await response.json()
    const distance = json.all_ride_totals.distance/1000
    console.log(distance)
    return distance
}

function reAuthorise() {
    fetch(auth_link, {
        method: 'post',
        headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        refresh_token: process.env.REFRESH_TOKEN,
        grant_type: 'refresh_token'
        })
    })
    .then(res => res.json())
    .then(res => getAthleteRideTotal(res, 63721242))
    .catch(error => {
      console.error('Error re-authorizing:', error);
    });
}

reAuthorise()