const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
const uuid = require('./helpers/uuid');
const fs = require('fs');
const { json } = require('express/lib/response');
let database = require('./db/db.json');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));


// Gets index.html
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/public/index.html')));

// Gets notes.html
app.get('/notes', (req, res) => res.sendFile(path.join(__dirname, '/public/notes.html')));

// Gets all notes in db.json file
app.get('/api/notes', (req, res) => {

  fs.readFile('./db/db.json', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      return res.send(data);
    }
  })
});


// Posts a new note into db.json file
app.post('/api/notes', (req, res) => {
  const { title, text } = req.body;

  if (title && text) {
    const newNote = {
      title,
      text,
      id: uuid()
    }

    fs.readFile('./db/db.json', (err, data) => {
      if (err) {
        console.error(err);
      } else {
        const jsonData = JSON.parse(data);
        jsonData.push(newNote);
        database = jsonData;
        fs.writeFile('./db/db.json', JSON.stringify(jsonData, null, 4), (writeErr) => {
          if (writeErr) {
            console.error(writeErr);
          } else {
            console.log(`${title} note has been saved`);
          }
        });
      }
    });

    const response = {
      body: newNote,
    };

    res.status(201).json(response);
    } else {
    res.status(500).json('Error in posting new note');
  }
});


// deletes note by id
app.delete('/api/notes/:id', (req, res) => {
  const filteredData = database.filter((note) => {
    return note.id !== req.params.id;
  });

  database = filteredData;
  fs.writeFile('./db/db.json', JSON.stringify(filteredData), (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`${req.params.id} note has been deleted`);
    }
  })

  return res.json(filteredData);
})

app.listen(port, () =>
  console.log(`Serving static asset routes at http://localhost:${port}`)
);
