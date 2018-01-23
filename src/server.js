const express = require('express');
const db = require('sqlite');
const bodyParser = require('body-parser');
const moment = require('moment');
const { resolve } = require('url');
const fetch = require('node-fetch')
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env["PORT"] || 3002;
const amiralPort =  process.env["AMIRAL_PORT"] || 3000;
const name = process.env["NAME"] || "charles_de_gaulle"
const firstKey = process.env["KEY"] || ""
const fiveMinutes =  5 * 60 * 1000
function routes(app,db){

    let lastKey = ""
    function getKey(key){
        fetch(`http://localhost:${amiralPort}/code`,{
                method:"put",
                body: JSON.stringify({
                    key: key,
                    name: name
                })
        })
        .then(response => response.json())
        .then((response)=>{
            if(lastKey !== response.id){
                console.log('got new key', response.id)
                lastKey = response.id
                return db.run("insert into keys (id) values (?)", response.id)
            }
            else{
                console.log("key already exists, waiting for next one")
                return Promise.resolve(response.id)
            }
        }).catch(err => console.error(err));
    }


   
    // Get the new key from amiral when satellite instance
    app.get('/key', async (req,res) => {
        const results = await db.get('select id from keys where date = (select MAX(date) from keys)')
        res.send(results)
    });
    app.get('/keys', async (req, res, next) => {
        const keys = await db.all('SELECT * FROM keys'); // <=
        res.send(keys)
    });
    
    if (firstKey!==""){
        getKey(firstKey)
    } else {
       db.get('select id from keys where date = (select MAX(date) from keys)')
       .then(key => getKey(key.id))
    }
    setInterval(()=>{
        db.get('select id from keys where date = (select MAX(date) from keys)')
            .then(key => getKey(key.id))
    },fiveMinutes)
}



db.open('./satellite.db')
    .then(db => routes(app, db))
    .then(() => app.listen(port))
    .then(()=>console.log('Connected on port ' + port))
    .catch((err) => console.error(err.stack))

