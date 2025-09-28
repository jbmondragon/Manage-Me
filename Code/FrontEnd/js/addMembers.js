document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '/admin/home/members';
    });
  }

  const addToDatabaseBtn = document.getElementById('addToDatabaseBtn');
  if (!addToDatabaseBtn) return;

  addToDatabaseBtn.addEventListener('click', async () => {
    const studentNumber = document.getElementById('studentNumber').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const firstName = document.getElementById('firstName').value.trim();
    const middleName = document.getElementById('middleName').value.trim();
    const sex = document.getElementById('sex').value.trim();
    const section = document.getElementById('section').value.trim();
    const email = document.getElementById('email').value.trim();

    // Regex validation
    const studentNumberRegex = /^[0-9]{12}$/; // exactly 11 digits
    const nameRegex = /^[a-zA-Z\s\-]{1,50}$/;    // letters, spaces, hyphen, max 50 chars
    const sexRegex = /^(Male|Female|Other)$/i;    // optional, allow only Male, Female, Other
    const sectionRegex = /^[A-Za-z0-9]{1,10}$/; // allow lowercase and uppercase
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!studentNumberRegex.test(studentNumber)) return alert('Invalid student number.');
    if (!nameRegex.test(lastName) || !nameRegex.test(firstName) || (middleName && !nameRegex.test(middleName))) {
      return alert('Invalid name format.');
    }
    if (!sexRegex.test(sex)) return alert('Invalid sex selection.');
    if (!sectionRegex.test(section)) return alert('Invalid section format.');
    if (!emailRegex.test(email)) return alert('Invalid email format.');

    try {
      const response = await fetch('/admin/home/members/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentNumber, lastName, firstName, middleName, sex, section, email })
      });

      const data = await response.json();
      if (data.success) {
        alert('Member added successfully!');
        window.location.href = '/admin/home/members';
      } else {
        document.getElementById('message').innerText = data.message;
      }
    } catch (err) {
      console.error('Error connecting to server:', err);
      document.getElementById('message').innerText = 'Error connecting to server';
    }
  });
});
