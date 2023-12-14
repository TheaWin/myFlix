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

//allows Mongoose to connect to the database
mongoose.connect('mongodb://localhost:27017/anime', {useNewUrlParser: true, useUnifiedTopology: true});

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
//setup app routing
app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//import auth.js
let auth = require('./auth') (app);

//import passport.js
const passport = require('passport');
require('./passport');


// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})
app.use(morgan('combined', {stream: accessLogStream}));

//New users registration - after database
app.post('/users', async (req,res) => {
    await Users.findOne({ username: req.body.username })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.username + 'already exists');
            } else {
                Users
                    .create({
                        username: req.body.username,
                        name: req.body.name,
                        password: req.body.password,
                        email: req.body.email,
                        birthday: req.body.birthday
                    })
                    .then ((user) => {res.status(201).json(user)})
                .catch ((error) => {
                    console.error(error);
                    res.status(500).send('Error: ' +error);
                })
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' +error);
        })
    });

//Get a user by username
app.get('/users/:username', async (req, res) => {
    await Users.findOne ({ username: req.params.username })
    .then ((user) => {
        res.json(user);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' +err);
    });
});

//Update a user's info, by username - after database
app.put('/users/:username', async (req,res) => {
    await Users.findOneAndUpdate({ username: req.params.username}, 
        {$set: 
        {
            username: req.body.username,
            name: req.body.name,
            password: req.body.password,
            email: req.body.email,
            birthday: req.body.birthday
        }
    },
    { new: true} ) //This line makes sure that the updated document is returned
    .then ((updatedUser) => {
        res.json(updatedUser);
    })
    .catch ((err) => {
        console.error(err); 
        res.status(500).send('Error: ' + err);
    })
});

//Add an anime to a user's list of favorites
app.post('/users/:username/:animeID', async(req,res) => {
    await Users.findOneAndUpdate({username: req.params.username}, {
        $push: {favoriteMovies: req.params.animeID}
    },
    {new: true})
    .then ((updatedUser) => {
        if (!updatedUser) {
            return res.status(404).send("Error: User doesn't exist");
        } else {
            res.json(updatedUser);
        }
    })
    .catch ((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Delete an anime from the user's list of favorites 
app.delete('/users/:username/:animeID', async(req,res) => {
    await Users.findOneAndUpdate({username: req.params.username}, {
        $pull: {favoriteMovies: req.params.animeID}
    },
    {new: true})
    .then ((updatedUser) => {
        if (!updatedUser) {
            return res.status(404).send("Error: User doesn't exist");
        } else {
            res.json(updatedUser);
        }
    })
    .catch ((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Delete a user by username
app.delete('/users/:username', async (req,res) => {
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

//GET request
app.get('/', (req, res) => {
    res.send('Welcome to Anime Eiga(アニメ 映画).');
});

//Return a list of ALL anime to the user
app.get('/anime', async (req, res) => {
    await Anime.find()
    .then ((anime) => {
        res.status(201).json(anime);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
  });

//Return data about a single anime by title
app.get('/anime/:name', async (req, res) => {
   await Anime.findOne({Name: req.params.name})
   .then((anime) => {
    res.json(anime);
   })
   .catch((err)=> {
    console.error(err);
    res.status(500).send("Error: "+err);
   });
});

// Return data of a list of anime by genre
app.get('/anime/genre/:name', async (req, res) => {
    await Anime.findOne({"Genre.Name": req.params.name})
    .then((anime) => {
        res.json(anime);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Return data about director by name
app.get('/anime/director/:name', async (req,res) => {
    await Anime.findOne({"Director.Name": req.params.name})
    .then((anime) => {
        res.json(anime);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " +err);
    });
});

//listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });
