const mongoose = require('mongoose');

const animeSchema = mongoose.Schema({
    Name: {type: String, required: true},
    Description: {type: String, required: true},
    Genre: {
        Name: String, 
        Description: String
    },
    Director: {
        Name: String, 
        Bio: String,
        birthYear: Number,
        deathYear: String
    },
    releaseYear: Number,
    imageURL: String,
    Featured: Boolean
});

const userSchema = mongoose.Schema({
    username: {type: String, required:true},
    name: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true},
    birthday: Date,
    favoriteMovies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Anime'}]
});

const Anime = mongoose.model('Anime',animeSchema);
const User = mongoose.model('User', userSchema);

module.exports.Anime = Anime;
module.exports.User = User;