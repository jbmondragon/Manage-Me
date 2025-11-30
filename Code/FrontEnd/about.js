// about.js

document.addEventListener('DOMContentLoaded', () => {
  // Select all top-bar buttons
  const buttons = document.querySelectorAll('.top-bar button');

  // Function to remove 'active' class from all buttons
  function clearActive() {
    buttons.forEach(btn => btn.classList.remove('active'));
  }

  // Set the About button as active by default
  clearActive();
  document.getElementById('about').classList.add('active');

  // Add click event to each button
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      clearActive();
      button.classList.add('active');

      if (button.id === 'dashboard') {
        // Redirect to dashboard/home page
        window.location.href = '/'; // Change this URL to your actual dashboard page
      } else if (button.id === 'log-in') {
        // Redirect to login page
        window.location.href = '/admin/loginPage';
      }
      // No need to handle "about" since we are already on this page
    });
  });
});
