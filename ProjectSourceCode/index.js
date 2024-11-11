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

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

//paths

app.get('/', (req, res) => {
    res.render('pages/discover');
});

app.get('/discover', (req, res) => {
  res.render('pages/discover');
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
  const userSearch = await db.any('SELECT * FROM users WHERE username = $1', username);

  if(userSearch.length != 0){
    res.render('pages/register', {message: "There is already a user with that username"})
  } else if(username.length == 0){
    res.render('pages/register', {message: "You must provide a username"})
  } else if(password.length == 0){
    res.render('pages/register', {message: "You must provide a password"})
  } else{
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      await db.none('INSERT INTO users(username, password) VALUES($1, $2)', [username, hashedPassword]);

      res.redirect('/login');
    } catch (error) {
      console.error('Error inserting user:', error.message || error);
      res.render('/register');
    }
  }
});
//login.hbs
//login
app.get('/login', (req, res) => {
  
  res.render('pages/login');

});

app.post('/login', async (req, res) => {
  const username = req.body.username; //get username
  const password = req.body.password; //get password
  const query = 'SELECT * FROM users WHERE username = $1 LIMIT 1'; //query to find user by username
  const values = [username];

  try {
      //get user details from the db
      const userSearch = await db.oneOrNone(query, values);
      //if no user found send to register
      if (!userSearch) {
          return res.render('pages/login', { message: 'User not found. Please register.', error: true });
      }
      //compare the entered password with the stored hashed password
      const match = await bcrypt.compare(password, userSearch.password);
      //if passwords don't match error
      if (!match) {
          return res.render('pages/login', { message: 'Incorrect username or password.', error: true });
      }
      //save user session
      req.session.user = {
          username: userSearch.username,
      };
      req.session.save();
      //send to the discover page if login is correct
      res.redirect('/discover');
  } catch (err) { //if error
      console.log(err);
      res.render('pages/login', { message: 'An error occurred. Please try again.', error: true });
  }
});

<<<<<<< HEAD
app.get('/discover', (req, res) => {
  res.render('pages/home');
});

app.get('/profile', (req, res) => {
  res.render('pages/profile');
});
=======
//logout
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
      if (err) {
          return res.status(500).send('Unable to log out');
      }
      res.render('pages/logout', { message: 'Logged out Successfully' }); 
  });
});


>>>>>>> 0f19ecd89df39cfc43d129378f6d00e26fff8b0f
