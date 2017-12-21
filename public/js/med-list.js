$(document).ready(function() {
  /* global moment */

  // medsContainer holds all of our meds
  var medsContainer = $(".meds-container");

  // Click events for the edit and delete buttons
  $(document).on("click", "button.delete", handleMedsDelete);
  $(document).on("click", "button.edit", handleMedsEdit);
  $(document).on("click", "button.pic", obtainMedPics);
  // Variable to hold our meds
  var meds;

  // The code below handles the case where we want to get meds meds for a specific user
  // Looks for a query param in the url for user_id
  var url = window.location.search;
  var userId;
  if (url.indexOf("?user_id=") !== -1) {
    userId = url.split("=")[1];
    getMeds(userId);
  }
  // If there's no userId we just get all meds as usual
  else {
    getMeds();
  }


  // This function grabs meds from the database and updates the view
  function getMeds(user) {
    userId = user || "";
    if (userId) {
      userId = "/?user_id=" + userId;
    }
    $.get("/api/meds" + userId, function(data) {
      meds = data;
      if (!meds || !meds.length) {
        displayEmpty(user);
      }
      else {
        initializeRows();
      }
    });
  }

  // This function does an API call to delete meds
  function deleteMeds(id) {
    $.ajax({
      method: "DELETE",
      url: "/api/meds/" + id
    })
    .done(function() {
      getMeds();
    });
  }

  // InitializeRows handles appending all of our constructed meds HTML inside medsContainer
  function initializeRows() {
    medsContainer.empty();
    var medsToAdd = [];
    for (var i = 0; i < meds.length; i++) {
      medsToAdd.push(createNewRow(meds[i]));
    }
    medsContainer.append(medsToAdd);
  }

  // This function constructs a meds's HTML
  function createNewRow(meds) {

    var newMedsPanel = $("<div>");
    newMedsPanel.addClass("panel panel-default");
    var newMedsPanelHeading = $("<div>");
    newMedsPanelHeading.addClass("panel-heading");
    var deleteBtn = $("<button>");
    deleteBtn.text("x");
    deleteBtn.addClass("delete btn btn-danger");
    var editBtn = $("<button>");
    editBtn.text("EDIT");
    editBtn.addClass("edit btn btn-info");
    var picBtn = $("<button>");
    picBtn.text("View Picture(s)");
    picBtn.addClass("pic btn btn-success");
    var newMedsTitle = $("<h2>");
    var newMedsDate = $("<small>");
    var newMedsUser = $("<h5>");
    newMedsUser.text("Med for: " + meds.User.user_name);
    newMedsUser.css({
      float: "right",
      color: "blue",
      "margin-top":
      "-10px"
    });
    var newMedsPanelBody = $("<div>");
    newMedsPanelBody.addClass("panel-body");
    var newMedsBody = $("<p>");
    newMedsTitle.text(meds.med_name + "  -  " + meds.med_dose);
    newMedsBody.text(meds.instructions + " - " + meds.freq_times + " times  -  " + meds.freq_main);
    newMedsPanelHeading.append(deleteBtn);
    newMedsPanelHeading.append(editBtn);
    newMedsPanelHeading.append(picBtn);
    newMedsPanelHeading.append(newMedsTitle);
    newMedsPanelHeading.append(newMedsUser);
    newMedsPanelBody.append(newMedsBody);
    newMedsPanel.append(newMedsPanelHeading);
    newMedsPanel.append(newMedsPanelBody);
    newMedsPanel.data("meds", meds);
    return newMedsPanel;
  }

  // This function figures out which meds we want to delete and then calls deletemeds
  function handleMedsDelete() {
    var currentMeds = $(this)
      .parent()
      .parent()
      .data("meds");
    deleteMeds(currentMeds.id);
  }

  // This function figures out which meds we want to edit and takes it to the appropriate url
  function handleMedsEdit() {
    var currentMeds = $(this)
      .parent()
      .parent()
      .data("meds");
    window.location.href = "/med-manager?meds_id=" + currentMeds.id;
  }

  // This function displays a messgae when there are no meds
  function displayEmpty(id) {
    var query = window.location.search;
    var partial = "";
    if (id) {
      partial = " for User #" + id;
    }
    medsContainer.empty();
    var messageh2 = $("<h2>");
    messageh2.css({ "text-align": "center", "margin-top": "50px" });
    messageh2.html("No meds yet" + partial + ", navigate <a href='/med-manager" + query +
    "'>here</a> in order to get started.");
    medsContainer.append(messageh2);
  }

  var ctx = document.getElementById("myChart").getContext('2d');
  var myDoughnutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ["Meds Taken", "Meds Not Taken"],
        datasets: [{
            label: 'meds taken',
            data: [12, 19],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        cutoutPercentage: 50,
        title: {
          display: true,
          fontSize: 20,
          text: 'Number of Meds Taken Today'
        }
    }

  });

  function obtainMedPics() {
    event.preventDefault();
    $(".slideshow-container").empty();
    var chosenMed = $(this)
      .parent()
      .parent()
      .data("meds");

    console.log("chosenMed: " + chosenMed);
    var medName = chosenMed.med_name;
    console.log("medName: " + medName);
    var medDose = chosenMed.med_dose;
    console.log("medDose: " + medDose);
    var medDoseNum = medDose.match(/\d+/)[0];
    console.log("medDoseNum: " + medDoseNum);
    var medDoseUnit = (medDose.replace(/[0-9]/g,'')).toUpperCase();
    console.log("medDoseUnit: " + medDoseUnit);
    var medDoseNew = medDoseNum + " " + medDoseUnit;
    console.log("medDoseNew: " + medDoseNew);
    var queryURL = "https://rximage.nlm.nih.gov/api/rximage/1/rxnav?&resolution=600&rLimit=50&name="+ medName;
    //Use ajax call to obtain images asychronously
    $.ajax({
      url: queryURL,
      method: "GET"
    }).done(function(response){
        console.log("response.nlmRxImages: " + response.nlmRxImages);
        var likelyArray = [];
        for(var i = 0; i<response.nlmRxImages.length; i++){
          if( (response.nlmRxImages[i].name).indexOf(medDoseNew) !== -1){
            likelyArray.push(response.nlmRxImages[i].imageUrl);
          }
        }
        if(likelyArray.length === 0){
          alert("No Image available");
          return;
        }
        console.log("likelyArray: " + likelyArray);
        var carouselContainer = $(".slideshow-container");
        //var item = $(".carousel-inner");
        $("#picModal").modal("toggle");
          $.each(likelyArray, function( intIndex, objValue ){
            console.log("intIndex: " + intIndex);
            console.log("objValue: " + objValue);
            //list.append($( '<li data-target="#myCarousel" data-slide-to="' +intIndex+ '"</li>' ));
            carouselContainer.append($('<div class="mySlides"><img src="' + objValue +'"style=width:100%></div><br>'));      
          });
          $('.carousel-indicators li:first').addClass('active');
          $('.carousel-inner li:first').addClass('active');
      });
  }




});
