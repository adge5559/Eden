USE Eden_test;

-- Force Clear
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Posts;
DROP TABLE IF EXISTS Sections;
DROP TABLE IF EXISTS Tags;
DROP TABLE IF EXISTS PostTags;
DROP TABLE IF EXISTS PostSections;
DROP TABLE IF EXISTS Comments;

SET FOREIGN_KEY_CHECKS = 1;


-- Create User table
CREATE TABLE IF NOT EXISTS Users (
    Username VARCHAR(255) PRIMARY KEY,
    Passwords VARCHAR(255) NOT NULL,
    ProfilePicture VARBINARY(MAX)
);

-- Create Posts table
CREATE TABLE IF NOT EXISTS Posts(
	PostID INT PRIMARY KEY AUTO_INCREMENT,
    Username INT,
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
	SectionID  INT PRIMARY KEY AUTO_INCREMENT,
    SectionTitle VARCHAR(255) NOT NULL,
    Content TEXT NOT NULL,
    ImgPath VARCHAR(60),
    CreateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Tags table
CREATE TABLE IF NOT EXISTS Tags(
	TagID INT PRIMARY KEY AUTO_INCREMENT,
    TagName VARCHAR(50) UNIQUE
);

-- Create PostTags table (associate Posts and Tags)
CREATE TABLE IF NOT EXISTS PostTags(
	PostID INT,
    TagID INT,
	FOREIGN KEY (PostID) REFERENCES Posts(PostID),
    FOREIGN KEY (TagID) REFERENCES Tags(TagID)
);

-- Create PostsSections table
CREATE TABLE IF NOT EXISTS PostSections(
	PostID INT,
    SectionID INT,
    FOREIGN KEY (PostID) REFERENCES Posts(PostID),
    FOREIGN KEY (SectionID) REFERENCES Sections(SectionID)
);

-- Create Comments table
CREATE TABLE IF NOT EXISTS Comments (
    CommentID INT PRIMARY KEY AUTO_INCREMENT,
    PostID INT,
    Username INT,
    CommentText TEXT,
    CreateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Username) REFERENCES Users(Username),
    FOREIGN KEY (PostID) REFERENCES Posts(PostID)
);
