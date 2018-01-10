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
          console.log(response);
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
    });
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
  */
  
});
