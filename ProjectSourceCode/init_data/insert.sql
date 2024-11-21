-- Insert test user
-- 7654321
INSERT INTO users (username, password, profilepicture)
VALUES ('new_user_1', '$2y$10$LIg.BKGv8rSg7VouSXMXceHhGdGN6jrwSsfmdM9R0CHE2R1nqJRTq', '/images/ProfilePicture/new_user_1.jpg');

-- Insert a new user
-- 1234567
INSERT INTO users (username, password, profilepicture)
VALUES ('new_user_2', '$2y$10$JtjNckhF.0hZB8I.7hp3rewPMHPkyS9oogaJTpvQA13kzBRvpK7Iq', '/images/ProfilePicture/new_user_2.jpg');

INSERT INTO users (username, password, profilepicture)
VALUES ('Eden', '123', '/images/ProfilePicture/new_user_2.jpg');


-- Insert Post1
INSERT INTO posts (username, title, descriptions, titleimagepath, likes)
VALUES ('new_user_1', 'Fern', 
        'This fern thrives in humid conditions and is perfect for indoor environments.', 
        '/images/Post/1/titleimg.jpg', 0);

-- Insert Section 1 for Post1
INSERT INTO sections (sectiontitle, content, imgpath, postid)
VALUES ('Fern Care Tips', 
        'Keep the fern in a humid environment and water it regularly to ensure healthy growth.', 
        '/images/Post/1/section1.jpg', 1);

-- Insert Section 2 for Post1
INSERT INTO sections (sectiontitle, content, imgpath, postid)
VALUES ('Ideal Lighting for Ferns', 
        'Ferns thrive in indirect sunlight. Avoid placing them in direct sunlight, as it may damage the leaves.', 
        '/images/Post/1/section2.jpg', 1);

-- Insert Comment 1 for Post1
INSERT INTO comments (postid, username, commenttext)
VALUES (1, 'new_user_1', 'This is a beautiful fern! Thanks for sharing care tips.');

-- Insert Comment 2 for Post1
INSERT INTO comments (postid, username, commenttext)
VALUES (1, 'new_user_2', 'I love ferns too! Very helpful information.');

-- Insert tags to Post1
INSERT INTO tags (tagid, tagname)
VALUES 
(1, 'Greens'),
(2, 'Fern');

-- Insert into posttags
INSERT INTO posttags (postid, tagid)
VALUES 
(1, 1),
(1, 2);

-- Insert Cactus post
INSERT INTO posts (username, title, descriptions, titleimagepath, likes)
VALUES ('new_user_1', 'Cactus', 
        'A hardy plant that requires minimal care, great for dry climates and bright sunlight.', 
        '/images/Post/2/titleimg.jpg', 0);


-- Insert Succulent post
INSERT INTO posts (username, title, descriptions, titleimagepath, likes)
VALUES ('new_user_2', 'Succulent', 
        'This plant stores water in its leaves and is low-maintenance, ideal for a busy lifestyle.', 
        '/images/Post/3/titleimg.jpg', 0);


-- I will create a button where it gives you a random plant to look at
/*
INSERT INTO plants (name, description, imagepath)
VALUES
    ('Fern', 'This fern thrives in humid conditions and is perfect for indoor environments.', '/images/fern.jpg'),
    ('Cactus', 'A hardy plant that requires minimal care, great for dry climates and bright sunlight.', '/images/catus.jpg'),
    ('Succulent', 'This plant stores water in its leaves and is low-maintenance, ideal for a busy lifestyle.', '/images/succulent.jpg'),
    ('Spider Plant', 'An easy-to-care-for plant known for its air-purifying qualities.', '/images/houseplants.jpeg'),
    ('Snake Plant', 'A resilient plant that requires little water and thrives in low light.', 'images/houseplants.jpeg'),
    ('Peace Lily', 'A flowering plant that enjoys indirect light and high humidity.', 'images/houseplants.jpeg'),
    ('Pothos', 'A fast-growing vine that is perfect for beginners, thriving in low light.', 'images/houseplants.jpeg'),
    ('Monstera', 'Known for its split leaves, this plant loves bright, indirect sunlight.', 'images/houseplants.jpeg'),
    ('ZZ Plant', 'A drought-tolerant plant with thick, waxy leaves that require minimal care.', 'images/houseplants.jpeg'),
    ('Aloe Vera', 'A succulent known for its medicinal properties and love of bright light.', 'images/houseplants.jpeg'),
    ('Rubber Plant', 'A low-maintenance plant that does well in medium to bright indirect light.', 'images/houseplants.jpeg'),
    ('Jade Plant', 'A popular succulent with thick leaves, representing good luck.', 'images/houseplants.jpeg'),
    ('Philodendron', 'A vining plant that is adaptable and grows well in low light.', 'images/houseplants.jpeg'),
    ('Calathea', 'A plant with beautifully patterned leaves, known for moving its leaves.', 'images/houseplants.jpeg'),
    ('Dracaena', 'A tough plant that thrives in low to medium light and is drought-resistant.', 'images/houseplants.jpeg'),
    ('Fiddle Leaf Fig', 'A stylish plant with large, glossy leaves, popular in modern decor.', 'images/houseplants.jpeg'),
    ('Boston Fern', 'A lush, feathery fern that loves humidity and indirect light.', 'images/houseplants.jpeg'),
    ('Chinese Evergreen', 'A hardy plant with variegated leaves, tolerates low light.', 'images/houseplants.jpeg'),
    ('Areca Palm', 'A tropical plant that brings a beachy feel, loves bright, indirect light.', 'images/houseplants.jpeg'),
    ('English Ivy', 'A trailing plant ideal for hanging baskets, grows well in low light.', 'images/houseplants.jpeg'),
    ('Dieffenbachia', 'A large plant with variegated leaves, tolerates low to medium light.', 'images/houseplants.jpeg'),
    ('Parlor Palm', 'A slow-growing palm that adapts to indoor light conditions.', 'images/houseplants.jpeg'),
    ('Birds Nest Fern', 'A unique fern with wavy leaves, thrives in humidity.', 'images/houseplants.jpeg'),
    ('Silver Pothos', 'A hardy vine with silver variegation, grows well in indirect light.', 'images/houseplants.jpeg'),
    ('Swiss Cheese Plant', 'A Monstera variety with holes in its leaves, loves humidity.', 'images/houseplants.jpeg'),
    ('Banana Plant', 'A tropical plant with large leaves, thrives in warm, bright conditions.', 'images/houseplants.jpeg'),
    ('Norfolk Pine', 'An evergreen houseplant resembling a mini Christmas tree.', 'images/houseplants.jpeg'),
    ('Oxalis', 'A plant with purple leaves and clover-like shape, enjoys indirect light.', 'images/houseplants.jpeg'),
    ('Umbrella Tree', 'A tall plant with umbrella-like leaf clusters, does well in low light.', 'images/houseplants.jpeg'),
    ('Lucky Bamboo', 'A plant said to bring luck, can grow in water or soil.', 'images/houseplants.jpeg'),
    ('Dwarf Banana', 'A smaller version of the banana plant, great for bright rooms.', 'images/houseplants.jpeg'),
    ('Pilea Peperomioides', 'Also known as the Chinese Money Plant, easy to care for.', 'images/houseplants.jpeg'),
    ('Aglaonema', 'A plant with beautiful leaf patterns, tolerates low to medium light.', 'images/houseplants.jpeg'),
    ('Croton', 'A colorful plant with bright red, yellow, and green leaves.', 'images/houseplants.jpeg'),
    ('Cast Iron Plant', 'A nearly indestructible plant that tolerates low light and drought.', 'images/houseplants.jpeg'),
    ('Bamboo Palm', 'A palm with thin bamboo-like stalks, thrives in low light.', 'images/houseplants.jpeg'),
    ('String of Pearls', 'A succulent with trailing round leaves, needs bright light.', 'images/houseplants.jpeg'),
    ('Hoya', 'A waxy, vining plant that sometimes produces fragrant flowers.', 'images/houseplants.jpeg'),
    ('Anthurium', 'A flowering plant known for its heart-shaped leaves and bright blooms.', 'images/houseplants.jpeg');
    */
INSERT INTO posts (username, title, descriptions, titleimagepath, likes)
VALUES
    ('Eden', 'Spider Plant', 'An easy-to-care-for plant known for its air-purifying qualities.', '/images/houseplants.jpeg', 0),
    ('Eden', 'Snake Plant', 'A resilient plant that requires little water and thrives in low light.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Peace Lily', 'A flowering plant that enjoys indirect light and high humidity.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Pothos', 'A fast-growing vine that is perfect for beginners, thriving in low light.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Monstera', 'Known for its split leaves, this plant loves bright, indirect sunlight.', 'images/houseplants.jpeg', 0),
    ('Eden', 'ZZ Plant', 'A drought-tolerant plant with thick, waxy leaves that require minimal care.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Aloe Vera', 'A succulent known for its medicinal properties and love of bright light.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Rubber Plant', 'A low-maintenance plant that does well in medium to bright indirect light.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Jade Plant', 'A popular succulent with thick leaves, representing good luck.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Philodendron', 'A vining plant that is adaptable and grows well in low light.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Calathea', 'A plant with beautifully patterned leaves, known for moving its leaves.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Dracaena', 'A tough plant that thrives in low to medium light and is drought-resistant.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Fiddle Leaf Fig', 'A stylish plant with large, glossy leaves, popular in modern decor.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Boston Fern', 'A lush, feathery fern that loves humidity and indirect light.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Chinese Evergreen', 'A hardy plant with variegated leaves, tolerates low light.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Areca Palm', 'A tropical plant that brings a beachy feel, loves bright, indirect light.', 'images/houseplants.jpeg', 0),
    ('Eden', 'English Ivy', 'A trailing plant ideal for hanging baskets, grows well in low light.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Dieffenbachia', 'A large plant with variegated leaves, tolerates low to medium light.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Parlor Palm', 'A slow-growing palm that adapts to indoor light conditions.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Birds Nest Fern', 'A unique fern with wavy leaves, thrives in humidity.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Silver Pothos', 'A hardy vine with silver variegation, grows well in indirect light.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Swiss Cheese Plant', 'A Monstera variety with holes in its leaves, loves humidity.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Banana Plant', 'A tropical plant with large leaves, thrives in warm, bright conditions.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Norfolk Pine', 'An evergreen houseplant resembling a mini Christmas tree.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Oxalis', 'A plant with purple leaves and clover-like shape, enjoys indirect light.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Umbrella Tree', 'A tall plant with umbrella-like leaf clusters, does well in low light.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Lucky Bamboo', 'A plant said to bring luck, can grow in water or soil.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Dwarf Banana', 'A smaller version of the banana plant, great for bright rooms.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Pilea Peperomioides', 'Also known as the Chinese Money Plant, easy to care for.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Aglaonema', 'A plant with beautiful leaf patterns, tolerates low to medium light.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Croton', 'A colorful plant with bright red, yellow, and green leaves.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Cast Iron Plant', 'A nearly indestructible plant that tolerates low light and drought.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Bamboo Palm', 'A palm with thin bamboo-like stalks, thrives in low light.', 'images/houseplants.jpeg', 0),
    ('Eden', 'String of Pearls', 'A succulent with trailing round leaves, needs bright light.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Hoya', 'A waxy, vining plant that sometimes produces fragrant flowers.', 'images/houseplants.jpeg', 0),
    ('Eden', 'Anthurium', 'A flowering plant known for its heart-shaped leaves and bright blooms.', 'images/houseplants.jpeg', 0);
