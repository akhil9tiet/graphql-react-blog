const express = require('express');
const bodyParser = require('body-parser');
const graphQLHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');

const app = express();

// const events = [];

app.use(bodyParser.json());

const events = (eventIds) => {
	return Event.find({ _id: { $in: eventIds } })
		.then((events) => {
			return events.map((event) => {
				return {
					...event._doc,
					_id: event.id,
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

// app.get('/', (req, res, next) =>{
//   res.send("hello world");
// })

app.use(
	'/graphql',
	graphQLHttp({
		schema: buildSchema(`
      type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
        creator: User!
      }

      type User{
        _id: ID!
        email: String!
        password: String
        createdEvents: [Event!]
      }

      input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      input UserInput {
        email: String!
        password: String!      
      }

      type RootQuery {
        events: [Event!]!
      }

      type RootMutation{
        createEvent(eventInput: EventInput): Event
        createUser(userInput: UserInput): User
      }
    
      schema {
        query: RootQuery
        mutation: RootMutation
      }
    `),
		//resolver
		rootValue: {
			events: () => {
				return (
					Event.find()
						//.populate('creator') //mongoose function populate will populate any relation it knows
						.then((events) => {
							return events.map((event) => {
								return {
									...event._doc,
									_id: event.id,
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
				// const event = {
				// 	_id: Math.random().toString(),
				// 	title: args.eventInput.title,
				// 	description: args.eventInput.description,
				// 	price: +args.eventInput.price,
				// 	date: args.eventInput.date
				// };
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
		},
		graphiql: true
	})
);

mongoose
	.connect(
		`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-dssse.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
	)
	.then(() => {
		app.listen(3000);
	})
	.catch((err) => {
		console.log(err);
	});
