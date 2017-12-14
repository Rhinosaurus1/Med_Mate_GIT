$(document).ready(function() {
  /* global moment */

  // medsContainer holds all of our meds
  var medsContainer = $(".meds-container");

  // Click events for the edit and delete buttons
  $(document).on("click", "button.delete", handleMedsDelete);
  $(document).on("click", "button.edit", handleMedsEdit);
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

});
