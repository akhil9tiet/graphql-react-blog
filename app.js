const express = require('express');
const bodyParser = require('body-parser');
const graphQLHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const Event = require('./models/event');

const app = express();

// const events = [];

app.use(bodyParser.json());

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
      }

      input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      type RootQuery {
        events: [Event!]!
      }

      type RootMutation{
        createEvent(eventInput: EventInput): Event
      }
    
      schema {
        query: RootQuery
        mutation: RootMutation
      }
    `),
		//resolver
		rootValue: {
			events: () => {
				return events;
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
					date: new Date(args.eventInput.date)
				});
				// events.push(event);
				return event
					.save()
					.then((result) => {
						console.log(result);
						return { ...result._doc };
					})
					.catch((err) => {
						console.log(err);
						throw err;
					});
				return event;
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
