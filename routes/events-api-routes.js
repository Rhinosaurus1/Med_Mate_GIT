// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================

// Requiring our models
var db = require("../models");
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var nodemailer = require("nodemailer");


// Routes
// =============================================================
module.exports = function(app) {


	var date = new Date();
	var newDate = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
	newDate = newDate + " 08:00:00";
	console.log("newDate: " + newDate);

	var nextdate = new Date();
	nextdate.setDate(nextdate.getDate()+1);
	var nextnewDate = nextdate.getFullYear() + '-' + (nextdate.getMonth()+1) + '-' + nextdate.getDate();
	nextnewDate = nextnewDate + " 07:59:59";
	console.log("nextnewDate: " + nextnewDate);


  app.get("/api/events", function(req, res) {
    var query = {
      event_time: {
        [Op.between]: [newDate, nextnewDate]
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


  //email route
  
  app.get("/api/events/send/:email", function(req,res){
    //set email address as entered email
    var emailAddress = req.params.email;
    console.log("emailAddress: " + emailAddress);
    var query = {
      event_time: {
        [Op.between]: [newDate, nextnewDate]
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
      var eventsObj = {
        eventsDB: dbEvents
      };

      //set up node mailer default sender
      var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: 'billstopay109@gmail.com',
            pass: 'blake150'
        }
      });

      //get month and year for email
      var monthsArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      var date = new Date();
      var month = monthsArray[date.getMonth()];
      var year = date.getFullYear();
      var monthYear = month+"-"+year;

      var eventsText = "";

      //loop through events due and html-ify for email, adding to total text
      for(i=0; i<eventsObj.eventsDB.length; i++){
        var eventItem = ("<p>Event Name:   <b>" + eventsObj.eventsDB[i].Med.med_name + "</b>");
        eventsText = eventsText + eventItem;
      };

      //set up email to send, to , from, subject, text
      var mailOptions = {
        from: 'billstopay109@gmail.com',
        to: emailAddress,
        subject: "Pills to take today",
        text: "Pills to take today",
        html: "<p><b>THE FOLLOWING PILLS ARE TO BE TAKEN TODAY </b></p>" + eventsText
      };

      //send email, log error if any, return "sent" if no error
      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              return console.log(error);
          }
      });
      res.send("sent");
    });
  });
  


};