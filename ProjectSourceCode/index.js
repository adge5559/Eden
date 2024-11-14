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
//allows images to be rendered
app.use('/images', express.static(path.join(__dirname, 'images')));
// use resources folder
app.use('/resources', express.static(path.join(__dirname, 'resources')));

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

app.get('/', async (req, res) => {
  try {
    const plants = await db.any('SELECT * FROM plants');
    res.render('pages/discover', { plants });
  } catch (error) {
    console.error('Error fetching plants:', error);
    res.status(500).send('An error occurred while fetching plants.');
  }
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
  if (req.session.user) {
    return res.render('pages/login', { 
      message: 'You are already logged in. Would you like to log out?', 
      showLoginForm:false
    });
  }
  res.render('pages/login', {showLoginForm:true});

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

//logout
app.get('/logout', (req, res) => {
  if (!req.session.user) {  //check if user is logged in
    //if not then say to go to the login page
    return res.render('pages/logout', { message: 'You are not logged in. Please log in first.' });
  }
  else{
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Unable to log out');
        }
        res.render('pages/logout', { message: 'Logged out Successfully' }); 
    });
  }
});

//pathing to profile
app.get('/profile', (req, res) => {
  const bruh = req.session.user?.username
  if(bruh){
    res.render('pages/profile', {error: true, user: req.session.user});
  } else{
    res.render('pages/profileerr', { message: 'You are not logged in.', error: true });
  }
});

// Post page
app.get('/post/:id', async(req, res) => {
  const postId = req.params.id;
  
  try {
    const post = await db.oneOrNone(
      `SELECT * FROM posts 
      WHERE postid = $1`, 
      [postId]);

    if (!post) {
      return res.render('pages/error', {message: 'Post not found'});
    }
    
    // Format create time of posts
    post.formattedCreateTime = new Date(post.createtime).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Get user info of the post
    const user = await db.oneOrNone(
      `SELECT username, profilepicture FROM users 
      WHERE username = $1`, 
      [post.username]);

    // Get comments of the post
    const comments = await db.any(
      `SELECT * FROM comments
       WHERE postid = $1 
       ORDER BY createtime`
      , [postId]);
    
    // Format create time of comments
    comments.forEach(comment => {
      comment.formattedCreateTime = new Date(comment.createtime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    });

    // Get tags of the post
    const tags = await db.any(`
      SELECT tags.tagname 
      FROM posttags 
      JOIN tags ON posttags.tagid = tags.tagid 
      WHERE posttags.postid = $1
    `, [postId]);
    
    // Get sections of the post
    const sections = await db.any(
      `SELECT * FROM sections 
      WHERE postid = $1 
      ORDER BY createtime ASC`
      , [postId]);
    
    // Render the post view with all the data
    res.render('pages/post_page', {
      post,
      user,
      comments,
      tags,
      sections
    });
  } catch (error) {
    console.log(err);
    res.render('pages/error', {message: 'Post not found'});
  }
});

app.post('/post/:id/comment', async(req, res) => {
  const postId = req.params.id;
  const commentText = req.body.commentText;
  const commenterId = req.session.user.id;

  try{
    await db.none(
      `INSERT INTO comments (postid, userid, commenttext, createtime) 
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`
      , [postId, commenterId, commentText]
      );
      res.redirect(`/post/${postId}`);
  } catch (error) {
      console.error('Error posting comment:', error);
      res.redirect(`/post/${postId}`);
  }
});

app.post('/post/:id/like', async(req, res) => {
  const postId = req.params.id;
  try {
    await db.none(
        `UPDATE posts SET likes = likes + 1 
        WHERE postid = $1`,
        [postId]
    );
    res.redirect(`/post/${postId}`);
  } catch (error) {
    console.error('Error updating likes:', error);
    res.redirect(`/post/${postId}`);
  }
});


// Upload Page
app.get('/upload', (req, res) => {
  res.render('pages/upload');
});


app.get('/search', async (req, res) => {
  const { query } = req.query;

  try {
    const plants = await db.any('SELECT * FROM plants WHERE name ILIKE $1', [`%${query}%`]);
    res.render('pages/discover', { plants });
  } catch (error) {
    console.error('Error searching for plants:', error);
    res.status(500).send('An error occurred while searching for plants.');
  }
});