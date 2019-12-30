const express = require('express');
const bodyParser = require('body-parser');
const graphQLHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

app.use(bodyParser.json());

// app.get('/', (req, res, next) =>{
//   res.send("hello world");
// })

app.use(
	'/graphql',
	graphQLHttp({
		schema: buildSchema(`
    type RootQuery {
      events: [String!]!,

    }

    type RootMutation{
      createEvent(name: String): String
    }
    
    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
		//resolver
		rootValue: {
			events: () => {
				return ['hello say', 'all night coding'];
			},
			createEvent: (args) => {
				const eventName = args.name;
				return eventName;
			}
		},
		graphiql: true
	})
);

app.listen(3000);
