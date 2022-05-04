const express = require('express'),
  morgan = require('morgan'),
  app = express(),
  bodyParser = require('body-parser')
  uuid= require('uuid');

app.use(morgan('common'));
app.use(bodyParser.json());
app.use(express.static('public'));

let users = [
  {
    name: "James",
    favouriteMovies: [],
    id: 1
  },
  {
    name: "Margo",
    favouriteMovies: ["Short Bus"],
    id: 2
  }
]

let movies = [
    {
        title: "Beautiful Thing",
        year: "1996",
        director: "Hettie MacDonald",
        genre: "Comedy"
    },
    {
        title: "Jackie Brown",
        year: "1997",
        director: "Quentin Tarantino",
        genre: "Crime"
    },
    {
        title: "Cloud Atlas",
        year: "2012",
        director: "The Wachowski sisters, Tom Tykwer",
        genre: "Drama"
    },
    {
        title: "X-Men",
        year: "2000",
        director:"Bryan Singer",
        genre: "Action"
    },
    {
        title: "Memento",
        year: "2000",
        director: "Christopher Nolan",
        genre: "Crime"
    },
    {
        title: "White Chicks",
        year: "2004",
        director: "Keenen Ivory Wayans",
        genre: "Comedy"
    },
    {
        title: "Short Bus",
        year: "2006",
        director: "John Cameron Mitchell",
        genre: "Comedy"
    },
    {
        title: "Paprika",
        year: "2006",
        director: "Satoshi Kon",
        gerne: "Animation"
    },
    {
        title: "Logan",
        year: "2017",
        director: "James Mangold",
        genre: "Drama"
    },
    {
        title: "Coda",
        year: "2021",
        director: "Sian Heder",
        genre: "Comedy"
    }
];

let genres = [
    {
      genre: "Comedy",
      description: " fiction that consists of discourses or works intended to be humorous or amusing by inducing laughter",
    },
    {
      genre: "Drama",
      description: "features stories with high stakes and a lot of conflicts. They're plot-driven and demand that every character and scene move the story forward. Dramas follow a clearly defined narrative plot structure, portraying real-life scenarios or extreme situations with emotionally-driven characters"
    },
    {
      genre: "Action",
      description: " fast-paced and include a lot of action like fight scenes, chase scenes, and slow-motion shots. They can feature superheroes, martial arts, or exciting stunts.",
    },
    {
      genre: "Animation",
      description: " a collection of illustrations that are photographed frame-by-frame and then played in a quick succession",
    },
    {
      genre: "Crime",
      description: "fictionalises crimes, their detection, criminals and their motives. It is usually distinguished from mainstream fiction and other genres such as science fiction or historical fiction, but boundaries can be, and indeed are, blurred."
    }
];

let directors = [
  {
    director: "Hettie MacDonald",
    bio: "an English film,[1] theatre and television director.[2] Macdonald is known as the director of the Hugo Award-winning 2007 episode of the Doctor Who series, Blink, and won a Grand Prix award, an International Jury Award - Honorable Mention and a People's Choice Award for her work on the film Beautiful Thing.",
    born: "1962"
},
{
    director: "Quentin Tarantino",
    bio: "an American filmmaker, actor, film critic and author. His films are characterized by frequent references to popular culture and film history, nonlinear storylines, dark humor, stylized violence, extended dialogue, pervasive use of profanity, cameos and ensemble casts.",
    born: "1963"
},
{
    director: "The Wachowski Sisters",
    bio: "Lana Wachowski and Lilly Wachowski are American film and television directors, writers and producers. The sisters are both trans women. Collectively known as the Wachowskis, the sisters have worked as a writing and directing team through most of their careers.",
    born: "Lana (1965) Lilly (1967)"
},
{
    director:"Bryan Singer",
    bio: "an American film director, producer and screenwriter. He is the founder of Bad Hat Harry Productions and has produced or co-produced almost all of the films he has directed.",
    born: "1965"
},
{
    director: "Christopher Nolan",
    bio: "is a British-American film director, producer, and screenwriter. His films have grossed more than US$5 billion worldwide, and have garnered 11 Academy Awards from 36 nominations",
    bron: "1970"
},
{
    director: "Keenen Ivory Wayans",
    bio: "an American actor, comedian, and filmmaker. He is a member of the Wayans family of entertainers. Wayans first came to prominence as the host and the creator of the 1990–1994 Fox sketch comedy series In Living Color.",
    born: "1958"
},
{
    director: "John Cameron Mitchell",
    bio: "is an American actor, playwright, screenwriter, and director. Best known as the writer, director and star of the 2001 film Hedwig and the Angry Inch, in 2022 they portrayed the role of Joe Exotic in the Peacock limited series Joe vs. Carole.",
    born: "1963"
},
{
    director: "Satoshi Kon",
    bio: "was a Japanese film director, animator, screenwriter and manga artist from Sapporo, Hokkaidō and a member of the Japanese Animation Creators Association. Tsuyoshi Kon, a guitarist, is his brother. He was a graduate of the Graphic Design department of the Musashino Art University. He is best known for his acclaimed anime films Perfect Blue (1997), Millennium Actress (2001), Tokyo Godfathers (2003), and Paprika (2006). He died of pancreatic cancer at the age of 46 on August 24, 2010",
    born: "1963"
},
{
    director: "James Mangold",
    bio: "an American film and television director, screenwriter and producer. He is best known[2] for the films Cop Land (1997), Girl, Interrupted (1999), Walk the Line (2005), The Wolverine (2013) and Logan (2017), the last of which earned him a nomination for the Academy Award for Best Adapted Screenplay. He then directed and produced the sports drama film Ford v Ferrari (2019), which earned him a nomination for the Academy Award for Best Picture.",
    born: "1963"
},
{
    director: "Sian Heder",
    bio: " an American filmmaker. She is known for writing and directing the comedy-drama film Tallulah (2016), and the coming-of-age film CODA (2021), for which she won the Academy Award for Best Adapted Screenplay, while the film won for Best Picture.",
    born: "1977"
}
];

app.get('/', (req, res) => {
  res.send('Welcome to Movies that MoviMe')
});

// Create
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser)
  } else {
    res.status(400).send('users need names')
  }
});

// Read
app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

// Read
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

app.get('/movies/:title', (req, res) => {
   res.json(movies.find((movie) => { return movie.title === req.params.title; }));

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('no such movie')
  }
});

// Read
app.get('/genres', (req, res) => {
  res.status(200).json(genres);
});

app.get('/genres/:genre', (req, res) => {
   res.json(genres.find((result) => { return result.genre === req.params.genre; }));

  if (result) {
    res.status(200).json(result);
  } else {
    res.status(400).send('no such genre')
  }
});

// Read
app.get('/directors', (req, res) => {
  res.status(200).json(directors);
});

app.get('/directors/:director', (req, res) => {
   res.json(directors.find((person) => { return person.director === req.params.director; }));

  if (person) {
    res.status(200).json(person);
  } else {
    res.status(400).send('no such director')
  }
});

/*app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find( users => user.id == id );

  if (user) {
      user.name = updatedUser.name;
      res.status(200).json(user);
    } else {
      res.status(400).send('no such user');
    }

}); */

// Update
app.put('/users/:user', (req, res) => {
    res.send('User account updated');
});

// Update
app.post('/users/:user/favourites', (req, res) => {
    res.status(201);
    res.send('The movie has been add to favorites');
});

// Delete
app.delete('/users/:user/favourites', (req, res) => {
    res.send('The movie has been removed from favorites');
});

// Delete
app.delete('/users/:user', (req, res) => {
    res.send('You have been removed')
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () =>{
    console.log('Your app is listening on port 8080.');
});
