const express = require('express')
const db = require('./db');
const app = express()

app.get('/', function(req,res) {
    res.send('Hellooooo!!!')
})

app.listen('8080')