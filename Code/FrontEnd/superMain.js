// superMain.js

// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Select the log-in button by its ID
  const loginButton = document.getElementById('log-in');

  // Redirect to the user login page when clicked
  loginButton.addEventListener('click', () => {
    window.location.href = '/admin/loginPage';
  });
});
