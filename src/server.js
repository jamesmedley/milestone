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

//connect to cities db
//const { MongoClient } = require('mongodb');
//const uri = 'mongodb://localhost:27017'; //heroku PaaS
//const client = new MongoClient(uri);

async function find_closest_match(distance) {
    try {
        await client.connect();

        const database = client.db('city_distances');
        const collection = database.collection('strava-distances-comparison');
        const queryValue = distance;
        const result = await collection
            .aggregate([
                {
                    $addFields: {
                        absoluteDifference: {
                            $abs: {
                                $subtract: ['$distance', queryValue],
                            },
                        },
                    },
                },
                {
                    $sort: {
                        absoluteDifference: 1,
                    },
                },
                {
                    $limit: 1,
                },
            ])
            .toArray();

        console.log(result);
        return result
    } finally {
        await client.close();
    }
}

//find_closest_match(1689.5).catch(console.error);
