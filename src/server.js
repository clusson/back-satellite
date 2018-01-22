const express = require('express');
const db = require('sqlite');
const Promise = require('bluebird');
const bodyParser = require('body-parser');
const moment = require('moment');
const { resolve } = require('url');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

app.get('/', async (req, res, next) => {
    Promise.resolve()
        .then(() =>
            res.json({ message: 'hooray! welcome to our api!' + moment().format() })
        )
        .catch((err) =>
            next(err)
        )
});

// Get the new key from amiral when satellite instance
app.get('/key', async (req, res, next) => {
    const newKey = await res.params.id
    Promise.resolve()
        .then(() =>
            db.run("Insert into keys (id) values (?)", newKey)
        )
        .catch((err) =>
            next(err)
        )
});



app.get('/keys', async (req, res, next) => {
    const keys = await db.all('SELECT * FROM keys'); // <=
    Promise.resolve()
        .then(() =>
            res.send(keys)
        )
        .catch((err) =>
            next(err)
        )
});


app.get('/key/:id', async (req, res, next) => {
    const currKey = await db.get('SELECT * FROM keys WHERE id =' + req.params.id)
    Promise.resolve()
        .then(() =>
            res.send(currKey)
        )
        .catch((err) =>
            next(err)
        )
});

app.put('/key', async (req, res, next) => {
    const currKey = await db.get('SELECT MAX(date) FROM keys')
    currKey = req.body.id
    const lastKey = await res.body.id
    Promise.resolve()
        .then(() =>
            db.run("Insert into keys (id) values (?)", lastKey)
        )
        .catch((err) =>
            next(err)
        )
});

Promise.resolve()
    // First, try to open the database
    .then(() => db.open('./satellite.db', { Promise }))
    // Display error message if something went wrong
    .catch((err) => console.error(err.stack))
    // Finally, launch the Node.js app
    .finally(() => app.listen(port),
    console.log('Connected on port ' + port))