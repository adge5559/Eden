-- Force Clear
-- SET FOREIGN_KEY_CHECKS = 0;

-- DROP TABLE IF EXISTS Users;
-- DROP TABLE IF EXISTS Posts;
-- DROP TABLE IF EXISTS Sections;
-- DROP TABLE IF EXISTS Tags;
-- DROP TABLE IF EXISTS PostTags;
-- DROP TABLE IF EXISTS Comments;

-- SET FOREIGN_KEY_CHECKS = 1;


-- Create User table
CREATE TABLE IF NOT EXISTS Users (
    Username VARCHAR(255) PRIMARY KEY,
    Password VARCHAR(255) NOT NULL,
    ProfilePicture VARCHAR(255) -- 32kb Pfp
);

-- Create Posts table
CREATE TABLE IF NOT EXISTS Posts(
	PostID INT PRIMARY KEY,
    Username VARCHAR(255) NOT NULL,
    Title VARCHAR(40) NOT NULL,
    Descriptions TEXT NOT NULL,
    TitalImgPath VARCHAR(60) NOT NULL,
    Likes INT NOT NULL DEFAULT 0,
    CreateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LastUpdateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Username) REFERENCES Users(Username)
);

-- Create Sections table
CREATE TABLE IF NOT EXISTS Sections(
	SectionID  INT PRIMARY KEY,
    SectionTitle VARCHAR(255) NOT NULL,
    Content TEXT NOT NULL,
    ImgPath VARCHAR(60),
    PostID INT,
    CreateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (PostID) REFERENCES Posts(PostID)
);

-- Create Tags table
CREATE TABLE IF NOT EXISTS Tags(
	TagID INT PRIMARY KEY,
    TagName VARCHAR(50) UNIQUE
);

-- Create PostTags table (associate Posts and Tags)
CREATE TABLE IF NOT EXISTS PostTags(
	PostID INT,
    TagID INT,
	FOREIGN KEY (PostID) REFERENCES Posts(PostID),
    FOREIGN KEY (TagID) REFERENCES Tags(TagID)
);

-- Create Comments table
CREATE TABLE IF NOT EXISTS Comments (
    CommentID INT PRIMARY KEY,
    PostID INT,
    Username VARCHAR(255) NOT NULL,
    CommentText TEXT,
    CreateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Username) REFERENCES Users(Username),
    FOREIGN KEY (PostID) REFERENCES Posts(PostID)
);

