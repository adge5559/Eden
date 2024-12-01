# Eden 
Application Description

    Eden is a social media platform created for plant lovers who want to share 
    their passion for plant care. This platform allows users to login to their 
    accounts and post photos of the plants they are caring for, along with tips 
    for growth or challenges they are facing. Users can also search for specific
    plants and be presented with posts from other users and their advice. Each 
    post can be tagged with relevant keywords, making it easy for users to 
    search for specific advice.

	Users can customize their profiles to reflect their personal style and 
    plant preferences. They can choose from a selection of profile pictures, write 
    a bio showcasing their favorite plants, and display their various posts. This 
    personalization allows users to more easily connect with others.


	Eden also includes a discover page, which presents random plant posts to 
    inspire users. Whether users are looking for advice, sharing success stories,
    or browsing through the feed for inspiration, Eden makes it easy for users 
    to connect with others who share a love for plants. The platform is designed 
    to be the ultimate go-to space for personalized plant care, community feedback, 
    and continuous learning in the world of gardening.

Contributors:

    Ella Larson,
    Addison Getz,
    Gavin Walker,
    Leonard Huang,
    Alexander Carmichael

Technology Stack: 

    Frontend
        * Express Handlebars (express-handlebars): Used as the templating engine for 
	rendering HTML views on theserver side.
		* Handlebars templates (.hbs files): These files define the structure
  		and content of viewing thepage.
  		* Partials: Reusable chunks of templates (e.g., headers, footers) that 
   		simplify view development and ensure consistency across pages.
	    * CSS (Cascading Style Sheets): For styling the user interface, including layout, 
 	colors, fonts, and responsiveness. This could involve custom CSS files or 
  	frameworks like Bootstrap, potentially served via express.static.
	    * JavaScript: Used in templates and potentially for enhancing interactivity on the 
 	client side.
    
    Backend
        * Node.js: The runtime environment for running the server-side application.
        * Express.js: Web framework for building the application and handling routes.
        * bcrypt.js: For hashing passwords to enhance security.
        * formidable: For handling file uploads.
	
    Database
        * PostgreSQL: The database used for storing user data, posts, and other 
	application-related data when locally run.
        * pg-promise: A library for connecting and querying the PostgreSQL database.
	    * Render: The database used for storing user data, posts, and other 
 	application-related data when run on the web.

No prerequisites to run the application.

Instructions: 

    Go to the link for the deployed application. This will direct you to the Eden homepage, 
    where you can look at and search for posts. From here you can attempt to login. If you 
    do not yet have an account, please select "Register" on the login page. After you have 
    logged in, you can then go to your profile and make posts.

How To Run Tests:

    Go to the docker-compose.yaml. Comment out command: 'npm start' and uncomment
    command: 'npm run testandrun'. Run docker compose shutdown -v in order to clear the
    database. Then, run docker compose up to run the tests. The result of the tests will
    be displayed in the console. Be sure to run docker compose shutdown -v before you run the tests.
    You can combine the reset and run commands with docker compose shutdown -v && docker compose up
    in order to both reset the database and run the tests with one command

Link to Deployed Application: https://eden-5h1r.onrender.com
