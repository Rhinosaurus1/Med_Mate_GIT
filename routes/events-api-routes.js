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

  var date = new Date();
  //var newDate = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + ((date.getDate()-1)+1);
  var prevDate = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + (date.getDate()-1);
  var nextDate = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + (date.getDate()+1);
  //var mNewDate = moment(newDate,"YYYY-MM-DD");
  //console.log("newDate: " + newDate);

  app.get("/api/events", function(req, res) {
    var query = {
      event_time: {
        [Op.between]: [prevDate, nextDate]
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
      ]
      //include: [db.Meds],
      //include: [db.User]
    }).then(function(dbEvents) {
      res.json(dbEvents);
    });
  });

  app.post("/api/events", function(req, res) {
    db.Events.bulkCreate(req.body).then(function(dbEvents) {
      res.json(dbEvents);
    });
  });

  app.put("/api/events", function(req, res) {
    db.Events.update(
      req.body,
      {
        where: {
          id: req.body.id
        }
      }).then(function(dbEvents) {
        res.json(dbEvents);
      });
  });
};