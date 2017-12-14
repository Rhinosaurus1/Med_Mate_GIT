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

  // Getting the users, and their medss
  getUsers();

  // A function for handling what happens when the form to create a new meds is submitted
  function handleFormSubmit(event) {
    event.preventDefault();
    // Wont submit the meds if we are missing a body, title, or user
    if (!nameInput.val().trim() || 
        !doseInput.val().trim() || 
        !frequencyInput.val().trim() || 
        !timesInput.val().trim() ||
        !startInput.val().trim() || 
        !instructionsInput.val().trim() || 
        !countInput.val().trim() ||
        !userSelect.val()) {
      return;
    }
    // Constructing a newmeds object to hand to the database
    var newMed = {
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
      start_date: startInput
        .val()
        .trim(),
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
    };

    // If we're updating a meds run updatemeds to update a meds
    // Otherwise run submitmeds to create a whole new meds
    if (updating) {
      newMed.id = medsId;
      updateMeds(newMed);
    }
    else {
      submitMeds(newMed);
    }
  }

  // Submits a new meds and brings client to blog page upon completion
  function submitMeds(meds) {
    $.post("/api/meds", meds, function() {
      window.location.href = "/med-list";
    });
  }

  // Gets meds data for the current meds if we're editing, or if we're adding to an users existing medss
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
        countInput.val(data.remaining_count);
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
    listOption.text(user.user_name);
    return listOption;
  }

  // Update a given meds, bring user to the blog page when done
  function updateMeds(meds) {
    $.ajax({
      method: "PUT",
      url: "/api/meds",
      data: meds
    })
    .done(function() {
      window.location.href = "/med-list";
    });
  }
});