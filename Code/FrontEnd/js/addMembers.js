document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('backBtn');
  const sectionSelect = document.getElementById('section');
  const messageEl = document.getElementById('message');
  const addBtn = document.getElementById('addToDatabaseBtn');

  // Back button
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '/admin/home/members';
    });
  }

  // Load sections into dropdown
  const loadSections = async () => {
    try {
      const res = await fetch('/api/sections');
      const data = await res.json();
      if (data.success) {
        sectionSelect.innerHTML = `<option value="">-- Select Section --</option>` +
          data.sections
            .map(s => `<option value="${s.section_id}">${s.section_name}</option>`)
            .join('');
      } else {
        messageEl.innerText = 'Failed to load sections.';
        messageEl.style.color = 'red';
      }
    } catch (err) {
      console.error('Error fetching sections:', err);
      messageEl.innerText = 'Error fetching sections.';
      messageEl.style.color = 'red';
    }
  };

  loadSections();

  // Add member
  addBtn.addEventListener('click', async () => {
    const studentNumber = document.getElementById('studentNumber').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const firstName = document.getElementById('firstName').value.trim();
    const middleName = document.getElementById('middleName').value.trim();
    const sex = document.getElementById('sex').value;
    const sectionID = sectionSelect.value; // ID, not name
    const email = document.getElementById('email').value.trim();

    // Validation regex
    const studentNumberRegex = /^[0-9]{12}$/;
    const nameRegex = /^[a-zA-Z\s\-]{1,50}$/;
    const sexRegex = /^(Male|Female)$/i;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!studentNumberRegex.test(studentNumber)) return alert('Invalid student number.');
    if (!nameRegex.test(lastName) || !nameRegex.test(firstName) || (middleName && !nameRegex.test(middleName))) {
      return alert('Invalid name format.');
    }
    if (!sexRegex.test(sex)) return alert('Please select a valid sex.');
    if (!sectionID) return alert('Please select a section.');
    if (!emailRegex.test(email)) return alert('Invalid email format.');

    /* Send POST request to add member */
    try {
      const response = await fetch('/admin/home/members/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentNumber, lastName, firstName, middleName, sex, sectionID, email })
      });

      const data = await response.json();
      if (data.success) {
        alert('Member added successfully!');
        window.location.href = '/admin/home/members';
      } else {
        messageEl.innerText = data.message;
        messageEl.style.color = 'red';
      }
    } catch (err) {
      console.error('Error connecting to server:', err);
      messageEl.innerText = 'Error connecting to server.';
      messageEl.style.color = 'red';
    }
  });
});
