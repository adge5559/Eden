-- Insert test user
-- 7654321
INSERT INTO users (username, password, profilepicture)
VALUES ('new_user_1', '$2y$10$LIg.BKGv8rSg7VouSXMXceHhGdGN6jrwSsfmdM9R0CHE2R1nqJRTq', '/images/ProfilePicture/new_user_1.jpg');

-- Insert a new user
-- 1234567
INSERT INTO users (username, password, profilepicture)
VALUES ('new_user_2', '$2y$10$JtjNckhF.0hZB8I.7hp3rewPMHPkyS9oogaJTpvQA13kzBRvpK7Iq', '/images/ProfilePicture/new_user_2.jpg');


-- Insert Post1
INSERT INTO posts (postid, username, title, descriptions, titleimagepath, likes)
VALUES (1, 'new_user_1', 'Fern', 
        'This fern thrives in humid conditions and is perfect for indoor environments.', 
        '/images/Post/1/titleimg.jpg', 0);

-- Insert Section 1 for Post1
INSERT INTO sections (sectionid, sectiontitle, content, imgpath, postid)
VALUES (1, 'Fern Care Tips', 
        'Keep the fern in a humid environment and water it regularly to ensure healthy growth.', 
        '/images/Post/1/section1.jpg', 1);

-- Insert Section 2 for Post1
INSERT INTO sections (sectionid, sectiontitle, content, imgpath, postid)
VALUES (2, 'Ideal Lighting for Ferns', 
        'Ferns thrive in indirect sunlight. Avoid placing them in direct sunlight, as it may damage the leaves.', 
        '/images/Post/1/section2.jpg', 1);

-- Insert Comment 1 for Post1
INSERT INTO comments (commentid, postid, username, commenttext)
VALUES (1, 1, 'new_user_1', 'This is a beautiful fern! Thanks for sharing care tips.');

-- Insert Comment 2 for Post1
INSERT INTO comments (commentid, postid, username, commenttext)
VALUES (2, 1, 'new_user_2', 'I love ferns too! Very helpful information.');


-- Insert Cactus post
INSERT INTO posts (postid, username, title, descriptions, titleimagepath, likes)
VALUES (2, 'new_user_1', 'Cactus', 
        'A hardy plant that requires minimal care, great for dry climates and bright sunlight.', 
        '/images/Post/2/titleimg.jpg', 0);


-- Insert Succulent post
INSERT INTO posts (postid, username, title, descriptions, titleimagepath, likes)
VALUES (3, 'new_user_2', 'Succulent', 
        'This plant stores water in its leaves and is low-maintenance, ideal for a busy lifestyle.', 
        '/images/Post/3/titleimg.jpg', 0);
