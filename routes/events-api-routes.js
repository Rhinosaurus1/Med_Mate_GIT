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
var schedule = require("node-schedule");
// Routes
// =============================================================
module.exports = function(app) {

  var j = schedule.scheduleJob('*/1 * * * *', function(){
    getAllEvents();
  });


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



  function getAllEvents(){

        var date = new Date();
        var newDate = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
        newDate = newDate + " 08:00:00";
        console.log("FUNCTION newDate: " + newDate);

        var nextdate = new Date();
        nextdate.setDate(nextdate.getDate()+1);
        var nextnewDate = nextdate.getFullYear() + '-' + (nextdate.getMonth()+1) + '-' + nextdate.getDate();
        nextnewDate = nextnewDate + " 07:59:59";
        console.log("FUNCTION nextnewDate: " + nextnewDate);

        console.log("I HIT THE APP.GET");
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
          //res.json(dbEvents);
          //console.log("DB EVENTS: " + JSON.stringify(dbEvents));
          //console.log(JSON.stringify(dbEvents[0]));
        
          var emailAddress = "";

          //if(typeof response.nlmRxImages == 'undefined' || response.nlmRxImages.length == 0){
          if (typeof dbEvents == 'undefined' || dbEvents.length == 0){
            return;
          }
          else{
            emailAddress = dbEvents[0].Med.User.email_address;
            console.log("dbEvents Email: " + dbEvents[0].Med.User.email_address);
          }

          var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
                user: 'billstopay109@gmail.com',
                pass: 'blake150'
            }
          });

          var eventsText = "";

          for(var i=0; i<dbEvents.length; i++){
              var eventItem = ("<p>Name:   <b>" + dbEvents[i].Med.med_name + "</b>   Take Time:   <b>" + dbEvents[i].event_time +  "</b>   Taken Already?:   <b>"  +  dbEvents[i].taken_status + "</b></p>");
              eventsText = eventsText + eventItem;
          }

          //set up email to send, to , from, subject, text
          var mailOptions = {
            from: 'billstopay109@gmail.com',
            to: emailAddress,
            subject: "Medications to take today",
            text: "Medications to take today",
            html: "<p><b>THE FOLLOWING MEDICATIONS ARE TO BE TAKEN TODAY </b></p>"  + eventsText
          };

          //send email, log error if any, return "sent" if no error
          transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  return console.log(error);
              }
          });
        });
  };




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

      if (typeof eventsObj.eventsDB == 'undefined' || eventsObj.eventsDB.length == 0){
        return;
      }

      //set up node mailer default sender
      var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: 'billstopay109@gmail.com',
            pass: 'blake150'
        }
      });

      var eventsText = "";

      //loop through events due and html-ify for email, adding to total text
      for(var i=0; i<eventsObj.eventsDB.length; i++){
        var eventItem = ("<p>Name:   <b>" + eventsObj.eventsDB[i].Med.med_name + "</b>   Take Time:   <b>" + eventsObj.eventsDB[i].event_time +  "</b>   Taken Already?:   <b>"  +  eventsObj.eventsDB[i].taken_status + "</b></p>");
        eventsText = eventsText + eventItem;
      };

      //set up email to send, to , from, subject, text
      var mailOptions = {
        from: 'billstopay109@gmail.com',
        to: emailAddress,
        subject: "Medications to take today",
        text: "Medications to take today",
        html: "<p><b>THE FOLLOWING MEDICATIONS ARE TO BE TAKEN TODAY </b></p>"  + eventsText
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