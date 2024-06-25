const { FitEncoder } = require("./fitEncoder");
const Message = require('./fitTypes').Message
const FitConstants = require('./fitConstants').FitConstants
const FitMessages = require('./fitMessages').FitMessages

class ActivityEncoder extends FitEncoder {
	constructor(activity) {
		super();

		this.activity = activity;

		const numRecords = activity.durationSeconds;

		let fileIdMessage = new Message(FitConstants.mesg_num.file_id,
			FitMessages.file_id,
			"time_created",
			"manufacturer",
			"product",
			"type");
		let eventMessage = new Message(FitConstants.mesg_num.event,
			FitMessages.event,
			"timestamp",
			"data",
			"event",
			"event_type");
		let deviceInfoMessage = new Message(FitConstants.mesg_num.device_info,
			FitMessages.device_info,
			"timestamp",
			"product_name",
			"manufacturer",
			"product",
			"device_index");
		let sportMessage = new Message(FitConstants.mesg_num.sport,
			FitMessages.sport,
			"sport",
			"sub_sport");
		let workoutMessage = new Message(FitConstants.mesg_num.workout,
			FitMessages.workout,
			"wkt_name",
			"sport",
			"sub_sport");
		let recordMessage = new Message(FitConstants.mesg_num.record,
			FitMessages.record,
			"timestamp",
			"heart_rate");
		let sessionMessage = new Message(FitConstants.mesg_num.session,
			FitMessages.session,
			"timestamp",
			"start_time",
			"total_elapsed_time",
			"total_timer_time",
			"total_calories",
			"event",
			"event_type",
			"sport",
			"sub_sport",
			"avg_heart_rate",
			"max_heart_rate",
			"min_heart_rate"
		);
		let activityMessage = new Message(FitConstants.mesg_num.activity,
			FitMessages.activity,
			"total_timer_time",
			"local_timestamp",
			"num_sessions",
			"type",
			"event",
			"event_type");

		const startTime = FitEncoder.toFitTimestamp(new Date(activity.startTime));
		const endTime = FitEncoder.toFitTimestamp(new Date(activity.completedDate));

		fileIdMessage.writeDataMessage(
			startTime, // time_created
			FitConstants.manufacturer.strava,
			0,
			FitConstants.file.activity
		);

		eventMessage.writeDataMessage(
			startTime,
			0,
			FitConstants.event.timer,
			FitConstants.event_type.start
		);

		deviceInfoMessage.writeDataMessage(
			startTime,
			"milestone.me.uk",
			FitConstants.manufacturer.strava,
			0,
			FitConstants.device_index.creator
		);

		sportMessage.writeDataMessage(
			FitConstants.sport.training,
			FitConstants.sub_sport.strength_training
		);

		workoutMessage.writeDataMessage(
			activity.name,
			FitConstants.sport.training,
			FitConstants.sub_sport.strength_training
		);

		// each sample is 1 second
		for (let ix = 0; ix < numRecords; ++ix) {
			recordMessage.writeDataMessage(
				startTime + ix,
				activity.heartrate.data[ix],
			);
		}

		eventMessage.writeDataMessage(
			endTime,
			0,
			FitConstants.event.timer,
			FitConstants.event_type.stop_all
		);

		eventMessage.writeDataMessage(
			endTime,
			0,
			FitConstants.event.session,
			FitConstants.event_type.stop_disable_all
		);

		sessionMessage.writeDataMessage(
			endTime,
			startTime,
			(endTime - startTime) * 1000,
			(endTime - startTime) * 1000,
			activity.calories,
			FitConstants.event.session,
			FitConstants.event_type.stop,
			FitConstants.sport.training,
			FitConstants.sub_sport.strength_training,
			activity.averageHeartRate,
			activity.maxHeartRate,
			activity.minHeartRate,
		);

		activityMessage.writeDataMessage(
			(endTime - startTime) * 1000,
			startTime,
			1,
			FitConstants.activity.manual,
			FitConstants.event.activity,
			FitConstants.event_type.stop
		);
	}
}

module.exports = {
	ActivityEncoder
}