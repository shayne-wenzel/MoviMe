const express = require('express');
const bodyParser = require('body-parser');
uuid = require('uuid');

const morgan = require('morgan');
const app = express();
const { check, validationResult } = require('express-validator');


const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

// const request = require('request');

mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// mongoose.connect('mongodb://localhost:27017/MoviMe', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let auth = require('./auth')(app);

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

const cors = require('cors');
app.use(cors());

// const cors = require('cors');

// let allowedOrigins = ['http://localhost:1234', 'http://localhost:8080', 'http://testsite.com'];

// app.use(cors({
//   origin: (origin, callback) => {
//     if(!origin) return callback(null, true);
//     if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
//       let message = 'The CORS policy for this application doesnt allow access from origin ' + origin;
//       return callback(new Error(message ), false);
//     }
//     return callback(null, true);
//   }
// }));

// let xhr = new XMLHttpRequest();
// xhr.open('GET', 'http://localhost:8080', 'http://localhost:1234', 'https://movime-api.herokuapp.com', true);
// xhr.withCredentials = true;
// xhr.send(null);

const passport = require('passport');
require('./passport');

app.use(morgan('common'));

// Get

app.get('/', (req, res) => {
  res.send('Welcome to Movies that MoviMe')
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});


// Read
app.get('/movies', (req, res) =>{
  Movies.find()
  .then((movies) => {
      res.status(201).json(movies);
  })
  .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
  });
});

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

app.post('/users',
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
app.put ('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) =>{
  Users.findOneAndUpdate({ User: req.params.Username }, {
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

// Update
app.post('/users/:Username/FavouriteMovies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
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

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
