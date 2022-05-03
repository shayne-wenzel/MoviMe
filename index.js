const express = require('express'),
  morgan = require('morgan');

const app = express();

app.use(morgan('common'));

let topMovies = [
  {
    title: 'Beautiful Thing',
    year: '1996'
  },
  {
    title: 'Jackie Brown',
    year: '1997'
  },
  {
    title: 'The Matrix',
    year: '1999'
  },
  {
    title: 'X-Men',
    year: '2000'
  },
  {
    title: 'Momento',
    year: '2000'
  },{
    title: 'White Chicks',
    year: '2004'
  },
  {
    title: 'Short Bus',
    year: '2006'
  },
  {
    title: 'Paprika',
    year: '2006'
  },
  {
    title: 'Logan',
    year: '2017'
  },
  {
    title: 'Coda',
    year: '2021'
  }
];

app.get('/', (req, res) => {
  res.send('Welcome to Movies that MoviMe')
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
});

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () =>{
    console.log('Your app is listening on port 8080.');
});
