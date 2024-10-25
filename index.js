const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require ('path'),
  uuid = require('uuid'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  Models = require('./models.js');

const Anime = Models.Anime;
const Users = Models.User;

//Server-side validation for myFlix
const {check,validationResult} = require('express-validator');

//allows Mongoose to connect to the database
// mongoose.connect('mongodb://localhost:27017/anime', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect(process.env.CONNECTION_URI)
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection error:', err));

const app = express();
const cors = require('cors');

//allow requests from all origins
app.use(cors());

//allow only specified origins to be given access
// let allowedOrigins = ['http://localhost:8080', 'http://testsite.com','http://localhost:1234','https://anime-eiga.netlify.app','https://theawin.github.io','http://localhost:4200'];
// app.use (cors({
//   origin: (origin,callback) => {
//     if(!origin) return callback (null,true);
//     if(allowedOrigins.indexOf(origin) === -1) { //if a specific origin isn't found on the list of allowed origins
//       let message = 'The CORS policy for this application doesn\'t allow access from origin ' + origin;
//       return callback(new Error(message ), false);
//     }
//     return callback(null,true);
//   }
// }));


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));//setup app routing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//import auth.js
let auth = require('./auth') (app);

//import passport.js
const passport = require('passport');
require('./passport');

/* create a write stream (in append mode)
a ‘log.txt’ file is created in root directory */
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});
app.use(morgan('combined', {stream: accessLogStream}));

// Import AWS SDK and Multer
const AWS = require('aws-sdk');
const multer = require('multer');
//configure AWS SDK
AWS.config.update({region: process.env.AWS_REGION});
const S3 = new AWS.S3();
//Configure multer for hanlding file uploads
const storage = multer.memoryStorage();
const upload = multer({storage:storage});

const BUCKET_NAME = process.env.S3_BUCKET;
// Upload image
app.post('/upload-image', upload.single('image'), async(req,res) => {
  try {
    const file = req.file;

    if(!file) {
      return res.status(400).json({message: 'No file uploaded'});
    }

    console.log('S3 Bucket Name', BUCKET_NAME);

    await S3.putObject({
      Bucket: BUCKET_NAME,
      Key: `original-image/${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype
    }).promise();

    res.status(200).json({ message: 'Image uploaded successfully' });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Error uploading image' });
  }
});

// Get All Images
app.get('/images', async(req,res) => {
  try{
    const listObjects = async(prefix) => {
      const params = {
        Bucket: BUCKET_NAME,
        Prefix: prefix
      };

      const data = await S3.listObjectsV2(params).promise();
      return data.Contents.map(item => `https://${BUCKET_NAME}.s3.us-east-1.amazonaws.com/${item.Key}`);
    };

    const originalImages = await listObjects('original-image/');
    const resizedImages = await listObjects('resized-image/');

    res.status(200).send({originalImages, resizedImages});
  } catch(error) {
    console.error('Error listing images: ', error);
    res.status(500).send('Error listing images.');
  }
});

/**
 * User Sign up
 * 
 * @function
 * @method POST
 * @name userRegistration
 * @param {object} req - The request body containing user details.
 * @param {string} req.username - The username of the user.
 * @param {string} req.name - The name of the user.
 * @param {string} req.password - The password of the user.
 * @param {string} req.email - The email of the user.
 * @param {string} req.birthday - The birthday of the user.
 * @param {object/error} res - Returns
 * @returns {object} 200 - The user object if signup is successful.
 * @returns {Error} 500 - Internal Server Error
 * 
 * @example
 * // Example URL request:
 * POST http://localhost:8080/users
 * 
 * @example
 * // Example request
 * {
 *  "username": "test123",
 *  "name": "John Doe",
 *  "password": "test123",
 *  "email": "test@gmail.com",
 *  "birthday": "2008-08-08"
 * }
 * 
 * @example
 * //Example response
 * {
 *  "username": "test123",
 *  "name": "John Doe",
 *  "password": "$2b$10$hRYMpgJ.uLIPbgTX72plZeuCeEzK5sIxDAt8ez2nqhHZ.t78EoOmO",
 *  "email": "test@gmail.com",
 *  "birthday": "2008-08-08T00:00:00.000Z",
 *  "favoriteMovies": [],
 *  "_id": "66cd6638cc1745afe19c0ca7",
 *  "__v": 0 
 * }
 * 
 * // Example error response
 * {
 *  "message": "Error: <error_message>"
 * }
 */
app.post('/users', 
  //Validation logic here for request
  [
    check('username', 'Username is required and must be at least 5 characters').isLength({min:5}), //min value of 5 chars are only allowed
    check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('password', 'Password is required').not().isEmpty(),//using a chain of methods `.not().isEmpty()` meanis "opposite of isEmpty" in plain english "is not empty"
    check('email', 'Email does not appear to be valid').isEmail()
  ],
  async (req,res) => {

    //check the validation object for errors
    let errors = validationResult(req);

    if(!errors.isEmpty()) {
      return res.status(422).json({errors:errors.array()});
    }

    let hashedPassword = Users.hashPassword(req.body.password);
    await Users.findOne({ username: req.body.username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.username + 'already exists');
        } else {
          Users
            .create({
              username: req.body.username,
              name: req.body.name,
              password: hashedPassword,
              email: req.body.email,
              birthday: req.body.birthday
            })
            .then ((user) => {res.status(201).json(user);})
            .catch ((error) => {
              console.error(error);
              res.status(500).send('Error: ' +error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' +error);
      });
  });

/**
 * Get user details by username.
 * 
 * @function
 * @method GET
 * @name getUser
 * @param {string} req.params.username - The username of the user to retrieve and a valid JWT Token
 * @param {object/error} res - Returns
 * @returns {object} 200 - The user object if found.
 * @returns {Error} 500 - Internal Server Error
 * 
 * @example
 * // Example URL request:
 * POST http://localhost:8080/users/:username
 * 
 * @example
 * / Example response
 * {
 *  "username": "test123",
 *  "name": "John Doe",
 *  "password": "$2b$10$hRYMpgJ.uLIPbgTX72plZeuCeEzK5sIxDAt8ez2nqhHZ.t78EoOmO",
 *  "email": "test@gmail.com",
 *  "birthday": "2008-08-08T00:00:00.000Z",
 *  "favoriteMovies": [],
 *  "_id": "66cd6638cc1745afe19c0ca7",
 *  "__v": 0 
 * }
 * 
 * @example
 * // Example error response
 * {
 *  "message": "Error: <error_message>"
 * }
 */
app.get('/users/:username', passport.authenticate('jwt', {session: false}), async (req, res) => {
  await Users.findOne ({ username: req.params.username })
    .then ((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' +err);
    });
});

/**
 * Update user details by username
 * 
 * @function
 * @method PUT
 * @name editUser
 * @param {string} req.params.username - The username of the user to update and a valid JWT Token
 * @param {object/error} res - Returns
 * @returns {object} 200 - The user object if found.
 * @returns {object} 400 - Error message if update fails.
 * @returns {Error} 500 - Internal Server Error
 * 
 * @example
 * // Example URL request: 
 * PUT http://localhost:8080/users/:username
 * 
 * @example
 * / Example response
 * {
 *  "username": "test123",
 *  "name": "John Doe",
 *  "password": "$2b$10$hRYMpgJ.uLIPbgTX72plZeuCeEzK5sIxDAt8ez2nqhHZ.t78EoOmO",
 *  "email": "test@gmail.com",
 *  "birthday": "2008-08-08T00:00:00.000Z",
 *  "favoriteMovies": [],
 *  "_id": "66cd6638cc1745afe19c0ca7",
 *  "__v": 0 
 * }
 * 
 * @example
 * // Example error response
 * {
 *  "message": "Permission denied"
 * }
 */
app.put('/users/:username', passport.authenticate('jwt', {session: false}), 
  //Validation logic here for request
  [
    check('username', 'Username is required and must be at least 5 characters').isLength({min:5}), //min value of 5 chars are only allowed
    check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric()
  ], async (req,res) => {

    //for debugging
    console.log('Authenticated User:', req.user);
    console.log('Request Params:', req.params);
    
    //CONDITION TO CHECK USER AUTHORIZATION
    if(req.user.username !== req.params.username) {
      return res.status(400).send('Permission denied');
    }

    //check the validation object for errors
    let errors = validationResult(req);

    if(!errors.isEmpty()) {
      return res.status(422).json({errors:errors.array()});
    }

    await Users.findOneAndUpdate({ username: req.params.username}, 
      {$set: 
        {
          name: req.body.name,
          email: req.body.email,
          birthday: req.body.birthday
        }
      })
      .then ((updatedUser) => {
        res.json(updatedUser);
      })
      .catch ((err) => {
        console.error(err); 
        res.status(500).send('Error: ' + err);
      });
  });

/**
 * Add an anime to user's favorite movie list
 * 
 * @function
 * @method POST
 * @name addFavoriteMovie
 * @param {string} req - The user's username and movie ID as URL parameters and a valid JWT Token
 * @param {object/error} res - Returns
 * @returns {object} 200 - The user object with updated user's favoriteMovie list.
 * @returns {object} 404 - Error message if username is wrong.
 * @returns {Error} 500 - Internal Server Error 
 * 
 * @example
 * // Example URL request: 
 * POST http://localhost:8080/users/:username/:animeID
 * 
 * @example
 * // Example response
 * {
 *  "username": "test123",
 *  "name": "John Doe",
 *  "password": "$2b$10$hRYMpgJ.uLIPbgTX72plZeuCeEzK5sIxDAt8ez2nqhHZ.t78EoOmO",
 *  "email": "test@gmail.com",
 *  "birthday": "2008-08-08T00:00:00.000Z",
 *  "favoriteMovies": ["66c7599ca9450e58b0b7f24c"],
 *  "_id": "66cd6638cc1745afe19c0ca7",
 *  "__v": 0 
 * }
 * 
 * @example
 * // Example error response
 * {
 *  "message": "Permission denied"
 * }
 */
app.post('/users/:username/:animeID', passport.authenticate('jwt', {session: false}), async(req,res) => {
  //CONDITION TO CHECK USER AUTHORIZATION
  if(req.user.username !== req.params.username) {
    return res.status(400).send('Permission denied');
  }

  await Users.findOneAndUpdate({username: req.params.username}, {
    $push: {favoriteMovies: req.params.animeID}
  },
  {new: true})
    .then ((updatedUser) => {
      if (!updatedUser) {
        return res.status(404).send('Error: User doesn\'t exist');
      } else {
        res.json(updatedUser);
      }
    })
    .catch ((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Removes an anime from user's favorite movie list
 * 
 * @function
 * @method DELETE
 * @name deleteFavoriteMovie
 * @param {string} req - The user's username and movie ID as URL parameters and a valid JWT Token
 * @param {object/error} res - Returns
 * @returns {object} 200 - The user object with updated user's favoriteMovie list.
 * @returns {object} 404 - Error message if username is wrong.
 * @returns {Error} 500 - Internal Server Error 
 * 
 * @example
 * // Example URL request: 
 * DELETE http://localhost:8080/users/:username/:animeID
 * 
 * @example
 * // Example response
 * {
 *  "username": "test123",
 *  "name": "John Doe",
 *  "password": "$2b$10$hRYMpgJ.uLIPbgTX72plZeuCeEzK5sIxDAt8ez2nqhHZ.t78EoOmO",
 *  "email": "test@gmail.com",
 *  "birthday": "2008-08-08T00:00:00.000Z",
 *  "favoriteMovies": [],
 *  "_id": "66cd6638cc1745afe19c0ca7",
 *  "__v": 0 
 * }
 * 
 * @example
 * // Example error response
 * {
 *  "message": "Permission denied"
 * }
 */
app.delete('/users/:username/:animeID', passport.authenticate('jwt', {session: false}), async(req,res) => {
  //CONDITION TO CHECK USER AUTHORIZATION
  if(req.user.username !== req.params.username) {
    return res.status(400).send('Permission denied');
  }

  await Users.findOneAndUpdate({username: req.params.username}, {
    $pull: {favoriteMovies: req.params.animeID}
  },
  {new: true})
    .then ((updatedUser) => {
      if (!updatedUser) {
        return res.status(404).send('Error: User doesn\'t exist');
      } else {
        res.json(updatedUser);
      }
    })
    .catch ((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Delete a user by their username
 * 
 * @function
 * @method DELETE
 * @name deleteUser
 * @param {string} req - The user's username as URL parameters and a valid JWT Token
 * @param {object/error} res - Returns
 * @returns {object} 200 - A message indicating the delete was successful.
 * @returns {object} 404 - Error message if username is wrong.
 * @returns {Error} 500 - Internal Server Error 
 * 
 * @example
 * // Example URL request: 
 * DELETE http://localhost:8080/users/:username
 * 
 * @example
 * // Example response
 * {
 * "message": "User123 was deleted."
 * }
 * 
 * @example
 * // Example error response
 * {
 *  "message": "User123 was not found."
 * }
 */
app.delete('/users/:username', passport.authenticate('jwt', {session: false}), async (req,res) => {
  //CONDITION TO CHECK USER AUTHORIZATION
  if(req.user.username !== req.params.username) {
    return res.status(400).send('Permission denied');
  }
    
  await Users.findOneAndDelete({ username: req.params.username})
    .then ((user) => {
      if (!user) {
        res.status(400).send(req.params.username + ' was not found');
      } else {
        res.status(200).send(req.params.username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Handles the root endpoint with a welcome message.
 * 
 * @function
 * @method GET
 * @name getRoot
 * @param {express.Request} req - The request object
 * @param {express.Response} res - Returns
 * @returns {void} 200 - A plain text welcome message is send to the client
 */
app.get('/', (req, res) => {
  res.send('Welcome to Anime Eiga(アニメ 映画).');
});

/**
 * Return a list of all anime from the database
 * @function
 * 
 * @method GET
 * @name getAllMovies
 * @param {string} req - Valid JWT Token
 * @returns {Array.<object>} 200 - An array of anime objects
 * @returns {Error} 500 - Internal Server Error
 * 
 * @example
 * // Example URL request:
 * GET http://localhost:8080/anime
 * 
 * // Example response:
 * [
 *  {
 *    "_id": "66c7599ca9450e58b0b7f24c",
 *    "Name": "The Garden of Words",,
 *    "Description": "A unique connection forms between a high school student and a mysterious woman in a garden.",
 *    "releaseYear": 2013,
 *    "imageURL": "https://m.media-amazon.com/images/I/819XDfizEaL._AC_SY741_.jpg",
 *    "Featured": false,
 *    "Director": {
 *      "Name": "Makoto Shinkai",
 *      "Birth": "1973-02-09T00:00:00.000Z",
 *      "Bio": "Makoto Shinkai is a Japanese animator, filmmaker, and writer known for his visually stunning and emotionally compelling animated films.",
 *      "Death": "null"
 *    },
 *    "Genre": {
 *      "Name": "Romance",
 *      "Description": "Romance genre focuses on the emotional relationship between characters, often featuring themes of love, attraction, and personal growth. Stories typically explore the journey of romantic relationships and their impact on the characters' lives."
 *    }
 *  },
 *  ...
 * ]
 * 
 * @example
 * // Example error response
 * {
 *  "message": "Error: <error_message>"
 * }
 */
app.get('/anime', passport.authenticate('jwt', {session: false}), async (req, res) => {
  await Anime.find()
    .then ((anime) => {
      res.status(201).json(anime);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Return a list of all anime from the database
 * @function
 * 
 * @method GET
 * @name getOneMovie
 * @param {string} req - The movie ID as URL parameters and a valid JWT Token
 * @returns {object} 200 - The movie object if found
 * @returns {Error} 500 - Internal Server Error
 * 
 * @example
 * // Example URL request:
 * GET http://localhost:8080/anime/:name
 * 
 * // Example response:
 * {
 *  "_id": "66c7599ca9450e58b0b7f24c",
 *  "Name": "The Garden of Words",
 *  "Description": "A unique connection forms between a high school student and a mysterious woman in a garden.",
 *  "releaseYear": 2013,
 *  "imageURL": "https://m.media-amazon.com/images/I/819XDfizEaL._AC_SY741_.jpg",
 *  "Featured": false,
 *  "Director": {
 *    "Name": "Makoto Shinkai",
 *    "Birth": "1973-02-09T00:00:00.000Z",
 *    "Bio": "Makoto Shinkai is a Japanese animator, filmmaker, and writer known for his visually stunning and emotionally compelling animated films.",
 *    "Death": "null"
 *  },
 *  "Genre": {
 *    "Name": "Romance",
 *    "Description": "Romance genre focuses on the emotional relationship between characters, often featuring themes of love, attraction, and personal growth. Stories typically explore the journey of romantic relationships and their impact on the characters' lives."
 *  }
 * 
 * @example
 * // Example error response
 * {
 *  "message": "Error: <error_message>"
 * }
 */
app.get('/anime/:name', passport.authenticate('jwt', {session: false}), async (req, res) => {
  await Anime.findOne({Name: req.params.name})
    .then((anime) => {
      res.json(anime);
    })
    .catch((err)=> {
      console.error(err);
      res.status(500).send('Error: '+err);
    });
});

/**
 * Get genre details by name
 * 
 * @function
 * @method GET
 * @name getGenre
 * @param {string} req.params.username - The genre name as URL parameters and a valid JWT Token
 * @param {object/error} res - Returns
 * @returns {object} 200 - The genre object if found.
 * @returns {Error} 500 - Internal Server Error
 * 
 * @example
 * // Example URL request
 * GET http://localhost:8080/anime/genre/:name
 * 
 * @example
 * // Example response
 * {
 *  "Name": "Romance",
 *  "Description": "Romance genre focuses on the emotional relationship between characters, often featuring themes of love, attraction, and personal growth. Stories typically explore the journey of romantic relationships and their impact on the characters' lives."
 * }
 * 
 * @example
 * // Example error response
 * {
 *  "message": "Error: <error_message>"
 * }
 */
app.get('/anime/genre/:name', passport.authenticate('jwt', {session: false}), async (req, res) => {
  await Anime.findOne({'Genre.Name': req.params.name})
    .then((anime) => {
      res.status(200).json(anime.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Get director details by name
 * 
 * @function
 * @method GET
 * @name getGenre
 * @param {string} req.params.username - The director name as URL parameters and a valid JWT Token
 * @param {object/error} res - Returns
 * @returns {object} 200 - The genre object if found.
 * @returns {Error} 500 - Internal Server Error
 * 
 * @example
 * // Example URL request
 * GET http://localhost:8080/anime/director/:name
 * 
 * @example
 * // Example response
 * {
 *  "Name": "Makoto Shinkai",
 *  "Birth": "1973-02-09T00:00:00.000Z",
 *  "Bio": "Makoto Shinkai is a Japanese animator, filmmaker, and writer known for his visually stunning and emotionally compelling animated films.",
 *  "Death": "null"
 * }
 * 
 * @example
 * // Example error response
 * {
 *  "message": "Error: <error_message>"
 * }
 */

app.get('/anime/director/:name', passport.authenticate('jwt', {session: false}), async (req,res) => {
  await Anime.findOne({'Director.Name': req.params.name})
    .then((anime) => {
      res.status(200).json(anime.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' +err);
    });
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' +port);
});
