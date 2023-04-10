### How to run

To run the project, you have to run the following command:

```
npm install
node server.js
```

When the application starts, it creates a file where the database will be contained (task_database.sqlite), it uses SQLite to achieve this. Some records are automatically created for you for testing purposes.

The front end has already been built and added to the public directory, so as soon as you start the application, you should be able to access it in you browser by going to localhost:8080.

Please note that, cors is currently disabled since it was used for testing purposes only but should be enabled when going to production.

#### Versions

The node version that I used v18.15.0 and the npm version 9.6.4.