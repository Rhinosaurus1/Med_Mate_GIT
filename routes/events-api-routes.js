// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================

// Requiring our models
var db = require("../models");
var Sequelize = require('sequelize');
var Op = Sequelize.Op;


// Routes
// =============================================================
module.exports = function(app) {

  var prev = new Date();
  prev.setHours(0,0,0,0);
  prev.setHours(prev.getHours()-5);

  var next = new Date();
  next.setDate(next.getDate()+1);
  next.setHours(0,0,0,0);
  next.setHours(next.getHours()-5);
  next.setSeconds(next.getSeconds()-1);

  	/*
	var date = new Date();
	date.setDate(date.getDate()-1);
	var newDate = "'" + date.getDate() + '-' + (date.getMonth()+1) + '-' + date.getFullYear() + "'";
	console.log("newDate: " + newDate);

	var d =  new Date();
	d.setDate(d.getDate()-1);
	d.setHours(0,0,0,0);
	console.log(d);
	*/



  app.get("/api/events", function(req, res) {
    var query = {
      event_time: {
        [Op.between]: [prev, next]
      }
    }
    db.Events.findAll({
      where: query,
      include: [
        {
          model: db.Meds,
          include: [
            {
              model: db.User
            }
          ]
        }
      ],
      order: ['event_time']
    }).then(function(dbEvents) {
      res.json(dbEvents);
    });
  });

  app.put("/api/events/:id", function(req, res) {
  	console.log("req.body: " + JSON.stringify(req.body));
    db.Events.update(
      {taken_status: true},
      {
        where: {
          id: req.params.id
        }
      }).then(function(result) {
      	db.Meds.update(
      		{remaining_count: Sequelize.literal('remaining_count - 1')},
      		{
      			where: {
      				id: req.body.Med.id
      			}
      		}).then(function(dbEvents){
        		res.json(dbEvents);
        	});
      });
  });


};