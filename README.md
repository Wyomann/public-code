# public-code

One Paragraph of project description goes here

## FacebookIntegration

This is a small service that validates the client token on the server side.  The app id and app secret are stored in environment variables.

## StripeIntegration

This is a service that creates and captures charges in Stripe.

## Example Stack

Example stack shows a mostly complete directory of tables/models/services/routes.  
* [migrations] - The "migrations" creates the tables and alters the table to add more columns.  
* [models] - The "models" are a class/ORM to the table.  They are instantiated into objects and have a state.  
* [routes] - The "routes" are public and private api paths for web applications or other customers to communicate with the serve.  In our case "private" just means it needs authentication via a JWT in order to be successful.
* [services] - The "services" are where the majority of the work is performed.  Logic or object manipulation is performed here along with querying the data.
* [tests] - The "tests" are where I've automated calling APIs and have ensured they are working correctly.  
