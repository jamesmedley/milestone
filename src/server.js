require('dotenv').config();
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//firebase realtime setup
const firebase = require('firebase');
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


//firebase storage
const admin = require('firebase-admin');
const serviceAccount = require('strava-distance-comparison-firebase-adminsdk-koc68-c78ebcfc58.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.DB_STORAGE_STORAGE_BUCKET,
});

const storage = admin.storage();
const bucket = storage.bucket();

const file = bucket.file('cities_by_distance.json');

file.download({ destination: 'datasets/cities_by_distance.json' })
  .then(() => {
    console.log('File downloaded successfully.');
  })
  .catch((error) => {
    console.error('Error downloading file:', error);
  });
