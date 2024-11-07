const express = require('express'); // To build an application server or API
const app = express();
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcryptjs'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part C.

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: __dirname + '/views/layouts',
  partialsDir: __dirname + '/views/partials',
});


// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};
const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

//paths

app.get('/', (req, res) => {
    res.render('pages/home');
});

app.get('/welcome', (req, res) => {
  res.json({status: 'success', message: 'Welcome!'});
});
module.exports = app.listen(3000);

console.log('Server is listening on port 3000');

//register
app.get('/register', (req, res) => {
  res.render('pages/register'); 
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.none('INSERT INTO users(username, password) VALUES($1, $2)', [username, hashedPassword]);

    res.redirect('/login');
  } catch (error) {
    console.error('Error inserting user:', error.message || error);
    res.redirect('/register');
  }
});


//login.hbs
//login
app.get('/login', (req, res) => {
  
  res.render('pages/login');

});

app.post('/login', async (req, res) => {
const username = req.body.username; // Get username from the request body
const password = req.body.password; // Get password from the request body
const query = 'SELECT * FROM users WHERE username = $1 LIMIT 1'; // Query to find user by username
const values = [username];

try {
    const user = await db.one(query, values);  
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        return res.render('pages/login', { message: 'Incorrect username or password.', error: true });
    }

    req.session.user = {
        username: user.username,
    };
    req.session.save();

    res.redirect('/discover');
} catch (err) {
    console.log(err);
    if (err.code === 0) { 
        return res.redirect('/register');
    }

    res.render('pages/login', { message: 'An error occurred. Please try again.', error: true });
}
});

