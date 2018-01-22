import express from 'express';
import db from 'sqlite';
import Promise from 'bluebird';
import bodyParser from 'body-parser';
import moment from 'moment'
import { resolve } from 'url';

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

app.get('/', function (req, res) {
    res.json({ message: 'hooray! welcome to our api!' + moment().format() });
});

app.get('/key', async (req, res, next) => {
    try {
        const keys = await db.all('SELECT * FROM Key LIMIT 10'); // <=
        res.send(keys);
    } catch (err) {
        next(err);
    }
});

app.get('/key/:id', async (req, res, next) => {
    try {
        const currKey = await db.get('SELECT id FROM keys ORDER BY date DESC')
        res.send(currKey);
    } catch (err) {
        next(err)
    }
});

app.put('/key/:id', async (req, res, next) => {
    const lastKey = res.params.id
    Promise.resolve()
        .then(() =>
            await db.run("INSERT INTO keys VALUES (" + lastKey + ")"),
        res.send(lastKey)
        )
        .catch((err) =>
            next(err)
        )
});

Promise.resolve()
    // First, try to open the database
    .then(() => db.open('./database/satellite', { Promise }))
    // Display error message if something went wrong
    .catch((err) => console.error(err.stack))
    // Finally, launch the Node.js app
    .finally(() => app.listen(port),
    console.log('Connected on port ' + port))