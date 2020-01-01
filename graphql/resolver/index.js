const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');

const events = (eventIds) => {
	return Event.find({ _id: { $in: eventIds } })
		.then((events) => {
			return events.map((event) => {
				return {
					...event._doc,
					_id: event.id,
					date: new Date(event._doc.date).toISOString(),
					creator: user.bind(this, event.creator) //creator does not hold single value but will call a function when you try to access it
				};
			});
		})
		.catch((err) => {
			throw err;
		});
};

//logic to fetch user by ID
const user = (userId) => {
	return User.findById(userId)
		.then((user) => {
			return {
				...user._doc,
				_id: user.id,
				createdEvents: events.bind(this, user._doc.createdEvents)
			};
		})
		.catch((err) => {
			throw err;
		});
};

module.exports = {
	events: () => {
		return (
			Event.find()
				//.populate('creator') //mongoose function populate will populate any relation it knows
				.then((events) => {
					return events.map((event) => {
						return {
							...event._doc,
							_id: event.id,
							date: new Date(event._doc.date).toISOString(),
							creator: user.bind(this, event._doc.creator)
							// {
							// 	...event._doc.creator._doc,
							// 	_id: event._doc.creator.id
							// }
						};
					});
				})
				.catch((err) => {
					throw err;
				})
		);
	},
	createEvent: (args) => {
		const event = new Event({
			title: args.eventInput.title,
			description: args.eventInput.description,
			price: +args.eventInput.price,
			date: new Date(args.eventInput.date),
			creator: '5e0ae448bcb3823a7fe0cb63' //mongoose will convert this to object id
		});
		let createdEvent;
		// events.push(event);
		return event
			.save()
			.then((result) => {
				createdEvent = {
					...result._doc,
					_id: result._doc._id.toString(),
					date: new Date(event._doc.date).toISOString(),
					creator: user.bind(this, result._doc.creator)
				};
				return User.findById('5e0ae448bcb3823a7fe0cb63');
			})
			.then((user) => {
				if (!user) {
					throw new Error('User not found.');
				}
				user.createdEvents.push(event);
				return user.save();
			})
			.then((result) => {
				return createdEvent;
			})
			.catch((err) => {
				console.log(err);
				throw err;
			});
	},
	createUser: (args) => {
		return User.findOne({ email: args.userInput.email })
			.then((user) => {
				if (user) {
					throw new Error('User already exists.');
				}
				return bcrypt.hash(args.userInput.password, 12);
			})
			.then((hashedPassword) => {
				const user = new User({
					email: args.userInput.email,
					password: hashedPassword
				});
				return user.save();
			})
			.then((result) => {
				return { ...result._doc, password: null, _id: result.id };
			})
			.catch((err) => {
				throw err;
			});
	}
};
