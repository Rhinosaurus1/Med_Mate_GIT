// *****************************************************************************
// Server.js - This file is the initial starting point for the Node/Express server.
//
// ******************************************************************************
// *** Dependencies
// =============================================================
var express = require('express')
var path = require('path')
var webpack = require('webpack')
var bodyParser = require("body-parser");
var passport = require("passport");
var session = require("express-session");

// Sets up the Express App
// =============================================================
var app = express()
var PORT = process.env.PORT || 3000;

var webpackMiddleware = require("webpack-dev-middleware")
var webpackConfig = require('./webpack.config.js')

app.use(webpackMiddleware(
  webpack(webpackConfig),
  { publicPath: '/' }
))

// Requiring our models for syncing
var db = require("./models");

// Sets up the Express app to handle data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// For Passport
app.use(session({ 
  secret: 'keyboard cat',
  resave: true, 
  saveUninitialized:true
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// Static directory
app.use(express.static("public"));


app.get('/users', function(req, res){
  res.sendFile(path.join(__dirname, 'public', 'user-manager.html'))
});

app.get('/today', function(req, res){
  res.sendFile(path.join(__dirname, 'public', 'today.html'))
});

app.get('/med-list', function(req, res){
  res.sendFile(path.join(__dirname, 'public', 'med-list.html'))
});

app.get('/med-manager', function(req, res){
  res.sendFile(path.join(__dirname, 'public', 'med-manager.html'))
});

/*
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
});
*/

// Routes
// =============================================================
require("./routes/html-routes.js")(app);
require("./routes/user-api-routes.js")(app);
require("./routes/meds-api-routes.js")(app);
require("./routes/events-api-routes.js")(app);


// Syncing our sequelize models and then starting our Express app
// =============================================================
db.sequelize.sync({ force: true }).then(function() {
  app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
  });
});