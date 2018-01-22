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

app.get('/', function (req, res) {
    res.json({ message: 'hooray! welcome to our api!' + moment().format() });
});

app.get('/keys', async (req, res, next) => {
    try {
        const keys = await db.all('SELECT * FROM keys'); // <=
        res.send(keys);
    } catch (err) {
        next(err);
    }
});

app.get('/key/:id', async (req, res, next) => {
    try {
        const currKey = await db.get('SELECT' + req.params.id + ' FROM keys ORDER BY date DESC');
        res.send(currKey);
    } catch (err) {
        next(err);
    }
});

app.put('/key', async (req, res, next) => {
    const lastKey = req.body.id;
    Promise.resolve().then(() => db.run("INSERT INTO keys VALUES (" + lastKey + ")"), res.send(lastKey)).catch(err => next(err));
});

Promise.resolve()
// First, try to open the database
.then(() => db.open('./database/satellite', { Promise }))
// Display error message if something went wrong
.catch(err => console.error(err.stack))
// Finally, launch the Node.js app
.finally(() => app.listen(port), console.log('Connected on port ' + port));