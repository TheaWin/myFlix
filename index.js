const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require ('path');

const app = express();
// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

let topAnime = [
    {
        title: 'My Neighbor Totoro',
        director: 'Hayao Miyazaki'
    },
    {
        title: 'Grave of the Fireflies',
        author: 'Isao Takahata'
    },
    {
        title: 'Kiki\'s Delivery Service',
        author: 'Hayao Miyazaki'
    },
    {
        title: 'Spirited Away',
        author: 'Hayao Miyazaki'
    },
    {
        title: 'Howl\'s Moving Castle',
        author: 'Hayao Miyazaki'
    },
    {
        title: 'Tales from Earthsea',
        author: 'Goro Miyazaki'
    },
    {
        title: 'Castle in the Sky',
        author: 'Hayao Miyazaki'
    },
    {
        title: 'Your Name',
        author: 'Makoto Shinkai'
    },
    {
        title: 'Belle',
        author: 'Mamoru Hosoda'
    },
    {
        title: 'Violet Evergarden',
        author: 'Taichi Ishidate'
    }
];

//setup app routing
app.use(express.static('public'));

//GET request
app.get('/', (req, res) => {
    res.send('Welcome to the collection of my favorite Animes.');
});

app.get('/movies', (req, res) => {
    res.json(topAnime);
  });

app.get('/documentation', (req, res) => {                  
    res.sendFile('public/documentation.html', { root: __dirname });
});
  
//error handling set up
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

//listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });




// listen for requests

