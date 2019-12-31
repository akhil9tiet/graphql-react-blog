const mongoose = require('mongoose');

const Schema = mongoose.Schema; //points at a constructor function which we can use to generate new schema objects

const userSchema = new Schema({
	email: { type: String, required: true },
	password: { type: String, required: true },
	createdEvents: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Event'
		}
	] //which user created which events
});

module.exports = mongoose.model('User', userSchema);
