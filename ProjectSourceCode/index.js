


/////////////////////////////////////
const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const path = require('path');
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const fs = require('fs');
const { IncomingForm } = require('formidable');
const bcrypt = require('bcryptjs');
const axios = require('axios');


// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: __dirname + '/views/layouts',
  partialsDir: __dirname + '/views/partials',
});


// database configuration
const dbConfig = {
  host: process.env.HOST, // the database server
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



app.get('/', (req, res) => {res.redirect('/discover');});
app.get('/discover', async (req, res) => {
  try {
    // Fetch all posts from the database
    const posts = await db.query('SELECT postid, title, titleimg, descriptions FROM posts'); // Adjust query as needed

    // Render the page and pass the posts data
    res.render('pages/discover', { posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).send('An error occurred while fetching posts.');
  }
});
app.get('/welcome', (req, res) => {
  res.json({status: 'success', message: 'Welcome!'});
});

const PORT = process.env.PORT || 3000; // Port provided by Render
const HOST = '0.0.0.0'; // Bind to all interfaces

app.listen(PORT, HOST, () => {
  console.log(`Server is listening on port 10000`);
});

module.exports = app; // Export the app for testing or modularization

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
      message: 'You are already logged in. Would you like to make a new account?', 
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
    req.session.destroy(err => { //end session
        if (err) { //error
            return res.status(500).send('Unable to log out');
        }
        res.render('pages/logout', { message: 'Logged out Successfully' });  //logged out !
    });
  }
});

//pathing to profile
app.get('/profile', (req, res) => {
  const bruh = req.session.user?.username;
  if(bruh){
    res.redirect('/user/' + req.session.user.username);
  } else{
    res.render('pages/profileerr', { message: 'You are not logged in.', error: true });
  }
});

app.get("/user/:username", async (req, res) => {
  //finds this user within the db with this persons username
  const userSearch = await db.oneOrNone('SELECT * FROM users WHERE username = $1', req.params.username);
  if (!userSearch) { //if the username is not found
    res.render('pages/profileerr', { message: 'User not found.', error: true });
  } 
  else{ //user is found!
    //find all posts this user has made
    const userPostIDs = await db.any(`SELECT postid FROM posts WHERE username = $1`, [req.params.username]);

    let posts = [] //where posts we find in the next step go


    for(const postIDObj of userPostIDs){ //iterate through all the posts found from this user
      const postID = postIDObj.postid //gets the postid of the post and assigns it to this postID var
      try {
        const post = await db.oneOrNone( //getting the post details/information using the postID (oneOrNone mean it either returns a single post or nothing)
          'SELECT * FROM posts WHERE postid = ' + postID);

        if (!post) { //if the post is not found in the database then error
          return res.render('pages/error', {message: 'Error getting user posts'});
        }

        //format for when the post was posted/created
        post.formattedCreateTime = new Date(post.createtime).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Denver'
        });

        //getting user information that is displayed on the post
        const user = await db.oneOrNone(
          `SELECT username, profilepicture FROM users 
          WHERE username = $1`, 
          [post.username]);

        //getting comments for the post
        const comments = await db.any(
          `SELECT * FROM comments
           WHERE postid = $1 
           ORDER BY createtime`
          , [postID]);

        //format the time each comment was posted
        comments.forEach(comment => {
          comment.formattedCreateTime = new Date(comment.createtime).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'America/Denver'
          });
        });

        //getting the tags for the post
        const tags = await db.any(`
          SELECT tags.tagname 
          FROM posttags 
          JOIN tags ON posttags.tagid = tags.tagid 
          WHERE posttags.postid = $1
        `, [postID]);

        //getting the sections (other info than title, image, and description) for the post
        const sections = await db.any(
          `SELECT * FROM sections 
          WHERE postid = $1 
          ORDER BY createtime ASC`
          , [postID]);

        posts.push({post, user, comments, tags, sections}); //combines all this data we just got into a single obj, then adds it to the posts array
      } catch (error) { //error
        console.log(error);
        res.render('pages/error', {message: 'An unexpected error has occurred'});
      }
    }

    //if user viewing their own profile page...set isSelf to true
    if(req.session.user && userSearch.username == req.session.user.username){
      res.render('pages/user', {user: userSearch, posts: posts, isSelf: true});
    } 
    //if user is viewing someone elses profile page...
    else{
      res.render('pages/user', {user: userSearch, posts: posts});
    }
  }
});

// Post page
app.get('/post/:id', async(req, res) => {
  const postId = req.params.id; //gets the id param from the url (:id)

  try {
    //retreives the post with this postID from the posts table
    const post = await db.oneOrNone(
      `SELECT * FROM posts 
      WHERE postid = $1`, 
      [postId]);

    //is no such post exists...error
    if (!post) {
      return res.render('pages/error', {message: 'Post not found'});
    }

    //format for when posts were created
    post.formattedCreateTime = new Date(post.createtime).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Denver'
    });

    //get user info for post
    const user = await db.oneOrNone(
      `SELECT username, profilepicture FROM users 
      WHERE username = $1`, 
      [post.username]);

    //get comments of the post
    const comments = await db.any(
      `SELECT * FROM comments
       WHERE postid = $1 
       ORDER BY createtime`
      , [postId]);

    //format for when comments were created
    comments.forEach(comment => {
      comment.formattedCreateTime = new Date(comment.createtime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Denver'
      });
    });

    //get the posts tags
    const tags = await db.any(`
      SELECT tags.tagname 
      FROM posttags 
      JOIN tags ON posttags.tagid = tags.tagid 
      WHERE posttags.postid = $1
    `, [postId]);

    //getting the sections (other info than title, image, and description) for the post
    const sections = await db.any(
      `SELECT * FROM sections 
      WHERE postid = $1 
      ORDER BY createtime ASC`
      , [postId]);

    //get the description of the post
    const descriptions = await db.any(
    `SELECT descriptions FROM posts 
      WHERE postid = $1`
      , [postId]);
      //console.log('Comments fetched:', comments);

    //render the post_page template using the data passed below
    res.render('pages/post_page', {
      post,
      descriptions,
      user,
      comments,
      tags,
      sections,
      is_logged_in: req.session.user
    });
  } catch (error) { //errors
    console.log(err);
    res.render('pages/error', {message: 'Post not found'});
  }
});


// Comments
app.post('/post/:postid/comment', async(req, res) => {
  //check if user is logged in, if they are not then user gets the error below
  if (!req.session.user) {
    return res.status(401).json({error: 'User not logged in'});
  }

  const postId = req.params.postid; //getting postID data from the url (:postid)
  const commentText = req.body.commentText; //getting what the comment says
  const username = req.session.user.username; //getting the commenters username

  //Error for if the comment is left empty
  if (!commentText || commentText.trim() === '') { //text is null or undef || comment only has whitespace
    return res.status(400).json({error: 'Comment text cannot be empty'});
  }

  try{
    //adds comment to database if it passes the checks above
    await db.none(
      `INSERT INTO comments (postid, username, commenttext, createtime) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`
      , [postId, username, commentText]
    );

    //creates an object for the new comment, containing th data below
    const newComment = {
      postid: postId,
      username: username,
      commenttext: commentText,
      formattedCreateTime: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Denver'
      })
    };

    res.json(newComment); //shows/updates the comment on the users page without them having to refresh
  } catch (error) { //error
      console.error('Error posting comment:', error);
      res.status(500).json({error: 'An error occurred while posting the comment'});
  }
});


// Likes
app.post('/post/:id/like', async(req, res) => {
  const postId = req.params.id; //gets the postID from the url (:id)
  try {
    //add a like to the like count
    await db.none(
        `UPDATE posts SET likes = likes + 1 
        WHERE postid = $1`,
        [postId]
    );

    //get updated like count for the post
    const updatedPost = await db.one(
      `SELECT likes FROM posts 
      WHERE postid = $1`
      , [postId]);

    res.json({likes: updatedPost.likes});//shows the new like count without the user hvaing to update the page
  } catch (error) {//error case
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
  form.uploadDir = path.join(__dirname, '../mnt/uploads/images');
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
      if (err) {
          console.error('Error parsing form:', err);
          return res.status(500).send('An error occurred while uploading the files.');
      }

      const fieldsData = Object.entries(fields).map(([name, value]) => ({ name, value }));

      try {
          const { title, descriptions } = fields;
          const tags = [];
          for (const [key, value] of Object.entries(fields)) {
              if (key.startsWith('tag') && value.trim()) {
                  tags.push(value.trim());
              }
          }

          const sectionTitles = [];
          const sectionContents = [];
          for (const [key, value] of Object.entries(fields)) {
              if (key.startsWith('sectiontitle') && value.trim()) {
                  sectionTitles.push(value.trim());
              }
              if (key.startsWith('content') && value.trim()) {
                  sectionContents.push(value.trim());
              }
          }

          const sectionImages = [];
          for (const [key, file] of Object.entries(files)) {
              if (key.startsWith('imgpath') && file.filepath) {
                  sectionImages.push(file);
              }
          }

          // Insert post
          const post = await db.one(
              `INSERT INTO posts (username, title, descriptions, titleimg, createtime)
               VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
               RETURNING postid`,
              [req.session.user.username, title, descriptions, null]  // Set titleimg to null for now
          );
          const postId = post.postid;

          // Save title image as BYTEA
          let titleImgBuffer = null;
          if (files.titleimg && files.titleimg.filepath) {
              titleImgBuffer = fs.readFileSync(files.titleimg.filepath); // Read file as Buffer
              await db.none(`UPDATE posts SET titleimg = $1 WHERE postid = $2`, [titleImgBuffer, postId]);
          }

          // Insert tags
          for (const tagName of tags) {
              if (tagName.trim()) {
                  const tag = await db.oneOrNone(
                      `INSERT INTO tags (tagname) VALUES ($1)
                       ON CONFLICT (tagname) DO NOTHING
                       RETURNING tagid`,
                      [tagName]
                  );

                  const tagId = tag
                      ? tag.tagid
                      : (await db.one(`SELECT tagid FROM tags WHERE tagname = $1`, [tagName])).tagid;

                  await db.none(`INSERT INTO posttags (postid, tagid) VALUES ($1, $2)`, [postId, tagId]);
              }
          }

          // Insert sections
          for (let i = 0; i < sectionTitles.length; i++) {
            if (!sectionTitles[i] || !sectionContents[i]) continue;

            let sectionImageBuffer = null; // Default image is null

            // Check if image is valid
            if (
                sectionImages[i] &&
                sectionImages[i].filepath &&
                sectionImages[i].originalFilename.trim() !== '' &&
                sectionImages[i].size > 0
            ) {
                sectionImageBuffer = fs.readFileSync(sectionImages[i].filepath); // Read image as Buffer
            }

            // Insert into database
            await db.none(
                `INSERT INTO sections (postid, sectiontitle, content, img, createtime)
                 VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
                [postId, sectionTitles[i], sectionContents[i], sectionImageBuffer]
            );
          }

          res.redirect(`/post/${postId}`);
      } catch (error) {
          console.error('Error creating post:', error);
          res.status(500).render('pages/error', { message: 'An error occurred while creating the post.' });
      }
  });
});



//Search Page
app.get('/search', async (req, res) => {
  const { query } = req.query;
  try {
    const posts = await db.any(`
      SELECT DISTINCT p.* 
      FROM posts p
      LEFT JOIN posttags pt ON p.postid = pt.postid
      LEFT JOIN tags t ON pt.tagid = t.tagid
      WHERE p.title ILIKE $1 
         OR p.descriptions ILIKE $2
         OR t.tagname ILIKE $3
    `, [`%${query}%`, `%${query}%`, `%${query}%`]);

    res.render('pages/discover', { posts });
  } catch (error) {
    console.error('Error searching for posts:', error);
    res.status(500).send('An error occurred while searching for posts.');
  }
});
