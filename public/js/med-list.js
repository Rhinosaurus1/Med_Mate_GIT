$(document).ready(function() {
  /* global moment */

  // medsContainer holds all of our meds
  var medsContainer = $(".meds-container");

  // Click events for the edit and delete buttons
  $(document).on("click", "button.delete", handleMedsDelete);
  $(document).on("click", "button.edit", handleMedsEdit);
  $(document).on("click", "button.pic", obtainMedPics);
  $(document).on("click", "button.chart", obtainMedChart);
  // Variable to hold our meds
  var meds;

  // The code below handles the case where we want to get meds meds for a specific user
  // Looks for a query param in the url for user_id
  // If we have this section in our url, we pull out the meds id from the url
  // In '?meds_id=1', medsId is 1
  var url = window.location.search;
  var userId;

  if (url.lastIndexOf("?user_id=") !== -1) {
    userId = url.split("=")[1];
    getMeds(userId);
  }

  console.log("USER ID " + userId);
 

  $(document).on("click", "#dashBtn", goToDashboard);
  $(document).on("click", "#newMedBtn", goToNewMed);
  $(document).on("click", "#todayBtn", goToToday);


  function goToDashboard(){
    window.location.href='/dashboard?user_id=' + userId; 
  }

  function goToNewMed(){
    window.location.href='/med-manager?user_id=' + userId; 
  }

  function goToToday(){
    window.location.href='/today?user_id=' + userId; 
  }

  // This function grabs meds from the database and updates the view
  function getMeds(user) {
    userId = user || "";
    if (userId) {
      var link = "/?user_id=" + userId;
    }
    $.get("/api/meds" + link, function(data) {
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
      getMeds(userId);
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
    console.log("meds: " + JSON.stringify(meds));
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
    var chartBtn = $("<button>");
    chartBtn.text("View Chart");
    chartBtn.addClass("chart btn btn-primary");
    var newMedsTitle = $("<h2>");
    var newMedsDate = $("<small>");
    var newMedsUser = $("<h5>");
    newMedsUser.text("Med for: " + meds.User.username);
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
    newMedsPanelHeading.append(chartBtn);
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

  
  function obtainMedChart(){
    $("#chartBody").empty();
    event.preventDefault();
    var newChartCanvas = $("<canvas id='myChart'>");
    newChartCanvas.width("200px");
    newChartCanvas.height("200px");
    $("#chartBody").append(newChartCanvas);
    var chosenMed = $(this)
      .parent()
      .parent()
      .data("meds");
    var medName = chosenMed.med_name.trim();
    var doseRemain = chosenMed.remaining_count
    var doseInitial = chosenMed.initial_count
    console.log("medName: " + medName);
    $("#chartModal").modal("toggle");
      var ctx = document.getElementById("myChart").getContext('2d');
      var myDoughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ["Doses Taken", "Doses Remaining"],
            datasets: [{
                label: 'meds taken',
                data: [doseInitial-doseRemain, doseRemain],
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
              fontSize: 40,
              text: 'Dose Tracker for ' + medName
            }
        }

      });
  }

  function obtainMedPics() {
    event.preventDefault();
    $(".slideshow-container").empty();
    $(".inner-container").empty();
    var chosenMed = $(this)
      .parent()
      .parent()
      .data("meds");

    console.log("chosenMed: " + chosenMed);
    var medNameFirst = chosenMed.med_name;
    console.log("medNameFirst: " + medNameFirst);
    if(medNameFirst.includes("/") === true){
      medNameFirst = chosenMed.med_name.substr(0,chosenMed.med_name.indexOf('/'));
    }
    if (medNameFirst.includes("(") === true){
      medNameFirst = chosenMed.med_name.substr(0,chosenMed.med_name.indexOf('('));
    }
    console.log("medNameFirst: " + medNameFirst);
    var medName = medNameFirst.trim();
    console.log("medName: " + medName);
    var medDose = chosenMed.med_dose.trim();
    console.log("medDose: " + medDose);
    var medDoseNum = medDose.match(/\d+/)[0].trim();
    console.log("medDoseNum: " + medDoseNum);
    var medDoseUnitFirst = (medDose.replace("Tab",'')).trim();
    console.log("medDoseUnitFirst:" + medDoseUnitFirst);
    var medDoseUnit = (medDoseUnitFirst.replace(/[0-9]/g,'')).toUpperCase().trim();
    console.log("medDoseUnit: " + medDoseUnit);
    var medDoseUnit2 = (medDoseUnit.replace(/-/g,"")).trim();
    console.log("medDoseUnit2: " + medDoseUnit2);
    var medDoseUnit3 = (medDoseUnit2.substr(0,medDoseUnit2.indexOf(' ')));
    console.log("medDoseUnit3: " + medDoseUnit3);
    var medDoseNew = " " + medDoseNum.trim() + " " + medDoseUnit3.trim();
    console.log("medDoseNew: " + medDoseNew);
    var queryURL = "https://rximage.nlm.nih.gov/api/rximage/1/rxnav?&resolution=600&rLimit=50&name="+ medName;
    //Use ajax call to obtain images asychronously
    $.ajax({
      url: queryURL,
      method: "GET"
    }).done(function(response){
        console.log("response.nlmRxImages: " + response.nlmRxImages);
        var likelyArray = [];
        if(typeof response.nlmRxImages == 'undefined' || response.nlmRxImages.length == 0){
          $("#noPicModal").modal("toggle");
          return;
        }
        for(var i = 0; i<response.nlmRxImages.length; i++){
          if( (response.nlmRxImages[i].name).indexOf(medDoseNew) !== -1){
            likelyArray.push(response.nlmRxImages[i].imageUrl);
          }
        }
        if(typeof likelyArray == 'undefined' || likelyArray.length == 0){
          for(var j = 0; j<response.nlmRxImages.length; j++){
            likelyArray.push(response.nlmRxImages[j].imageUrl);
          }
        }
        console.log("likelyArray: " + likelyArray);
        var carouselContainer = $(".slideshow-container");
        var item = $(".inner-container");
        $("#picModal").modal("toggle");

	      $.each(likelyArray, function( intIndex, objValue ){
	        console.log("intIndex: " + intIndex);
	        console.log("objValue: " + objValue);
	        item.append($( '<span class = "dot" onclick="currentSlide(' + intIndex + ')"></span>' ));
	        carouselContainer.append($('<div class="mySlides"><img src="' + objValue +'"style=width:100%></div>'));      
	      });
          $('.carousel-indicators li:first').addClass('active');
          $('.carousel-inner li:first').addClass('active');

          	var slideIndex = 1;
			showSlides(slideIndex);
			currentSlide(slideIndex);

    });
  }

	var slideIndex = 1;
	showSlides(slideIndex);

	// Next/previous controls
	function plusSlides(n) {
	  showSlides(slideIndex += n);
	};

	// Thumbnail image controls
	function currentSlide(n) {
	  showSlides(slideIndex = n);
	};

	function showSlides(n) {
	  console.log("slideIndex: " + n);
	  var i;
	  var slides = $(".mySlides");
	  console.log("slides.length: " + slides.length);
	  var dots = $(".dot");
	  if (n > slides.length) {slideIndex = 1}
	  if (n < 1) {slideIndex = slides.length}
	  for (i = 0; i < slides.length; i++) {
	      slides[i].style.display = "none"; 
	  }
	  for (i = 0; i < dots.length; i++) {
	      dots[i].className = dots[i].className.replace(" active", "");
	  }
	  if(n == 1){
	  	slides[0].style.display = "block";
	  	dots[0].className += " active";
	  };
	  if(n != 1){
	  	slides[slideIndex-1].style.display = "block"; 
	  	dots[slideIndex-1].className += " active";
	  }
	};

});
