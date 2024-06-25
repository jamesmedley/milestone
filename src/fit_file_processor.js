require('dotenv').config();
const ActivityEncoder = require('../fit-encoder-js-main/fitEncodeActivity.js').ActivityEncoder;
const strava_api = require('../src/strava_api.js')
const fs = require('fs');


async function buildActivityJSON(activityId, refresh_token){
    activity_data = await strava_api.getActivityData(activityId, refresh_token)
    var activityStream = { name: activity_data.name }
    activityStream.activity = await strava_api.getActivityStream(activityId, refresh_token);
    const restructuredData = { name: activityStream.name };
    activityStream.activity.forEach(item => {
        const { type, ...rest } = item;
        restructuredData[type] = rest;
    });
    restructuredData.durationSeconds = restructuredData.time.original_size
    // Add date info
    restructuredData.startTime = activity_data.start_date_local
    const date = new Date(restructuredData.startTime)
    date.setSeconds(date.getSeconds() + restructuredData.durationSeconds)
    const newDateStr = date.toISOString();
    restructuredData.completedDate = newDateStr
    // Add "totals"
    restructuredData.calories = activity_data.calories
    restructuredData.averageHeartRate = activity_data.average_heartrate
    restructuredData.maxHeartRate = activity_data.max_heartrate
    restructuredData.minHeartRate = Math.min(...restructuredData.heartrate.data)
    return restructuredData
}


async function saveActivityAsFit(activityId, refresh_token, filename) {
    try {
        var encoder = new ActivityEncoder(await buildActivityJSON(activityId, refresh_token));

        const arrayBuffer = encoder.getFile();
        const buffer = Buffer.from(arrayBuffer);

        fs.writeFileSync(filename, buffer);

        console.log(`File saved to ${filename}`);

        console.log(await strava_api.uploadFITActivity("f31ae34d3e2a497147c1ebc159dd77c22dba09c5",filename,"Test upload 1"))
    } catch (error) {
        console.error('Error creating FIT file:', error);
    }
}

async function main() {
    const activity_id = 11728817003
    const filename = 'resources/activity.fit';

    await saveActivityAsFit(activity_id, process.env.MY_REFRESH_TOKEN, filename);
}

main();