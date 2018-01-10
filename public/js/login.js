$(document).ready(function() {
  // Getting references to the name input and User container, as well as the table body
  var loginInput = $("#login-name");
  var passwordInput = $("#password");

  var userContainer = $(".user-container");
  // Adding event listeners to the form to create a new object, and the button to delete
  // a User
  $(document).on("submit", "#user-form", handleUserFormSubmit);
  //$(document).on("click", ".delete-user", handleDeleteButtonPress);



  // A function to handle what happens when the form is submitted to create a new User
  function handleUserFormSubmit(event) {
    event.preventDefault();
    
    // Don't do anything if the name fields hasn't been filled out
    if (!loginInput|| !passwordInput) {
      return;
    }

    var newLoginInput = loginInput.val().trim();
    var newPasswordInput = passwordInput.val().trim();
    // Calling the upsertUser function and passing in the value of the name input
    var userData = {
      username: newLoginInput,
      password: newPasswordInput,
      };
      console.log("Form Submitted");
      loginInput = ("");
      passwordInput = ("");
    verifyUser(userData);
  }

  // A function for verifying a user.

  
  function verifyUser(userData) {
    console.log(userData);
    $.post('/login', userData, function(response){
          console.log(response)
          if(response == "invalid username"){
              alert("That is an invalid username");
              window.location.href = "/login";
          }
          if(response == "invalid password"){
              alert("That is an invalid password");
              window.location.href = "/login";
          }
          if(response.status == "success"){
              alert("Welcome!");
              console.log("USER DATA" + JSON.stringify(userData));
              console.log("RESPONSE: " + response.status);
              console.log("RESPONSE: " + response.userid);
              window.location.href='/dashboard?user_id=' + response.userid; 
          }
    })
  }
  
  /*
  function verifyUser(userData) {
    console.log(userData);
    $.ajax({
      method: "POST",
      url: '/login',
      data: userData,
      success: function(response){
        console.log(response);
        alert('That is not a valid username');
      }
    });    
  }
  
  
  // Function for creating a new list row for users
  function createUserDisplay(userData) {
    var newList = $("<ul>");
    newList.data("user", userData);
    newList.append("<li>" + userData.user_name + "</li>");
    newList.append("<li> " + userData.login_name + "</li>");
    newList.append("<li><a href='/med-list?user_id=" + userData.id + "'>View All Meds</a></li>");
    newList.append("<li><a href='/today?user_id=" + userData.id + "'>View Today's Meds</a></li>");
    newList.append("<li><a href='/med-manager?user_id=" + userData.id + "'>Add a Med</a></li>");
    newList.append("<li><a style='cursor:pointer;color:red' class='delete-user'>Delete Account</a></li>");
    return newList;
  }

  // Function for retrieving users and getting them ready to be rendered to the page
  function getUsers() {
    $.get("/api/users", function(data) {
      var rowsToAdd = [];
      for (var i = 0; i < data.length; i++) {
        rowsToAdd.push(createUserDisplay(data[i]));
      }
      renderUserList(rowsToAdd);
      nameInput.val("");
      passwordInput.val("");
    });
  }

  // A function for rendering the list of users to the page
  function renderUserList(rows) {
    userList.children().not(":last").remove();
    userContainer.children(".alert").remove();
    if (rows.length) {
      console.log(rows);
      userList.prepend(rows);
    }
    else {
      renderEmpty();
    }
  }

  // Function for handling what to render when there are no users
  /*
  function renderEmpty() {
    var alertDiv = $("<div>");
    alertDiv.addClass("alert alert-danger");
    alertDiv.text("You must create an User before you can add Meds.");
    userContainer.append(alertDiv);
  }
  

  // Function for handling what happens when the delete button is pressed
  function handleDeleteButtonPress() {
    var listItemData = $(this).parent("td").parent("tr").data("user");
    console.log("listItemData: " + listItemData);
    var id = listItemData.id;
    console.log("listItemData.id: " + id);
    $.ajax({
      method: "DELETE",
      url: "/api/users/" + id
    })
    .done(getUsers);
  }
  */
});
