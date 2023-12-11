require ('dotenv').config();
const express = require ('express');
const router = express();
const mongoose = require ('mongoose');
const expressLayout = require('express-ejs-layouts');
const session = require ('express-session');
const ejs = require ('ejs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT;

mongoose.connect(process.env.DB_URI, {useNewUrlParser : true, useUnifiedTopology : true})
.then(()=> { console.log ('Database Connected')})
.catch( (err)=>{console.log(err)});

// const db = mongoose.connection;
// db.on('error', (error) => { console.log(error)});
// db.once ('open' , () => { console.log ('Connected')})

// Used for body parsing for POST and PUT request.
app.use (express.urlencoded({extended : false}));
app.use (express.json());


app.use (session ({
    secret : 'my secret key',
    saveUninitialized : true,
    resave : false,
}))
app.use ((req,res,next) => {
    res.locals.message = req.session.message
    delete req.session.message
    next();
})
//Uses to the share with CSS or Js files the images in Crud App/uploads
app.use(express.static('../Crud App/uploads'));

// Template Engine 
app.use(expressLayout);
app.set ('view engine', 'ejs' );
const routes = require ('../Crud App/routes/routes');
// It allows the use Express.Router in every request.
const welcome = require ('../Crud App/routes/welcome')

app.use ('', routes);





app.listen (PORT , ()=>{
    console.log("Port opened at " + PORT)
})