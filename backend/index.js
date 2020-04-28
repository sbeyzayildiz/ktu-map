const path = require('path')
const dotenv = require('dotenv')
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })
// console.log(process.env)
const express = require('express')
const db = require('./db');
const app = express()
db.sequelize.sync({force: true})
.then(
    () => {
        console.log('sync calistiii!!!')
    }
)
app.get('/', function (req, res) {
    res.send('Hellooooo!!!')
})

app.listen('8080')