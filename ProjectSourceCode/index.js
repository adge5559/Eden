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
const fs = require("fs");
const {IncomingForm} = require('formidable');
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
      sections,
      is_logged_in: req.session.user
    });
  } catch (error) {
    console.log(err);
    res.render('pages/error', {message: 'Post not found'});
  }
});


// Comments
app.post('/post/:id/comment', async(req, res) => {
  // Make sure user is logged in
  if (!req.session.user) {
    return res.status(401).json({error: 'User not logged in'});
  }

  const postId = req.params.id;
  const commentText = req.body.commentText;
  const username = req.session.user.username;

  // Comment should not be empty
  if (!commentText || commentText.trim() === '') {
    return res.status(400).json({error: 'Comment text cannot be empty'});
  }
  
  try{
    await db.none(
      `INSERT INTO comments (postid, username, commenttext, createtime) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`
      , [postId, username, commentText]
    );

    const newComment = {
      username: username,
      commenttext: commentText,
      formattedCreateTime: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    res.json(newComment);
  } catch (error) {
      console.error('Error posting comment:', error);
      res.status(500).json({error: 'An error occurred while posting the comment'});
  }
});

// Likes
app.post('/post/:id/like', async(req, res) => {
  const postId = req.params.id;
  try {
    await db.none(
        `UPDATE posts SET likes = likes + 1 
        WHERE postid = $1`,
        [postId]
    );

    const updatedPost = await db.one(
      `SELECT likes FROM posts 
      WHERE postid = $1`
      , [postId]);

    res.json({likes: updatedPost.likes});
  } catch (error) {
    console.error('Error updating likes:', error);
    res.status(500).json({error: 'An error occurred while liking the post'});
  }
});


// Upload Page
app.get('/upload', (req, res) => {
  res.render('pages/upload');
});


// Save posts
app.post('/create-post', async (req, res) => {
  const form = new IncomingForm();
  form.uploadDir = path.join(__dirname, 'images/uploads');
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).send('An error occurred while uploading the files.');
    }

    console.log('Fields:', fields);
    console.log('Files:', files);

    try {
      const { title, descriptions, sectiontitle, content } = fields;
      const tags = Array.isArray(fields['tags[]']) ? fields['tags[]'] : [fields['tags[]']]; // Ensure tags are always an array

      // Insert post
      const post = await db.one(
        `INSERT INTO posts (username, title, descriptions, titleimagepath, createtime)
         VALUES ($1, $2, $3, '', CURRENT_TIMESTAMP)
         RETURNING postid`,
        [req.session.user.username, title, descriptions]
      );
      const postId = post.postid;

      // Save title image
      const postDir = path.join(__dirname, `images/Post/${postId}`);
      if (!fs.existsSync(postDir)) fs.mkdirSync(postDir, { recursive: true });

      if (files.titleimg && files.titleimg.filepath) {
        const titleImgPath = `/images/Post/${postId}/titleimg.jpg`;
        fs.renameSync(files.titleimg.filepath, path.join(postDir, 'titleimg.jpg'));

        // Update the database
        await db.none(
          `UPDATE posts SET titleimagepath = $1 WHERE postid = $2`,
          [titleImgPath, postId]
        );
      }

      // Insert tags
      for (const tagName of tags) {
        const tag = await db.oneOrNone(
          `INSERT INTO tags (tagname) VALUES ($1) 
           ON CONFLICT (tagname) DO NOTHING 
           RETURNING tagid`,
          [tagName]
        );

        const tagId = tag
          ? tag.tagid
          : (
              await db.one(`SELECT tagid FROM tags WHERE tagname = $1`, [tagName])
            ).tagid;

        await db.none(
          `INSERT INTO posttags (postid, tagid) VALUES ($1, $2)`,
          [postId, tagId]
        );
      }

      // Insert sections
      // Process sections
      if (fields['sectiontitle[]'] && fields['content[]']) {
        const sectionTitles = Array.isArray(fields['sectiontitle[]'])
          ? fields['sectiontitle[]']
          : [fields['sectiontitle[]']].filter(Boolean); // Normalize and filter empty
        const sectionContents = Array.isArray(fields['content[]'])
          ? fields['content[]']
          : [fields['content[]']].filter(Boolean); // Normalize and filter empty

        const sectionImages = files['imgpath[]']
          ? Array.isArray(files['imgpath[]'])
            ? files['imgpath[]']
            : [files['imgpath[]']]
          : [];

        for (let i = 0; i < sectionTitles.length; i++) {
          if (!sectionTitles[i] || !sectionContents[i]) {
            console.error(`Skipping section ${i + 1} due to missing title or content.`);
            continue; // Skip invalid sections
          }

          const sectionImagePath =
            sectionImages[i] && sectionImages[i].filepath
              ? `/images/Post/${postId}/section${i + 1}.jpg`
              : null;

          if (sectionImages[i] && sectionImages[i].filepath) {
            fs.renameSync(
              sectionImages[i].filepath,
              path.join(postDir, `section${i + 1}.jpg`)
            );
          }

          await db.none(
            `INSERT INTO sections (postid, sectiontitle, content, imgpath, createtime)
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
            [postId, sectionTitles[i], sectionContents[i], sectionImagePath]
          );
        }
      }


      res.redirect(`/post/${postId}`);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).send('An error occurred while creating the post.');
    }
  });
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