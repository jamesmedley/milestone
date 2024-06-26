require('dotenv').config();
const path = require('path');
const fs = require('fs')
const fetch = require('node-fetch');
const strava_api = require('./strava_api.js');
var admin = require("firebase-admin");
const firebase = require('firebase');
const express = require('express');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json())
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_KEY,
    resave: false,
    saveUninitialized: true,
  })
);

var serviceAccount = require("../strava-distance-comparison-firebase-adminsdk-koc68-e74752edd8.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DB_DATABASE_URL
});

require('firebase/auth')
const firebaseConfig = {
  apiKey: process.env.DB_APIKEY,
  authDomain: process.env.DB_AUTH_DOMAIN,
  databaseURL: process.env.DB_DATABASE_URL,
  projectId: process.env.DB_PROJECT_ID,
  storageBucket: process.env.DB_STORAGE_BUCKET,
  messagingSenderId: process.env.DB_MESSAGING_SENDER_ID,
  appId: process.env.DB_APP_ID,
};

firebase.initializeApp(firebaseConfig);


//load activity descriptions
const cyclingDescriptionsData = JSON.parse(fs.readFileSync('resources/cycling-descriptions.json', 'utf8'))
const cyclingDescriptions = cyclingDescriptionsData.descriptions;
const runningDescriptionsData = JSON.parse(fs.readFileSync('resources/running-descriptions.json', 'utf8'))
const runningDescriptions = runningDescriptionsData.descriptions;


//connect to cities db
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://jamesmedley00:${encodeURIComponent(process.env.MONGODB_PASSWORD)}@milestone.abntden.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function find_closest_match(distance) {
  try {
    await client.connect();

    const database = client.db('milestone');
    const collection = database.collection('cities-distances');
    const queryValue = distance;

    const result = await collection
      .find({ distance: { $gte: queryValue } })
      .sort({ distance: 1 })
      .limit(1)
      .toArray();
    return result;
  } finally {
    await client.close();
  }
}

function round_1dp(number) {
  return Math.round(number * 10) / 10;
}


async function isEnableBikeDescription(athleteID) {
  const userRef = admin.database().ref(`/users/${athleteID}`);
  try {
    const snapshot = await userRef.once("value");
    const userData = snapshot.val();
    const enableBikeDescription = userData.enableBikeDescription;
    return enableBikeDescription;
  } catch {
    console.error("Error reading data:", error);
    throw error;
  }
}


async function isEnableRunDescription(athleteID) {
  const userRef = admin.database().ref(`/users/${athleteID}`);
  try {
    const snapshot = await userRef.once("value");
    const userData = snapshot.val();
    const enableRunDescription = userData.enableRunDescription;
    return enableRunDescription;
  } catch {
    console.error("Error reading data:", error);
    throw error;
  }
}


async function isEnableDescriptionChanges(athleteID) {
  const userRef = admin.database().ref(`/users/${athleteID}`);
  try {
    const snapshot = await userRef.once("value");
    const userData = snapshot.val();
    const enableDescriptionChanges = userData.enableDescriptionChanges;
    return enableDescriptionChanges;
  } catch {
    console.error("Error reading data:", error);
    throw error;
  }
}

async function isType(activity_id, athlete_id, type) {
  const userRef = admin.database().ref(`/users/${athlete_id}`);
  try {
    const snapshot = await userRef.once("value");
    const userData = snapshot.val();
    const refresh_token = userData.refreshToken;
    const activityType = await strava_api.getActivityType(refresh_token, activity_id);
    return activityType == type;
  } catch (error) {
    console.error("Error reading data:", error);
    throw error;
  }
}


async function getOverallRideDistance(athlete_id) {
  const userRef = admin.database().ref(`/users/${athlete_id}`);
  try {
    const snapshot = await userRef.once("value");
    const userData = snapshot.val(s);
    const refresh_token = userData.refreshToken;
    const rideTotal = await strava_api.getAthleteRideTotal(refresh_token, athlete_id);
    return rideTotal;
  } catch (error) {
    console.error("Error reading data:", error);
    throw error;
  }
}

async function getOverallRunDistance(athlete_id) {
  const userRef = admin.database().ref(`/users/${athlete_id}`);
  try {
    const snapshot = await userRef.once("value");
    const userData = snapshot.val();
    const refresh_token = userData.refreshToken;
    const rideTotal = await strava_api.getAthleteRunTotal(refresh_token, athlete_id);
    return rideTotal;
  } catch (error) {
    console.error("Error reading data:", error);
    throw error;
  }
}


function getRandomDescription(bike) {
  const descriptions = bike ? cyclingDescriptions : runningDescriptions;
  const randomIndex = Math.floor(Math.random() * descriptions.length);
  return descriptions[randomIndex];
}

async function updateActivityType(activity_id, athlete_id, newType) {
  const userRef = admin.database().ref(`/users/${athlete_id}`);
  try {
    const snapshot = await userRef.once("value");
    const userData = snapshot.val();
    const refresh_token = userData.refreshToken;
    await strava_api.updateActivityType(refresh_token, activity_id, newType);
  } catch (error) {
    console.error("Updating activity type:", error);
    throw error;
  }
}

async function checkRules(athlete_id, activity_id) {
  const userRef = admin.database().ref(`/users/${athlete_id}`);
  const snapshot = await userRef.once("value");
  const userData = snapshot.val();
  const refresh_token = userData.refreshToken;
  const activityType = await strava_api.getActivityType(refresh_token, activity_id);
  const activityRules = userData.activityRules;
  if(activityRules){
    for (let i = 0; i < activityRules.length; i++) {
      if (activityRules[i]["Original Type"] == activityType) {
        await updateActivityType(activity_id, athlete_id, { name: activityRules[i]["New Title"], type: activityRules[i]["New Type"] });
        return // only allowed one rule per activity type
      }
    }
  }
}

async function updateDescription(activity_id, athlete_id, bike) {
  const userRef = admin.database().ref(`/users/${athlete_id}`);
  try {
    const snapshot = await userRef.once("value");
    const userData = snapshot.val();
    const refresh_token = userData.refreshToken;
    const distance = bike ? await getOverallRideDistance(athlete_id) : await getOverallRunDistance(athlete_id);
    if (distance <= 20013.15) {
      const city_api_url = `https://${process.env.API_URL}/api/city-separation-distance?distance=${distance}`;
      try {
        const response = await fetch(city_api_url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.CITY_SEP_APIKEY
          },
        });
        if (response.ok) {
          const city_data = await response.json();
          const city1 = city_data[0].city1;
          const city2 = city_data[0].city2;

          const randomDescription = getRandomDescription(bike);
          const descriptionWithValues = randomDescription
            .replace('{x}', distance)
            .replace('{City1}', city1)
            .replace('{City2}', city2) + ' - by milestone.me.uk';

          await strava_api.updateDescription(refresh_token, activity_id, descriptionWithValues);
        } else {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
      }
    } else {
      const proportionOfEquator = round_1dp(100 * (distance / 40075));
      if (proportionOfEquator > 1) {
        const proportionOfWayToMoon = round_1dp(100 * (distance / 384400));
        const description = `You have now travelled ${distance}km. Thats ${proportionOfWayToMoon}% of the way to the moon! 🚀🌕`;
        await strava_api.updateDescription(refresh_token, activity_id, description);
      } else {
        const description = `You have now travelled ${distance}km. Thats ${proportionOfEquator}% of the way around the world! 🌎`;
        await strava_api.updateDescription(refresh_token, activity_id, description);
      }
    }
  } catch (error) {
    console.error("Error reading data:", error);
    throw error;
  }


}


function isValidApiKey(apiKey) {
  const validKey = process.env.CITY_SEP_APIKEY;
  return validKey == apiKey;
}


app.get('/api/city-separation-distance', async (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (isValidApiKey(authorization)) {
    try {
      const { distance } = req.query;
      const result = await find_closest_match(Number(distance));
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(401).json({ error: 'Invalid API Key' });
  }
});



app.get('/api/session', checkStravaAuth, (req, res) => {
  const sessionData = req.session;
  res.json(sessionData);
});


app.get('/api/athlete-data', checkStravaAuth, async (req, res) => {
  const athlete_id = req.query.athlete_id;
  if (athlete_id != req.session.athleteID) {
    res.json({ "Error": "Unauthorised" });
    return;
  }
  const userRef = admin.database().ref(`/users/${athlete_id}`);
  try {
    const snapshot = await userRef.once("value");
    const userData = snapshot.val();
    const activityRules = userData.activityRules;
    const athleteID = userData.athleteID;
    const athleteUsername = userData.athleteUsername;
    const athleteName = userData.athleteName;
    const athletePFP = userData.athletePFP;
    const enableDescriptionChanges = userData.enableDescriptionChanges;
    const enableRunDescription = userData.enableRunDescription;
    const enableBikeDescription = userData.enableBikeDescription;
    res.json({
      activityRules,
      athleteID,
      athleteUsername,
      athleteName,
      athletePFP,
      enableDescriptionChanges,
      enableRunDescription,
      enableBikeDescription
    })
  } catch (error) {
    console.error("Error reading data:", error);
    res.sendStatus(500);
  }
})


app.post('/api/save-preferences', checkStravaAuth, (req, res) => {
  try {
    const athleteID = req.session.athleteID;
    const userRef = admin.database().ref(`/users/${athleteID}`);
    const { enableRunDescription, enableBikeDescription, enableDescriptionChanges } = req.body;
    userRef.update({
      enableRunDescription,
      enableBikeDescription,
      enableDescriptionChanges,
    })
      .then(() => {
        return res.status(200).json({ message: 'Preferences saved successfully' });
      })
      .catch(error => {
        console.error('Error saving preferences:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      });
  } catch (error) {
    console.error('Error saving preferences:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/api/rules-update', checkStravaAuth, (req, res) => {
  try {
    const athleteID = req.session.athleteID;
    const userRef = admin.database().ref(`/users/${athleteID}`);
    const activityRules = req.body;
    userRef.update({
      activityRules
    })
      .then(() => {
        return res.status(200).json({ message: 'Preferences saved successfully' });
      })
      .catch(error => {
        console.error('Error saving preferences:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      });
  } catch (error) {
    console.error('Error saving preferences:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.delete('/api/delete-account', checkStravaAuth, async (req, res) => {
  const athleteID = req.session.athleteID;
  const userRef = admin.database().ref(`/users/${athleteID}`);

  try {
    const snapshot = await userRef.once('value');
    const userData = snapshot.val();
    const accessToken = userData.accessToken;

    const deauthorizeUrl = `https://www.strava.com/oauth/deauthorize?access_token=${accessToken}`;
    const deauthorizeResponse = await fetch(deauthorizeUrl, { method: 'POST' });
    if (!deauthorizeResponse.ok) {
      console.error('Deauthorization request failed:', deauthorizeResponse.statusText);
    }
    await userRef.remove();
    req.session.destroy(err => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      res.sendStatus(204);
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


function checkStravaAuth(req, res, next) {
  const athleteID = req.session.athleteID;
  if (athleteID) {
    next();
  } else {
    res.redirect('/');
  }
}


app.get('/dashboard', checkStravaAuth, (req, res) => {
  const dashboardPath = path.join(__dirname, '..', 'public', 'dashboard.html');
  res.sendFile(dashboardPath);
});

app.get('/privacy-policy', (req, res) => {
  const ppPath = path.join(__dirname, '..', 'public', 'privacy_policy.html');
  res.sendFile(ppPath);
});


app.get('/strava-auth', (req, res) => {
  if (req.session && req.session.athleteID) {
    res.redirect('/dashboard');
  } else {
    const stravaAuthUrl = `http://www.strava.com/oauth/authorize?client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=http://${process.env.API_URL}/exchange_token&approval_prompt=force&scope=read,activity:write,activity:read`;
    res.redirect(stravaAuthUrl);
  }
});


app.get('/exchange_token', async (req, res) => {
  const authorizationCode = req.query.code;
  if (req.query.scope != 'read,activity:write,activity:read') {
    res.redirect('/strava-auth');
    return;
  }
  const tokenExchangeUrl = 'https://www.strava.com/oauth/token';
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code: authorizationCode,
      grant_type: 'authorization_code',
    }),
  };
  try {
    const response = await fetch(tokenExchangeUrl, requestOptions);
    const data = await response.json();
    if (response.ok) {
      const accessToken = data.access_token;
      const refreshToken = data.refresh_token;
      const athleteID = data.athlete.id;
      const athleteUsername = data.athlete.username;
      const athleteName = data.athlete.firstname;
      var athletePFP = data.athlete.profile
      if(athletePFP === "avatar/athlete/large.png"){
        athletePFP = "https://d3nn82uaxijpm6.cloudfront.net/assets/avatar/athlete/large-800a7033cc92b2a5548399e26b1ef42414dd1a9cb13b99454222d38d58fd28ef.png";
      }
      const descriptionChanges = true;
      const runDescriptions = false;
      const bikeDescriptions = true;
      req.session.athleteID = athleteID;

      const userRef = admin.database().ref(`/users/${athleteID}`);
      const snapshot = await userRef.once('value');
      const userData = snapshot.val() || {};

      if (userData.enableDescriptionChanges === undefined) {
        userData.enableDescriptionChanges = descriptionChanges;
      }
      if (userData.enableRunDescription === undefined) {
        userData.enableRunDescription = runDescriptions;
      }
      if (userData.enableBikeDescription === undefined) {
        userData.enableBikeDescription = bikeDescriptions;
      }

      await userRef.update({
        accessToken,
        refreshToken,
        athleteID,
        athleteUsername,
        athleteName,
        athletePFP,
        enableDescriptionChanges: userData.enableDescriptionChanges,
        enableRunDescription: userData.enableRunDescription,
        enableBikeDescription: userData.enableBikeDescription,
      });
      res.redirect('/dashboard');
    } else {
      console.error('Token exchange failed:', data);
      res.status(500).json({ error: 'Token exchange failed' });
    }
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ error: 'Token exchange error' });
  }
});



app.post('/webhook', async (req, res) => {
  console.log("webhook event received!", req.query, req.body);
  res.status(200).send('EVENT_RECEIVED');
  if (req.body.aspect_type == 'create' && req.body.object_type == 'activity') {
    const activity_id = req.body.object_id;
    const athlete_id = req.body.owner_id;
    if (await isType(activity_id, athlete_id, "Ride") && await isEnableBikeDescription(athlete_id) && await isEnableDescriptionChanges(athlete_id)) {
      await updateDescription(activity_id, athlete_id, true);
    }
    if (await isType(activity_id, athlete_id, "Run") && await isEnableRunDescription(athlete_id) && await isEnableDescriptionChanges(athlete_id)) {
      await updateDescription(activity_id, athlete_id, false);
    }
    checkRules(athlete_id, activity_id); // update activty types/names
  }
})


app.get('/webhook', (req, res) => { // code from strava docs
  // Your verify token. Should be a random string.
  const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;
  // Parses the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Verifies that the mode and token sent are valid
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.json({ "hub.challenge": challenge });
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

async function deleteStravaWebhook(sub_id) {
  const subscriptionUrl = `https://www.strava.com/api/v3/push_subscriptions/${sub_id}`;
  const requestOptions = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET
    }),
  };
  try {
    const response = await fetch(subscriptionUrl, requestOptions);
    if (response.ok) {
      console.log('Webhook subscription successfully deleted.');
    } else {
      const responseData = await response.json();
      console.error('Failed to delete webhook subscription:', responseData);
    }
  } catch (error) {
    console.error('Error deleting webhook subscription:', error);
  }
}


async function viewStravaWebhooks() {
  const subscriptionUrl = `https://www.strava.com/api/v3/push_subscriptions/?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}`;
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  try {
    const response = await fetch(subscriptionUrl, requestOptions);
    if (response.ok) {
      const responseData = await response.json();
      console.log('Webhook subscriptions successfully received:');
    } else {
      console.error('Failed to retrieve webhook subscriptions:', response.statusText);
    }
  } catch (error) {
    console.error('Error retrieving webhook subscriptions:', error);
  }
}

async function createStravaWebhook() {
  const subscriptionUrl = 'https://www.strava.com/api/v3/push_subscriptions';
  const callbackUrl = 'https://milestone.me.uk/webhook'; //temporary ngrok public domain
  await viewStravaWebhooks()
  await deleteStravaWebhook(process.env.WEBHOOK_ID)
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      callback_url: callbackUrl,
      verify_token: process.env.WEBHOOK_VERIFY_TOKEN,
    }),
  };

  try {
    const response = await fetch(subscriptionUrl, requestOptions);
    if (response.ok) {
      const responseData = await response.json();
      process.env.WEBHOOK_ID = responseData.id
      console.log('Webhook subscription created:', responseData);
    } else {
      console.error('Failed to create webhook subscription:', response.statusText);
    }
  } catch (error) {
    console.error('Error creating webhook subscription:', error);
  }
}
//createStravaWebhook(); // create strava webhook


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});