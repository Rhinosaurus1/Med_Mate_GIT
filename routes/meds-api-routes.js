// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================

// Requiring our models
var db = require("../models");

// Routes
// =============================================================
module.exports = function(app) {


  app.get("/api/meds", function(req, res) {
    var query = {};
    if (req.query.user_id) {
      query.UserId = req.query.user_id;
    }
    db.Meds.findAll({
      where: query,
      include: [db.User]
    }).then(function(dbMeds) {
      res.json(dbMeds);
    });
  });

  app.get("/api/meds/:id", function(req, res) {
    db.Meds.findOne({
      where: {
        id: req.params.id
      },
      include: [db.User]
    }).then(function(dbMeds) {
      res.json(dbMeds);
    });
  });

  app.post("/api/meds", function(req, res) {
    db.Meds.create(req.body).then(function(dbMeds) {
      res.json(dbMeds);
    });
  });

  app.delete("/api/meds/:id", function(req, res) {
    db.Meds.destroy({
      where: {
        id: req.params.id
      }
    }).then(function(dbMeds) {
      res.json(dbMeds);
    });
  });

  app.put("/api/meds", function(req, res) {
    db.Meds.update(
      req.body,
      {
        where: {
          id: req.body.id
        }
      }).then(function(dbMeds) {
        res.json(dbMeds);
      });
  });
};
