document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('backBtn');
  if (!backBtn) return;

  backBtn.addEventListener('click', () => {
    window.location.href = '/admin/home';
  });
});

// addHomecoming.js
document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('backBtn');
  const addToDatabaseBtn = document.getElementById('addToDatabaseBtn');
  const messageEl = document.getElementById('message');

  // ==============================
  // Handle Back Button Navigation
  // ==============================
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '/admin/home'; // adjust route as needed
    });
  }

  // ==============================
  // Handle Add Event Button Click
  // ==============================
  if (!addToDatabaseBtn) return;

  addToDatabaseBtn.addEventListener('click', async () => {
    const eventName = document.getElementById('eventName').value.trim();
    const theme = document.getElementById('theme').value.trim();
    const dateTime = document.getElementById('dateTime').value.trim();
    const venue = document.getElementById('venue').value.trim();

    // Validation regex patterns
    const nameRegex = /^[a-zA-Z0-9\s\-'"(),.&]{3,100}$/; // letters, digits, punctuation
    const venueRegex = /^[a-zA-Z0-9\s\-'"(),.&]{3,150}$/; 
    const dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/; // datetime-local format (YYYY-MM-DDTHH:MM)

    // ==============================
    // Basic Input Validation
    // ==============================
    if (!nameRegex.test(eventName)) {
      return alert('Invalid event name. Use only letters, numbers, and punctuation.');
    }

    if (theme && !nameRegex.test(theme)) {
      return alert('Invalid theme. Use only letters, numbers, and punctuation.');
    }

    if (!dateTimeRegex.test(dateTime)) {
      return alert('Invalid date/time format. Please use the datetime picker.');
    }

    if (!venueRegex.test(venue)) {
      return alert('Invalid venue. Use only letters, numbers, and punctuation.');
    }

    // ==============================
    // Send Data to Server
    // ==============================
    try {
      const response = await fetch('/admin/home/homecoming/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName,
          theme,
          dateTime,
          venue
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Event added successfully!');
        window.location.href = '/admin/home'; // redirect to event list page
      } else {
        messageEl.innerText = data.message || 'Failed to add event.';
        messageEl.style.color = 'red';
      }
    } catch (err) {
      console.error('Error connecting to server:', err);
      messageEl.innerText = 'Error connecting to server.';
      messageEl.style.color = 'red';
    }
  });
});
