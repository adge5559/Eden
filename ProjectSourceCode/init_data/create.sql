-- Drop if table exists
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS sections;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS posttags;
DROP TABLE IF EXISTS comments;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    profilepicture VARCHAR(255) -- 32kb Pfp
);

<<<<<<< HEAD
-- Create Posts table
CREATE TABLE IF NOT EXISTS Posts(
	PostID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(255) NOT NULL,
    Title VARCHAR(40) NOT NULL,
    Descriptions TEXT NOT NULL,
    TitleImgPath VARCHAR(60) NOT NULL,
    Likes INT NOT NULL DEFAULT 0,
    CreateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LastUpdateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Username) REFERENCES Users(Username)
);

-- Create Sections table
CREATE TABLE IF NOT EXISTS Sections(
	SectionID  INT PRIMARY KEY AUTO_INCREMENT,
    SectionTitle VARCHAR(255) NOT NULL,
    Content TEXT NOT NULL,
    ImgPath VARCHAR(60),
    PostID INT,
    PRIMARY KEY (PostID, TagID),
    CreateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (PostID) REFERENCES Posts(PostID)
=======
-- Create posts table
CREATE TABLE IF NOT EXISTS posts(
	postid INT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    title VARCHAR(40) NOT NULL,
    descriptions TEXT NOT NULL,
    titleimagepath VARCHAR(60) NOT NULL,
    likes INT NOT NULL DEFAULT 0,
    createtime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastupdatetime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username)
);

-- Create sections table
CREATE TABLE IF NOT EXISTS sections(
	sectionid  INT PRIMARY KEY,
    sectiontitle VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    imgpath VARCHAR(60),
    postid INT,
    createtime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postid) REFERENCES posts(postid)
>>>>>>> 0f19ecd89df39cfc43d129378f6d00e26fff8b0f
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags(
	tagid INT PRIMARY KEY,
    tagname VARCHAR(50) UNIQUE
);

<<<<<<< HEAD
-- Create PostTags table (associate Posts and Tags)
CREATE TABLE IF NOT EXISTS PostTags(
	PostID INT,
    TagID INT,
    PRIMARY KEY (PostID, TagID),
    FOREIGN KEY (PostID) REFERENCES Posts(PostID),
    FOREIGN KEY (TagID) REFERENCES Tags(TagID)
=======
-- Create posttags table (associate posts and tags)
CREATE TABLE IF NOT EXISTS posttags(
	postid INT,
    tagid INT,
	FOREIGN KEY (postid) REFERENCES posts(postid),
    FOREIGN KEY (tagid) REFERENCES tags(tagid)
>>>>>>> 0f19ecd89df39cfc43d129378f6d00e26fff8b0f
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    commentid INT PRIMARY KEY,
    postid INT,
    username VARCHAR(255) NOT NULL,
    commenttext TEXT,
    createtime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username),
    FOREIGN KEY (postid) REFERENCES posts(postid)
);

