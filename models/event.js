const mongoose = require('mongoose');

const Schema = mongoose.Schema; //points at a constructor function which we can use to generate new schema objects

const eventSchema = new Schema({
	title: { type: String, required: true },
	description: { type: String, required: true },
	price: { type: Number, required: true },
	date: { type: Date, required: true }
});

module.exports = mongoose.model('Event', eventSchema);
