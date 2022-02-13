const express = require('express');
const app = express();
const PORT = process.env.port || 3001;
const path = require('path');
const uuid = require('./helpers/uuid');
const fs = require('fs');
const { json } = require('express/lib/response');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));


// Gets index.html
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/public/')));

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
      note_id: uuid()
    }

    fs.readFile('./db/db.json', (err, data) => {
      if (err) {
        console.error(err);
      } else {
        const jsonData = JSON.parse(data);
        jsonData.push(newNote);
  
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

app.listen(PORT, () =>
  console.log(`Serving static asset routes at http://localhost:${PORT}`)
);
