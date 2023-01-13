const express = require('express'),
  bodyParser = require('body-parser'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path'),
  mongoose = require('mongoose'),
  Models = require('./models.js'),
  uuid = require('uuid');
const passport = require('passport');
require('./passport');
const app = express();
app.use(passport.initialize());
const { check, validationResult } = require('express-validator');

//Middleware

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');
let allowedOrigins = [
  'http://localhost:8080',
  'https://movime-api.herokuapp.com',
  'http://localhost:1234',
  'https://movime.netlify.app',
  'Access-Control-Allow-Origin'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          'The CORS policy for this application doesn’t allow access from origin ' +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    }
  })
);

// requires passport module & import passport.js file
/**
 * Imports auth file to use authentication
 */
let auth = require('./auth')(app);

app.use(morgan('common'));

/**
 * serves static content for the app from the 'public' directory
 */
app.use(express.static('public'));

const Movies = Models.Movie;
const Users = Models.User;

// PROUCTION mode - connecting to remote MongoDB
/**
 * Connecting to remote Mongo DB hosted on Heroku
 * @param {string} uri encoded key, retrieved from Heroku host
 * @requires mongoose
 */

mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// mongoose.connect('mongodb://localhost:27017/MoviMe', { useNewUrlParser: true, useUnifiedTopology: true });

/**
 * ***********************
 * ROUTING PATHS
 * ***********************
 */

// Get

app.get('/', (req, res) => {
  res.send('Welcome to Movies that MoviMe')
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});


// Read

/**
 * API request to return a list of ALL movies
 * @function [GET]/movies
 * @returns {array} an array of movie objects
 * @requires passport
 */
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) =>{
  Movies.find()
  .then((movies) => {
      res.status(201).json(movies);
  })
  .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
  });
});

/**
 * API request to get a single movie
 * @function [GET]/movies/:Title
 * @param {string} Title
 * @returns {Object} an object of a single movie
 * @requires passport
 * */
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
  .then((movie) => {
    res.json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

app.get('/users', passport.authenticate('jwt', { session: false }), function (req, res) {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * API request to get the details of a specifiic user
 * @function [GET]/users/:Username
 * @param {string} Username
 * @returns {Object} a User object
 * @requires passport
 * */
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Read

/**
 * API request to get information about a certain genre
 * @function [GET]/genre/:Name
 * @param {string} Name
 * @returns {string} a genre description
 * @requires passport
 * */
app.get('/genre/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.Name })
    .then((movie) => {
         res.json(movie.Genre.Description);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// Read

/**
 * API request to get information about a movie's director
 * @function [GET]/director/:Name
 * @param {string} Name
 * @returns {object} an object with details about the director
 * @requires passport
 * */
app.get ('/director/:Name', passport.authenticate('jwt', { session: false }), (req, res) =>{
  Movies.findOne({ 'Director.Name': req.params.Name })
  .then((movie) => {
      res.json(movie.Director.Bio);
  })
  .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
  });
});

// Create

/**
 * API request to register and validate a user
 * @function [POST]/users
 * @param {Object} User data from registration form
 * @returns {Object} an object containing the Username and Token
 * @requires bcrypt encrypted in models.js
 * */
app.post('/users',
// Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
[
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
    ], (req, res) =>
    {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if(user){
        return res.status(400).send(req.body.Username + ' already exists ');
      } else {
        Users
          .create({
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        })
          .then((user) => {
          res.status(201).json(user);
          })
          .catch((err) => {
              console.error(err);
              res.status(500).send('Error: ' + err);
            })
       }
     })
     .catch((err) => {
       console.error(err);
       res.status(500).send('Error: ' + err);
     });
 });

// Update

/**
 * API request to update user details
 * @function [PUT]/users/:Username
 * @param {string} Username
 * @returns {Object} an object of the updated User
 * @requires bcrypt encrypted in models.js
 * @requires passport
 * */
app.put ('/users/:Username',
[
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
  ], passport.authenticate('jwt', { session: false }), (req, res) =>{
  
  let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $set:
      {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      }
    },
    { new:true })
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

/**
 * API request to get the favorite movies list of a user
 * @function [GET]/users/:Username/FavoriteMovies
 * @param {string} Username
 * @returns {Object} an object of the favorite movie list
 * @requires passport
 */
app.get("/users/:Username/FavoriteMovies", passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
        if (user) {
          res.status(200).json(user.FavoriteMovies);
        } else {
          res.status(400).send("Could not find favorite movies for this user");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);


// Update

/**
 * API request to add a movie to a user's favorite movie list
 * @function [POST]/users/:Username/FavoriteMovies/:MovieID
 * @param {string} Username
 * @param {string} MovieID
 * @returns {Object} an object of thee User with the updated favorite movie list
 * @requires passport
 * */
app.post('/users/:Username/FavoriteMovies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username },
      { $push: { FavouriteMovies: req.params.MovieID }
  },
  { new: true },
  (err, updatedUser) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
      } else {
          res.json(updatedUser);
      }
  });
});


// Delete
app.delete('/users/:Username/FavouriteMovies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username },
      { $pull: { FavouriteMovies: req.params.MovieID }
  },
  { new: true },
    (err, updatedUser) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
      } else {
          res.json(updatedUser);
      }
  });
});

// Delete
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});



app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
