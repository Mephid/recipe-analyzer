const express = require('express');
const path = require('path');
const routes = require('./routes')
const bodyParser = require('body-parser')
const session = require('express-session')

const app = express();
const PORT = process.env.PORT || 5000;


//dotenv
require('dotenv').config();

//Parsing req.body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(session({secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false}))
app.use(express.static(path.join(__dirname , '/public')));


//Rendering index.pug
app.set('view engine', 'pug')



app.use('/', routes)

app.listen(PORT, () => {console.log(`Listening on PORT ${PORT}`)})
