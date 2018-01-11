$(document).ready(function() {
  // Getting jQuery references to the meds body, title, form, and user select
  var nameInput = $("#name");
  var doseInput = $("#dose");
  var frequencyInput = $("#frequency");
  var timesInput = $("#times");
  var startInput = $("#start");
  var instructionsInput = $("#instructions");
  var countInput = $("#count");
  var remainingInput = $("#count");
  var strengths;
  //establish min date for datepicker
  var minDate = new Date();
  var currentMonth = minDate.getMonth()+1;
  currentMonth = currentMonth > 9 ? currentMonth : ("0" + currentMonth);  
  startInput[0].min = minDate.getFullYear() + '-' + currentMonth + '-' + minDate.getDate();

  //set up lhc autocomplete
  new Def.Autocompleter.Prefetch('dose', []);
  new Def.Autocompleter.Search('name',
   'https://clin-table-search.lhc.nlm.nih.gov/api/rxterms/v3/search?maxList=25&ef=STRENGTHS_AND_FORMS');
  Def.Autocompleter.Event.observeListSelections('name', function() {
    var drugField = $('#name')[0];
    var drugFieldVal = drugField.value;
    var autocomp = drugField.autocomp;
    strengths = autocomp.getItemExtraData(drugFieldVal)['STRENGTHS_AND_FORMS'];
    if (strengths)
      $('#dose')[0].autocomp.setListAndField(strengths, '');
  })



  var medManagerForm = $("#med-manager");
  var userSelect = $("#user");




  // Adding an event listener for when the form is submitted
  $(medManagerForm).on("submit", handleFormSubmit);
  // Gets the part of the url that comes after the "?" (which we have if we're updating a meds)
  var url = window.location.search;
  var medsId;
  var userId;

  // Sets a flag for whether or not we're updating a meds to be false initially
  var updating = false;

  // If we have this section in our url, we pull out the meds id from the url
  // In '?meds_id=1', medsId is 1
  if (url.indexOf("?meds_id=") !== -1) {
    medsId = url.split("=")[1];
    getMedsData(medsId, "meds");
  }
  // Otherwise if we have an user_id in our url, preset the user select box to be our user
  else if (url.indexOf("?user_id=") !== -1) {
    userId = url.split("=")[1];
  }

  $(document).on("click", "#dashBtn", goToDashboard);
  $(document).on("click", "#medListBtn", goToMedList);
  $(document).on("click", "#todayBtn", goToToday);


  function goToDashboard(){
    window.location.href='/dashboard?user_id=' + userId; 
  }

  function goToMedList(){
    window.location.href='/med-list?user_id=' + userId; 
  }

  function goToToday(){
    window.location.href='/today?user_id=' + userId; 
  }

  // Getting the users, and their meds
  getUsers();

  // A function for handling what happens when the form to create a new meds is submitted
  function handleFormSubmit(event) {
    event.preventDefault();
    console.log(strengths);
    console.log(validateDose(doseInput));
    // Wont submit the meds if we are missing a body, title, or user
    if (!nameInput.val().trim() || 
        !doseInput.val().trim() || 
        !frequencyInput.val().trim() || 
        !timesInput.val().trim() ||
        !startInput.val().trim() || 
      //  !instructionsInput.val().trim() || 
        !countInput.val().trim() ||
        !userSelect.val()) {
      return;
    }
    var isValidMed = validateMed(nameInput);
   
    function validateMed(medInput){
      return medInput[0].autocomp.getItemCode(medInput[0].autocomp.getSelectedItems()[0]) != null;
    };

    function validateDose(doseInput){
      return strengths.indexOf(doseInput.val()) > -1; 
    };  


    
    // Constructing a newmeds object to hand to the database
    var startNew = new Date(startInput.val().trim());
    var startDate = startNew.getFullYear() + '-' + (startNew.getMonth()+1) + '-' + startNew.getDate();
    

    var startDateTime = startDate + " 03:00:00";
    console.log(startDateTime);
    
    var hourInterval;
    
    if(frequencyInput.val().trim().toUpperCase() == 'DAILY'){
      hourInterval = (24/timesInput.val().trim());
    }
    if(frequencyInput.val().trim().toUpperCase()  == 'WEEKLY'){
      hourInterval = (168/timesInput.val().trim());
    }
    if(frequencyInput.val().trim().toUpperCase()  == 'MONTHLY'){
      hourInterval = (720/timesInput.val().trim());
    }

    var newHrInterval = hrTohhmmss(hourInterval);
    console.log(newHrInterval);

    var mStart = moment(startDateTime,"YYYY-MM-DD HH:mm:ss");
    console.log(mStart._d);
    
    var nextDateTime = moment(mStart._d).add(hourInterval, 'hours');
    console.log(nextDateTime._d);
    

    var eventArray = [];
    console.log("countInput: " + countInput.val().trim());

    for (var i = 0; i < countInput.val().trim(); i++){
      var med_count_number = (i+1);
      var event_time = (moment(mStart._d).add((hourInterval*i), 'hours'))._d;
      var MedId = "tempID";
      var eventItem = {med_count_number, event_time, MedId};
      eventArray.push(eventItem);
    }
    console.log(eventArray);


    var newMed = {
      innerMed: {
      med_name: nameInput
        .val()
        .trim(),
      med_dose: doseInput
        .val()
        .trim(),
      freq_main: frequencyInput
        .val()
        .trim(),
      freq_times: timesInput
        .val()
        .trim(),
      hr_interval: newHrInterval,
      start_date: startInput
        .val()
        .trim(),
      first_med: mStart._d,
      next_med: nextDateTime._d,
      instructions: instructionsInput
        .val()
        .trim(),
      initial_count: countInput
        .val()
        .trim(),
      remaining_count: countInput
        .val()
        .trim(),
      UserId: userSelect.val()
    },
      events: eventArray
    };

    

    console.log(newMed);

    // If we're updating a meds run updatemeds to update a meds
    // Otherwise run submitmeds to create a whole new meds
    if (updating) {
      newMed.id = medsId;
      updateMeds(newMed);
    }
    else {
      console.log("test");
      submitMeds(newMed);
    }
  }


  function hrTohhmmss(hrs){
     var sign = hrs < 0 ? "-" : "";
     var hr = Math.floor(Math.abs(hrs));
     var min = Math.floor((Math.abs(hrs) * 60) % 60);
     var sec = "00";
     return sign + (hr < 10? "0": "") + hr + ":" + (min < 10 ? "0" : "") + min + ":" + sec;
  }

  // Submits a new meds and brings client to med page upon completion
  function submitMeds(meds) {
    $.post("/api/meds", meds, function() {
      window.location.href = "/med-list?user_id=" + userId;
    });
  }

  // Gets meds data for the current meds if we're editing, or if we're adding to an users existing meds
  function getMedsData(id, type) {
    var queryUrl;
    switch (type) {
      case "meds":
        queryUrl = "/api/meds/" + id;
        break;
      case "user":
        queryUrl = "/api/users/" + id;
        break;
      default:
        return;
    }
    $.get(queryUrl, function(data) {
      if (data) {
        console.log(data.UserId || data.id);
        // If this meds exists, prefill our med-manager forms with its data
        nameInput.val(data.med_name);  
        doseInput.val(data.med_dose);  
        frequencyInput.val(data.freq_main); 
        timesInput.val(data.freq_times);
        startInput.val(data.start_date); 
        instructionsInput.val(data.instructions); 
        countInput.val(data.initial_count);
        userId = data.UserId || data.id;
        // If we have a meds with this id, set a flag for us to know to update the meds
        // when we hit submit
        updating = true;
      }
    });
  }

  // A function to get users and then render our list of users
  function getUsers() {
    $.get("/api/users", renderUserList);
  }
  // Function to either render a list of users, or if there are none, direct the client to the page
  // to create a user first
  function renderUserList(data) {
    if (!data.length) {
      window.location.href = "/users";
    }
    $(".hidden").removeClass("hidden");
    var rowsToAdd = [];
    for (var i = 0; i < data.length; i++) {
      rowsToAdd.push(createUserRow(data[i]));
    }
    userSelect.empty();
    console.log(rowsToAdd);
    console.log(userSelect);
    userSelect.append(rowsToAdd);
    userSelect.val(userId);
  }

  // Creates the user options in the dropdown
  function createUserRow(user) {
    var listOption = $("<option>");
    listOption.attr("value", user.id);
    listOption.text(user.username);
    return listOption;
  }

  // Update a given meds, bring user to the blog page when done
  function updateMeds(meds) {
    console.log("update meds: " + JSON.stringify(meds));
    $.ajax({
      method: "PUT",
      url: "/api/meds",
      data: meds
    })
    .done(function() {
      console.log("DONE")
      ///window.location.href = "/med-list?user_id=" + userId;
    });
  }

});