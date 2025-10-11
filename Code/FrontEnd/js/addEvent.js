document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '/admin/home/accountability';
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('backBtn');
  const addToDatabaseBtn = document.getElementById('addToDatabaseBtn');
  const messageEl = document.getElementById('message');

  // Handle back button navigation
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '/admin/home/accountability'; // Adjust as needed
    });
  }

  // Handle form submission
  if (!addToDatabaseBtn) return;

  addToDatabaseBtn.addEventListener('click', async () => {
    const nameOfEvent = document.getElementById('nameOfEvent').value.trim();
    const startDate = document.getElementById('startDate').value.trim();
    const endDate = document.getElementById('endDate').value.trim();
    const amount = document.getElementById('amount').value.trim();

    // Validation regex patterns
    const nameRegex = /^[a-zA-Z0-9\s\-'"(),.&]{3,100}$/; // allows letters, digits, punctuation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // expects YYYY-MM-DD
    const amountRegex = /^\d+(\.\d{1,2})?$/; // numeric, allows decimals

    // Basic validation
    if (!nameRegex.test(nameOfEvent)) {
      return alert('Invalid event name. Use only letters, numbers, and punctuation.');
    }
    if (!dateRegex.test(startDate)) {
      return alert('Invalid start date. Format: YYYY-MM-DD');
    }
    if (!dateRegex.test(endDate)) {
      return alert('Invalid end date. Format: YYYY-MM-DD');
    }
    if (new Date(startDate) > new Date(endDate)) {
      return alert('Start date cannot be after end date.');
    }
    if (!amountRegex.test(amount)) {
      return alert('Invalid amount. Enter a valid number.');
    }

    try {
      const response = await fetch('/admin/home/events/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nameOfEvent, startDate, endDate, amount })
      });

      const data = await response.json();
      if (data.success) {
        alert('Event added successfully!');
        window.location.href = '/admin/home/accountability'; // redirect to event list page
      } else {
        messageEl.innerText = data.message || 'Failed to add event.';
      }
    } catch (err) {
      console.error('Error connecting to server:', err);
      messageEl.innerText = 'Error connecting to server.';
    }
  });
});



