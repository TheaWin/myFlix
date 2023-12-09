const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require ('path'),
    uuid = require('uuid'),
    bodyParser = require('body-parser');

const app = express();
// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

app.use(bodyParser.json());

let anime = [
    {
        title: 'My Neighbor Totoro',
        director: {
            name: 'Hayao Miyazaki',
            birthYear: '1941',
            deathyear: 'present',
            bio: 'Hayao Miyazaki is a highly acclaimed Japanese animator, director, and co-founder of Studio Ghibli. Renowned for his imaginative storytelling and artistic brilliance, Miyazaki has created some of the most beloved animated films worldwide. His iconic works include \'My Neighbor Totoro,\' \'Spirited Away,\' and \'Princess Mononoke.\' Miyazaki\'s films often explore themes of environmentalism, pacifism, and the wonder of childhood. With a career spanning decades, he continues to be a guiding force in the animation industry, captivating audiences of all ages.'
        },
        releaseYear: '1988',
        genre: ['action','drama','comedy', 'adventure', 'documentary', 'fantasy', 'thriller', 'supernatural'],
        description: 'While spending a summer in the Japanese countryside with their father, two younger sisters befriend mystical creatures who live in the nearby forest.'
    },
    {
        title: 'Grave of the Fireflies',
        director: {
            name: 'Isao Takahata',
            birthYear: '1935',
            deathYear: '2018',
            bio: 'Isao Takahata was a highly influential Japanese film director, producer, and co-founder of Studio Ghibli. Renowned for his distinct approach to storytelling and animation, Takahata played a crucial role in shaping the landscape of animated cinema. He directed acclaimed films such as \'Grave of the Fireflies,\' \'Only Yesterday,\' and \'The Tale of the Princess Kaguya.\' Takahata\'s works often explored profound human emotions and societal themes. His contributions to the world of animation continue to be celebrated, leaving a lasting impact on the industry. Isao Takahata passed away on April 5, 2018, but his legacy endures through his exceptional body of work.'
        },
        releaseYear: '1988',
        genre: ['war','horror', 'history', 'action', 'melodrama', 'anit-war', 'tragedy', 'drama'],
        description: 'A young boy and his little sister struggle to survive in Japan during World War II.'
    },
    {
        title: 'Kiki\'s Delivery Service',
        director: {
            name: 'Hayao Miyazaki',
            birthYear: '1941',
            deathyear: 'present',
            bio: 'Hayao Miyazaki is a highly acclaimed Japanese animator, director, and co-founder of Studio Ghibli. Renowned for his imaginative storytelling and artistic brilliance, Miyazaki has created some of the most beloved animated films worldwide. His iconic works include \'My Neighbor Totoro,\' \'Spirited Away,\' and \'Princess Mononoke.\' Miyazaki\'s films often explore themes of environmentalism, pacifism, and the wonder of childhood. With a career spanning decades, he continues to be a guiding force in the animation industry, captivating audiences of all ages.'
        },
        releaseYear: '1989',
        genre: ['horror', 'action', 'comedy', 'fanatasy', 'adventure', 'drama', 'teen'],
        description: 'In this animated adventure, a young witch moves away from her family to practice her craft, but she finds that making new friends is difficult.'
    },
    {
        title: 'Spirited Away',
        director: {
            name: 'Hayao Miyazaki',
            birthYear: '1941',
            deathyear: 'present',
            bio: 'Hayao Miyazaki is a highly acclaimed Japanese animator, director, and co-founder of Studio Ghibli. Renowned for his imaginative storytelling and artistic brilliance, Miyazaki has created some of the most beloved animated films worldwide. His iconic works include \'My Neighbor Totoro,\' \'Spirited Away,\' and \'Princess Mononoke.\' Miyazaki\'s films often explore themes of environmentalism, pacifism, and the wonder of childhood. With a career spanning decades, he continues to be a guiding force in the animation industry, captivating audiences of all ages.'
        },
        releaseYear: '2001',
        genre: ['action', 'drama', 'war', 'fantasy', 'adventure', 'teen', 'mystery', 'supernatural'],
        description: 'Chihiro wanders into a magical world where a witch rules -- and those who disobey her are turned into animals.'
    },
    {
        title: 'Howl\'s Moving Castle',
        director: {
            name: 'Hayao Miyazaki',
            birthYear: '1941',
            deathyear: 'present',
            bio: 'Hayao Miyazaki is a highly acclaimed Japanese animator, director, and co-founder of Studio Ghibli. Renowned for his imaginative storytelling and artistic brilliance, Miyazaki has created some of the most beloved animated films worldwide. His iconic works include \'My Neighbor Totoro,\' \'Spirited Away,\' and \'Princess Mononoke.\' Miyazaki\'s films often explore themes of environmentalism, pacifism, and the wonder of childhood. With a career spanning decades, he continues to be a guiding force in the animation industry, captivating audiences of all ages.'
        },
        releaseYear: '2004',
        genre: ['romance', 'action', 'comedy', 'war', 'fantasy', 'drama', 'adventure', 'science fiction'],
        description: 'Teenager Sophie works in her late father\'s hat shop in a humdrum town, but things get interesting when she\'s transformed into an elderly woman.'
    },
    {
        title: 'Tales from Earthsea',
        director: {
            name: 'Goro Miyazaki',
            birthYear: '1967',
            deathYear: 'present',
            bio: 'Goro Miyazaki is a Japanese director and landscaper, known for his contributions to animated films. He is the son of the renowned animator Hayao Miyazaki. Goro Miyazaki made his directorial debut with the Studio Ghibli film \'Tales from Earthsea\' in 2006. While initially facing challenges, he later directed \'From Up on Poppy Hill\' in 2011, earning acclaim for his storytelling and direction. Goro Miyazaki has continued to make a mark in the animation industry, carrying forward the legacy of Studio Ghibli. His unique perspective and dedication to storytelling contribute to the rich tapestry of animated cinema.'
        },
        releaseYear: '2006',
        genre: ['action', 'drama', 'fantasy', 'adventure'],
        description: 'As their world decays, an Archmage guides a troubled prince with a dark side on a journey to find the source of evil and save the woman they love.'
    },
    {
        title: 'Castle in the Sky',
        director: {
            name: 'Hayao Miyazaki',
            birthYear: '1941',
            deathyear: 'present',
            bio: 'Hayao Miyazaki is a highly acclaimed Japanese animator, director, and co-founder of Studio Ghibli. Renowned for his imaginative storytelling and artistic brilliance, Miyazaki has created some of the most beloved animated films worldwide. His iconic works include \'My Neighbor Totoro,\' \'Spirited Away,\' and \'Princess Mononoke.\' Miyazaki\'s films often explore themes of environmentalism, pacifism, and the wonder of childhood. With a career spanning decades, he continues to be a guiding force in the animation industry, captivating audiences of all ages.'
        },
        releaseYear: '1986',
        genre: ['romance', 'horror', 'action', 'comedy', 'steampunk', 'fantasy', 'science fiction', 'adventure', 'drama', 'musical', 'supernatural'],
        description: 'A young miner and a mysterious girl search for a long-lost island that\'s rumoured to hold great riches.'
    },
    {
        title: 'Your Name',
        director: {
            name: 'Makoto Shinkai',
            birthYear: '1973',
            deathYear: 'present',
            bio: 'Makoto Shinkai is a highly acclaimed Japanese animator, director, and writer known for his visually stunning and emotionally resonant works. Shinkai gained widespread recognition with his breakthrough film \'Your Name\' (Kimi no Na wa) in 2016, which became a global phenomenon. His films often explore themes of love, distance, and the beauty of everyday life. Before venturing into feature films, Shinkai gained attention for his independent short films. His meticulous attention to detail and storytelling prowess have solidified his place as a prominent figure in the world of anime and animation.'
        },
        releaseYear: '2016',
        genre: ['romance', 'aciton', 'comedy', 'drama', 'disaster','fantasy','supernatural'],
        description: 'A bored girl in the countryside starts sporadically waking up in the body of a city boy who\'s living the exciting life she\'d always dreamed of.'
    },
    {
        title: 'Belle',
        director: {
            name: 'Mamoru Hosoda',
            birthYear: '1967',
            deathYear: 'present',
            bio: 'Mamoru Hosoda, born on September 19, 1967, is a celebrated Japanese film director and animator known for his exceptional contributions to the world of anime. Hosoda gained prominence for his work with Studio Ghibli, where he directed \'The Girl Who Leapt Through Time.\' He later founded Studio Chizu, producing critically acclaimed films such as \'Summer Wars,\' \'Wolf Children,\' and \'Mirai.\' Hosoda\'s storytelling skill and ability to capture the essence of human emotions have made him a respected figure in the animation industry, with his works receiving international acclaim.'
        },
        releaseYear: '2021',
        genre: ['action','science fiction', 'adventure', 'suspense', 'drama', 'thriller','musical', 'science fantasy'],
        description: 'In the virtual world of U, an adored songstress and the despised Dragon form a bond, sparking an adventure that starts to reach into their real lives.'
    },
    {
        title: 'Violet Evergarden',
        director: {
            name: 'Taichi Ishidate',
            birthYear: '1979',
            deathYear: 'present',
            bio: 'Taichi Ishidate is a Japanese animator and director of animated series and films. He works for the Kyoto Animation studio , directed the animated series Kyōkai no Kanata and Violet Evergarden and their films. associated, he has also worked on other studio works in other capacities as episode director, unit director, as a Story-board artist and also as an animator.'
        },
        releaseYear: '2020',
        genre: ['action', 'romance', 'steampunk', 'science fiction', 'fantasy', 'drama'],
        description: 'As the world moves on from the war and technological advances bring changes to her life, Violet Still hopes to see her lost commanding officer again.'
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

