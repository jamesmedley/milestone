require('dotenv').config();
const path = require('path');
const fetch = require('node-fetch');
const strava_api = require('./athlete_stats.js');
var admin = require("firebase-admin");
const firebase = require('firebase');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json())

var serviceAccount = require("../strava-distance-comparison-firebase-adminsdk-koc68-e74752edd8.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://strava-distance-comparison-default-rtdb.europe-west1.firebasedatabase.app"
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

//connect to cities db
const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017'; //heroku PaaS
const client = new MongoClient(uri);

async function find_closest_match(distance) {
    try {
        await client.connect();

        const database = client.db('city_distances');
        const collection = database.collection('strava-distances-comparison');
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


async function getOverallRideDistance(userUID) {
  const userRef = admin.database().ref(`/users/${userUID}`);
  try {
    const snapshot = await userRef.once("value");
    const userData = snapshot.val();
    const refresh_token = userData.refreshToken;
    const athlete_id = userData.athleteID;
    const rideTotal = await strava_api.getAthleteRideTotal(refresh_token, athlete_id);
    return rideTotal;
  } catch (error) {
    console.error("Error reading data:", error);
    throw error;
  }
}


function authenticateMiddleware(req, res, next) {
    const user = firebase.auth().currentUser;
  
    if (user) {
      req.user = user;
      next();
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  }


app.get('/api/city-separation-distance', authenticateMiddleware, async (req, res) => {
    const { distance } = req.query;
    try {
      const result = await find_closest_match(Number(distance));
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/google-signin', (req, res) => {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    // You can customize the permissions you request from the user here
    // provider.addScope('https://www.googleapis.com/auth/plus.login');
    
    firebase.auth().signInWithPopup(provider)
      .then((result) => {
        // Google Sign-In successful, result.user contains user info
        res.redirect('/dashboard'); // Redirect to a protected route or dashboard
      })
      .catch((error) => {
        res.status(401).json({ message: 'Google Sign-In failed', error: error.message });
      });
});


app.post('/register', (req, res) => {
    const { email, password } = req.body;

    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        res.status(201).json({ message: 'Registration successful', user });
      })
      .catch((error) => {
        res.status(400).json({ message: 'Registration failed', error: error.message });
      });
});


app.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        res.status(200).json({ message: 'Login successful', user });
      })
      .catch((error) => {
        res.status(401).json({ message: 'Login failed', error: error.message });
      });
});


app.post('/logout', (req, res) => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        res.status(200).json({ message: 'Logout successful' });
      })
      .catch((error) => {
        res.status(500).json({ message: 'Logout failed', error: error.message });
      });
});


app.get('/dashboard', authenticateMiddleware, (req, res) => {
    const dashboardPath = path.join(__dirname, '..', 'public', 'dashboard.html');
    res.sendFile(dashboardPath);
});


app.get('/strava-auth', authenticateMiddleware, (req, res) =>{
  const stravaAuthUrl = `http://www.strava.com/oauth/authorize?client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=http://localhost:3000/exchange_token&approval_prompt=force&scope=read,activity:write,activity:read`;
  res.redirect(stravaAuthUrl);
});


app.get('/exchange_token', authenticateMiddleware, async (req, res) => {
    const authorizationCode = req.query.code;
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
    
        const userUID = req.user.uid;

        const userRef = admin.database().ref(`/users/${userUID}`);
        await userRef.set({
          accessToken,
          refreshToken,
          athleteID,
          athleteUsername,
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
  

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});