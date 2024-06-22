const ValueType = {
	enum: 0x00,
	sint8: 0x01,
	uint8: 0x02,
	sint16: 0x83,
	uint16: 0x84,
	sint32: 0x85,
	uint32: 0x86,
	string: 0x07,
	float32: 0x88,
	float64: 0x89,
	uint8z: 0x0A,
	uint16z: 0x8B,
	uint32z: 0x8C,
	byte: 0x0D,
	sint64: 0x8E,
	uint64: 0x8F,
	uint64z: 0x90
};

const constant_types = {
	activity: ValueType.enum,
	activity_class: ValueType.enum,
	activity_level: ValueType.enum,
	activity_subtype: ValueType.enum,
	activity_type: ValueType.enum,
	analog_watchface_layout: ValueType.enum,
	ant_network: ValueType.enum,
	antplus_device_type: ValueType.uint8,
	attitude_stage: ValueType.enum,
	attitude_validity: ValueType.uint16,
	auto_activity_detect: ValueType.uint32,
	auto_sync_frequency: ValueType.enum,
	autolap_trigger: ValueType.enum,
	autoscroll: ValueType.enum,
	backlight_mode: ValueType.enum,
	backlight_timeout: ValueType.uint8,
	battery_status: ValueType.uint8,
	bench_press_exercise_name: ValueType.uint16,
	bike_light_beam_angle_mode: ValueType.uint8,
	bike_light_network_config_type: ValueType.enum,
	body_location: ValueType.enum,
	bp_status: ValueType.enum,
	calf_raise_exercise_name: ValueType.uint16,
	camera_event_type: ValueType.enum,
	camera_orientation_type: ValueType.enum,
	cardio_exercise_name: ValueType.uint16,
	carry_exercise_name: ValueType.uint16,
	checksum: ValueType.uint8,
	chop_exercise_name: ValueType.uint16,
	climb_pro_event: ValueType.enum,
	comm_timeout_type: ValueType.uint16,
	connectivity_capabilities: ValueType.uint32z,
	core_exercise_name: ValueType.uint16,
	course_capabilities: ValueType.uint32z,
	course_point: ValueType.enum,
	crunch_exercise_name: ValueType.uint16,
	curl_exercise_name: ValueType.uint16,
	date_mode: ValueType.enum,
	date_time: ValueType.uint32,
	day_of_week: ValueType.enum,
	deadlift_exercise_name: ValueType.uint16,
	device_index: ValueType.uint8,
	digital_watchface_layout: ValueType.enum,
	display_heart: ValueType.enum,
	display_measure: ValueType.enum,
	display_orientation: ValueType.enum,
	display_position: ValueType.enum,
	display_power: ValueType.enum,
	dive_alarm_type: ValueType.enum,
	dive_backlight_mode: ValueType.enum,
	dive_gas_status: ValueType.enum,
	event: ValueType.enum,
	event_type: ValueType.enum,
	exd_data_units: ValueType.enum,
	exd_descriptors: ValueType.enum,
	exd_display_type: ValueType.enum,
	exd_layout: ValueType.enum,
	exd_qualifiers: ValueType.enum,
	exercise_category: ValueType.uint16,
	favero_product: ValueType.uint16,
	file_flags: ValueType.uint8z,
	fit_base_type: ValueType.uint8,
	fit_base_unit: ValueType.uint16,
	fitness_equipment_state: ValueType.enum,
	flye_exercise_name: ValueType.uint16,
	garmin_product: ValueType.uint16,
	gender: ValueType.enum,
	goal: ValueType.enum,
	goal_recurrence: ValueType.enum,
	goal_source: ValueType.enum,
	hip_raise_exercise_name: ValueType.uint16,
	hip_stability_exercise_name: ValueType.uint16,
	hip_swing_exercise_name: ValueType.uint16,
	hr_type: ValueType.enum,
	hr_zone_calc: ValueType.enum,
	hyperextension_exercise_name: ValueType.uint16,
	intensity: ValueType.enum,
	language: ValueType.enum,
	language_bits_0: ValueType.uint8z,
	language_bits_1: ValueType.uint8z,
	language_bits_2: ValueType.uint8z,
	language_bits_3: ValueType.uint8z,
	language_bits_4: ValueType.uint8z,
	lap_trigger: ValueType.enum,
	lateral_raise_exercise_name: ValueType.uint16,
	left_right_balance: ValueType.uint8,
	left_right_balance_100: ValueType.uint16,
	leg_curl_exercise_name: ValueType.uint16,
	leg_raise_exercise_name: ValueType.uint16,
	length_type: ValueType.enum,
	local_date_time: ValueType.uint32,
	local_device_type: ValueType.uint8,
	localtime_into_day: ValueType.uint32,
	lunge_exercise_name: ValueType.uint16,
	manufacturer: ValueType.uint16,
	mesg_count: ValueType.enum,
	mesg_num: ValueType.uint16,
	message_index: ValueType.uint16,
	olympic_lift_exercise_name: ValueType.uint16,
	plank_exercise_name: ValueType.uint16,
	plyo_exercise_name: ValueType.uint16,
	power_phase_type: ValueType.enum,
	pull_up_exercise_name: ValueType.uint16,
	push_up_exercise_name: ValueType.uint16,
	pwr_zone_calc: ValueType.enum,
	radar_threat_level_type: ValueType.enum,
	rider_position_type: ValueType.enum,
	row_exercise_name: ValueType.uint16,
	run_exercise_name: ValueType.uint16,
	schedule: ValueType.enum,
	segment_delete_status: ValueType.enum,
	segment_lap_status: ValueType.enum,
	segment_leaderboard_type: ValueType.enum,
	segment_selection_type: ValueType.enum,
	sensor_type: ValueType.enum,
	session_trigger: ValueType.enum,
	set_type: ValueType.uint8,
	shoulder_press_exercise_name: ValueType.uint16,
	shoulder_stability_exercise_name: ValueType.uint16,
	shrug_exercise_name: ValueType.uint16,
	side: ValueType.enum,
	sit_up_exercise_name: ValueType.uint16,
	source_type: ValueType.enum,
	sport: ValueType.enum,
	sport_bits_0: ValueType.uint8z,
	sport_bits_1: ValueType.uint8z,
	sport_bits_2: ValueType.uint8z,
	sport_bits_3: ValueType.uint8z,
	sport_bits_4: ValueType.uint8z,
	sport_bits_5: ValueType.uint8z,
	sport_bits_6: ValueType.uint8z,
	sport_event: ValueType.enum,
	squat_exercise_name: ValueType.uint16,
	stroke_type: ValueType.enum,
	sub_sport: ValueType.enum,
	supported_exd_screen_layouts: ValueType.uint32z,
	swim_stroke: ValueType.enum,
	switch: ValueType.enum,
	tap_sensitivity: ValueType.enum,
	time_into_day: ValueType.uint32,
	time_mode: ValueType.enum,
	time_zone: ValueType.enum,
	timer_trigger: ValueType.enum,
	tissue_model_type: ValueType.enum,
	tone: ValueType.enum,
	total_body_exercise_name: ValueType.uint16,
	triceps_extension_exercise_name: ValueType.uint16,
	turn_type: ValueType.enum,
	user_local_id: ValueType.uint16,
	warm_up_exercise_name: ValueType.uint16,
	watchface_mode: ValueType.enum,
	water_type: ValueType.enum,
	weather_report: ValueType.enum,
	weather_severe_type: ValueType.enum,
	weather_severity: ValueType.enum,
	weather_status: ValueType.enum,
	weight: ValueType.uint16,
	wkt_step_duration: ValueType.enum,
	wkt_step_target: ValueType.enum,
	workout_capabilities: ValueType.uint32z,
	workout_equipment: ValueType.enum,
	workout_hr: ValueType.uint32,
	workout_power: ValueType.uint32,
	file: ValueType.enum,
};

class Message {
	constructor(globalMessageNumber, messageClass, ...fieldNames)
	{
		this.globalMessageNumber = globalMessageNumber;
		this.writtenDefinitionMessage = false;
		this.fields = [];

		for (let key of fieldNames)
		{
			const field = messageClass[key];

			if (field === undefined)
				throw `unable to find ${key} in message definition`

			this.fields.push(new Field(field.id, field.type));
		}
	}

	// 16kB buffers
	static dataBuffer = null;

	static lastDefinitionMessage = null;

	get dataBuffer() { return Message.dataBuffer; }

	writeDefinition(definitions)
	{
		// is a definition message needed?
		// 1) if the last message differs by type; and
		// 2) it doesn't contain any variable length fields
		if (Message.lastDefinitionMessage == this.globalMessageNumber)
		{
			if (this.fields.every(field => field.type !== ValueType.string))
			{
				return;
			}
		}

		const headerSize = 6;
		let definitionSize = headerSize + (definitions.length * 3);
		let view = Message.dataBuffer.getChunk(definitionSize);

		view.setUint8(0, 0x40);
		view.setUint8(1, 0x00);
		view.setUint8(2, 0x00);
		view.setUint16(3, this.globalMessageNumber, true);
		view.setUint8(5, this.fields.length);

		for (const ix in definitions)
		{
			const definition = definitions[ix];
			view.setUint8(headerSize + (ix * 3), definition.field.id);
			view.setUint8(headerSize + (ix * 3 + 1), definition.size);
			view.setUint8(headerSize + (ix * 3 + 2), definition.field.type);
		}

		Message.lastDefinitionMessage = this.globalMessageNumber;
	}

	writeDataMessage(...values)
	{
		const items = this.fields.map((field, i) => {
			let descriptor = field.descriptor();
			let value = values[i];
			let size = field.type == ValueType.string
				? value.length + 1 : descriptor[0];
			return { field, value, size, descriptor }
		});

		this.writeDefinition(items);

		const headerSize = 1;
		let messageSize = items.reduce((acc, item) => acc + item.size, 0);

		let view = Message.dataBuffer.getChunk(headerSize + messageSize);
		view.setUint8(0, 0x00);
		let offset = 1;

		for (const item of items)
		{
			const func = item.descriptor[2];

			switch (item.field.type)
			{
				case ValueType.enum:
				case ValueType.uint8:
				case ValueType.sint8:
				case ValueType.byte:
				case ValueType.string:
					// neither of these take an endian parameter
					func.call(view, offset, item.field.value(item.value));
					break;
				case ValueType.sint64:
				case ValueType.uint64:
				case ValueType.uint64z:

				default:
					if (item.field.type > 0x90)
						throw `Invalid field type: ${item.field.type}`;

					// with endian set to little
					func.call(view, offset, item.field.value(item.value), true);
			}

			offset += item.size;
		}
	}
}

class Field {
	constructor(fieldId, valueType) {
		this.fieldId = fieldId;
		this.valueType = valueType;
	}

	get id() { return this.fieldId; }
	get type() {
		return this.descriptor()[3];
	}
	
	value(input) {
		if (input === undefined)
			// the invalid value
			return this.descriptor()[1];
		return input;
	}

	descriptor()
	{
		return Field.descriptorForType(this.valueType);
	}

	setString(offset, value)
	{
		for (let i = 0; i < value.length; ++i)
			this.setUint8(offset + i, value.charCodeAt(i));
		this.setUint8(offset + value.length, 0x00);
	}

	static descriptorForType(valueType)
	{
		switch (valueType)
		{
			case ValueType.enum:
				return [1, 0xFF, DataView.prototype.setUint8, ValueType.enum];
			case ValueType.sint8:
				return [1, 0x7F, DataView.prototype.setInt8, ValueType.sint8];
			case ValueType.uint8:
				return [1, 0xFF, DataView.prototype.setUint8, ValueType.uint8];
			case ValueType.sint16:
				return [2, 0x7FFF, DataView.prototype.setInt16, ValueType.sint16];
			case ValueType.uint16:
				return [2, 0xFFFF, DataView.prototype.setUint16, ValueType.uint16];
			case ValueType.sint32:
				return [4, 0x7FFFFFFF, DataView.prototype.setInt32, ValueType.sint32];
			case ValueType.uint32:
				return [4, 0xFFFFFFFF, DataView.prototype.setUint32, ValueType.uint32];
			case ValueType.string:
				return [1, "", Field.prototype.setString, ValueType.string];
			case ValueType.float32:
				return [4, 0xFFFFFFFF, DataView.prototype.setFloat32, ValueType.float32];
			case ValueType.float64:
				return [8, 0xFFFFFFFFFFFFFFFF, DataView.prototype.setFloat64, ValueType.float64];
			case ValueType.uint8z:
				return [1, 0x00, DataView.prototype.setUint8, ValueType.uint8z];
			case ValueType.uint16z:
				return [2, 0x0000, DataView.prototype.setUint16, ValueType.uint16z];
			case ValueType.uint32z:
				return [4, 0x00000000, DataView.prototype.setUint32, ValueType.uint32z];
			case ValueType.byte:
				return [1, 0xFF, DataView.prototype.setUint8, ValueType.byte];
			case ValueType.sint64:
				return [8, 0x7FFFFFFFFFFFFFFF, (dataView, offset) => {
					console.log('No support yet for signed 64-bit integers');
				}, ValueType.sint64];
			case ValueType.uint64:
				return [8, 0xFFFFFFFFFFFFFFFF, (dataView, offset) => {
					console.log('No support yet for unsigned 64-bit integers');
				}, ValueType.uint64];
			case ValueType.uint64z:
				return [8, 0x0000000000000000, (dataView, offset) => {
					console.log('No support yet for unsigned 64-bit integers');
				}, ValueType.uint64z];
			default:
				// Get the type from FitConstants
				return Field.descriptorForType(
					constant_types[valueType.__name]
				);
		}
	}
}


module.exports = {
	ValueType,
	Field,
	Message
}