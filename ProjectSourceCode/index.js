const express = require('express'); // To build an application server or API
const app = express();
const handlebars = require('express-handlebars');
const path = require('path');
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcryptjs'); //  To hash passwords
const multer  = require('multer')

const storage = multer.memoryStorage()
const upload = multer({storage: storage})

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
const PORT = process.env.PORT || 3000; // Port provided by Render
const HOST = '0.0.0.0'; // Bind to all interfaces

app.listen(PORT, HOST, () => {
  console.log(`Server is listening on port 10000`);
});

module.exports = app; // Export the app for testing or modularization

app.get('/', (req, res) => {res.redirect('/discover');});
app.get('/discover', async (req, res) => {
  try {
    // Fetch all posts from the database
    const posts = await db.query('SELECT postid, title, titleimgbase, descriptions FROM posts ORDER BY createtime DESC');
    // Render the page and pass the posts data
    res.render('pages/discover', { posts, userdetails: req.session?.user?.username});
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).send('An error occurred while fetching posts. ' + error);
  }
});

//register
app.get('/register', (req, res) => {
  res.render('pages/register', { userdetails: req.session?.user?.username}); 
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

//login
app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.render('pages/login', { 
      message: 'You are already logged in. Would you like to make a new account?', 
      showLoginForm:false
    });
  }
  res.render('pages/login', {showLoginForm:true, userdetails: req.session?.user?.username});

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
    return res.render('pages/logout', { message: 'You are not logged in. Please log in first.', userdetails: req.session?.user?.username});
  }
  else{
    req.session.destroy(err => { //end session
        if (err) { //error
            return res.status(500).send('Unable to log out');
        }
        res.render('pages/logout', { message: 'Logged out Successfully', userdetails: req.session?.user?.username});  //logged out !
    });
  }
});

app.get('/profile', (req, res) => {
  //If there is no logged in user, req.session.user is undefined, and trying to access undefined.username crashes the web server
  //user?.username short circuits to undefined if user is undefined or null
  const username = req.session?.user?.username;
  if(username){
    res.redirect('/user/' + username);
  } else{
    res.render('pages/profileerr', { message: 'You are not logged in.', error: true, userdetails: req.session?.user?.username});
  }
});

app.get("/editprofile", async (req, res) =>{
  const username = req.session?.user?.username;
  if(username){
    const userSearch = await db.oneOrNone('SELECT * FROM users WHERE username = $1', username);
    res.render("pages/editprofile", {user: userSearch});
  } else{
    res.render('pages/profileerr', { message: 'You are not logged in.', error: true });
  }
})

//Endpoint for submitting the bio form
app.post('/editprofile', upload.any(), async function (req, res) {
  //Checks that everything is okay, any of the following result in an invalid request
  //There is no files array
  //There is no body
  //The first file exists but does not have a buffer
  //There is no bio (but a bio that's empty is okay)
  if(!req.files || !req.body || (req.files[0]?.buffer && !Buffer.isBuffer(req.files[0].buffer)) || (!req.body.bio && !(req.body.bio == ""))){
    res.render('pages/profileerr', { message: 'Malformed request to update profile.', error: true, userdetails: req.session?.user?.username});
  } else if(!req.session?.user?.username){
    res.render('pages/profileerr', { message: 'You are not logged in.', error: true, userdetails: req.session?.user?.username});
  } else{
    try{
      if(req.files[0]?.buffer){
        var newpfp = "data:" + req.files[0].mimetype + ";base64," + req.files[0].buffer.toString('base64')

        await db.none('UPDATE users SET (bio, pfpbase) = ($1, $2) WHERE username = $3', [req.body.bio, newpfp, req.session.user.username]);
      } else{
        await db.none('UPDATE users SET bio = $1 WHERE username = $2', [req.body.bio, req.session.user.username]);
      }
      
      res.redirect('/profile')
    } catch(error){
      console.error('Error updating profile details. ' + error);
      res.status(500).render('pages/error', { message: 'Error updating profile details. ' + error, userdetails: req.session?.user?.username});
    }
  }
});

//Displays the user page for the username given in :username (req.params.username)
//The profile page contains the username, profile picture, bio, and all of the users posts displayed in cards
app.get("/user/:username", async (req, res) => {

  const userSearch = await db.oneOrNone('SELECT * FROM users WHERE username = $1', req.params.username);
  if (!userSearch) {
    res.render('pages/profileerr', { message: 'User not found.', error: true });
  } else{

    const userPostIDs = await db.any(`SELECT postid FROM posts WHERE username = $1 ORDER BY createtime DESC`, [req.params.username]);
    let posts = []

    for(const postIDObj of userPostIDs){
      //The psql query for postid's returns an array of objects with a property called "postid" which corresponds to the actual post id, which is why the id is obtained through postIDObj.postid
      const postID = postIDObj.postid
      try {
        const post = await db.oneOrNone('SELECT * FROM posts WHERE postid = ' + postID);
        
        //Error case for if the post associated with an id can't be found
        if (!post) {
          return res.render('pages/error', {message: 'Error getting user posts'});
        }
        
        post.formattedCreateTime = new Date(post.createtime).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Denver'
        });
        
        //The post cards do not display comments, but do display the number of comments
        const comments = await db.any(
          `SELECT * FROM comments WHERE postid = $1`, [postID]);
        const commentCount = comments.length
        
        const tags = await db.any(`
          SELECT tags.tagname 
          FROM posttags 
          JOIN tags ON posttags.tagid = tags.tagid 
          WHERE posttags.postid = $1
        `, [postID]);

        //Link to the full post page
        const postLink = "/post/" + postID

        posts.push({post, commentCount, tags, postLink});
      } catch (error) {
        console.log(error);
        res.render('pages/error', {message: 'An unexpected error has occurred', userdetails: req.session?.user?.username});
      }
    }
    
    var viewingOwnPage = false
    //The first conditional makes sure that there is a user logged in. The second half checks to see if they're viewing their own page
    //If isSelf is true, buttons to create posts and edit the user's page are displayed
    if(req.session.user && userSearch.username == req.session.user.username){
      viewingOwnPage = true
    }
    res.render('pages/user', {user: userSearch, posts: posts, isSelf: viewingOwnPage, userdetails: req.session?.user?.username});
  }
});

// Post page
app.get('/post/:id', async (req, res) => {
  const postId = req.params.id; //gets the id param from the url (:id)

  try {
    //retreives the post with this postID from the posts table
    const post = await db.oneOrNone(`SELECT * FROM posts WHERE postid = $1`, [postId]);

    //is no such post exists...error
    if (!post) {
      return res.render('pages/error', {message: 'Post not found', userdetails: req.session?.user?.username});
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
      `SELECT username, pfpbase FROM users 
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

    //add user pfps to comments
    comments.forEach(async comment => {
      const pfp = await db.one(`SELECT pfpbase FROM users WHERE username = $1`, [comment.username]);
      comment.pfpbase = pfp.pfpbase
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

    //render the post_page template using the data passed below
    res.render('pages/post_page', {
      post,
      descriptions,
      user,
      comments,
      tags,
      sections,
      is_logged_in: req.session.user,
      userdetails: req.session?.user?.username
    });
  } catch (err) { //errors
    console.log(err);
    res.render('pages/error', {message: 'Post not found', userdetails: req.session?.user?.username});
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

    const pfp = await db.one(`SELECT pfpbase FROM users WHERE username = $1`, [username]);

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
      }),
      pfpbase: pfp.pfpbase
    };

    res.json(newComment); //shows/updates the comment on the users page without them having to refresh
  } catch (error) { //error
      console.error('Error posting comment:', error);
      res.status(500).json({error: 'An error occurred while posting the comment'});
  }
});

// Likes
app.post('/post/:id/like', async(req, res) => {
  const postID = req.params.id; //gets the postID from the url (:id)
  try {
    //Throw error if the user isn't logged in
    if(!req.session.user){
      throw new Error('User not logged in');
    }

    var usersWhoLiked = (await db.one(`SELECT users_who_liked FROM posts WHERE postid = $1`, [postID])).users_who_liked

    //if the current user didn't like it
    if(!usersWhoLiked?.includes(req.session.user.username)){
      //add current user to the list who liked
      await db.none('UPDATE posts SET users_who_liked = users_who_liked || ARRAY[$1] WHERE postid = $2', [req.session.user.username, postID])

      //add a like to the like count
      await db.none(`UPDATE posts SET likes = likes + 1 WHERE postid = $1`, [postID]);
    }
    
    //get updated like count for the post
    const updatedPost = await db.one(`SELECT likes FROM posts WHERE postid = $1`, [postID]);

    res.json({likes: updatedPost.likes});//shows the new like count without the user hvaing to update the page
  } catch (error) {//error case
    console.error('Error updating likes:', error);
    res.status(500).json({error: 'An error occurred while liking the post'});
  }
});

// Upload Page
app.get('/upload', (req, res) => {
  res.render('pages/upload', {userdetails: req.session?.user?.username});
});

 // Route to create a new post with comprehensive validation and data processing
app.post('/create-post', upload.any(), async function (req, res) {
  if(!req.files || !req.body || !Buffer.isBuffer(req.files[0].buffer) || !req.body.title || !req.body.tags1 || !req.body.descriptions){
    res.render('pages/profileerr', { message: 'Malformed post syntax.', error: true, userdetails: req.session?.user?.username});
  } else if(!req.session.user){
    res.render('pages/profileerr', { message: 'You are not logged in.', error: true, userdetails: req.session?.user?.username});
  } else{
    try{
      // Convert title image to base64
      var titleimgbase = "data:" + req.files[0].mimetype + ";base64," + req.files[0].buffer.toString('base64')

      var title = req.body.title
      var descriptions = req.body.descriptions
      // Insert main post details
      const post = await db.one(`INSERT INTO posts (username, title, descriptions, titleimgbase, createtime)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING postid`, [req.session.user.username, title, descriptions, titleimgbase]);
      // Process and store post sections
      var sectionsArr = new Array()
  
      for(let counter = 1; counter <= 10; counter++){
        var sectionTitle = req.body['sectiontitle' + counter]
        var content = req.body['content' + counter]
        sectionTitle = (sectionTitle == undefined) ? "" : sectionTitle
        content = (content == undefined) ? "" : content
  
        var sectionImg = null
        for(var i = 1; i < req.files.length; i++){
          if(req.files[i].fieldname == "imgpath" + counter){
            sectionImg = "data:" + req.files[0].mimetype + ";base64," + req.files[i].buffer.toString('base64')
            break
          }
        }
  
        if(sectionTitle == "" && content == "" && sectionImg == null){
          continue
        }
  
        sectionsArr.push({
          sectionTitle: sectionTitle.trim(),
          content: content.trim(),
          sectionImg: sectionImg
        })
      }
  // Insert sections into database
      for (let i = 0; i < sectionsArr.length; i++) {
        if(sectionsArr[i].sectionImg == null){
          await db.none(
            `INSERT INTO sections (postid, sectiontitle, content, createtime)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
            [post.postid, sectionsArr[i].sectionTitle, sectionsArr[i].content]
          );
        } else{
          await db.none(
            `INSERT INTO sections (postid, sectiontitle, content, imgbase, createtime)
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
            [post.postid, sectionsArr[i].sectionTitle, sectionsArr[i].content, sectionsArr[i].sectionImg]
          );
        }
      }
   // Process and insert tags
      for(let counter = 1; req.body['tags' + counter] != undefined; counter++){
        var tagName = req.body['tags' + counter].trim()
        const tag = await db.oneOrNone(`INSERT INTO tags (tagname) VALUES ($1) ON CONFLICT (tagname) DO NOTHING RETURNING tagid`,[tagName]);
        const tagID = tag ? tag.tagid : (await db.one(`SELECT tagid FROM tags WHERE tagname = $1`, [tagName])).tagid;
        await db.none(`INSERT INTO posttags (postid, tagid) VALUES ($1, $2)`, [post.postid, tagID]);
      }
  // Redirect to the newly created post
      res.redirect(`/post/${post.postid}`);
    } catch(error){
      console.error('Error creating post:', error);
      res.status(500).render('pages/error', { message: 'An error occurred while creating the post. ' + error, userdetails: req.session?.user?.username});
    }
  }
})

//Search Page
// Route to search posts across title, description, and tags
app.get('/search', async (req, res) => {
  const { query } = req.query;
  try {
    // Perform case-insensitive search across posts and tags
    const posts = await db.any(`
      SELECT DISTINCT p.* 
      FROM posts p
      LEFT JOIN posttags pt ON p.postid = pt.postid
      LEFT JOIN tags t ON pt.tagid = t.tagid
      WHERE p.title ILIKE $1 
         OR p.descriptions ILIKE $2
         OR t.tagname ILIKE $3
    `, [`%${query}%`, `%${query}%`, `%${query}%`]);
    // Render search results
    res.render('pages/discover', { posts, userdetails: req.session?.user?.username});
  } catch (error) {
    console.error('Error searching for posts:', error);
    res.status(500).send('An error occurred while searching for posts.');
  }
});
