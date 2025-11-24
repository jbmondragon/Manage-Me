document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const sid = urlParams.get('sid');

  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '/admin/home/members';
    });
  }

  if (!sid) {
    document.getElementById('message').innerText = 'No student ID provided.';
    return;
  }

  // --- Load existing member info ---
  try {
    const res = await fetch(`/admin/home/members/get/${sid}`);
    const data = await res.json();

    if (data.success && data.member) {
      const member = data.member;
      document.getElementById('studentNumber').value = member.sid;
      document.getElementById('lastName').value = member.last_name;
      document.getElementById('firstName').value = member.first_name;
      document.getElementById('middleName').value = member.middle_name || '';
      document.getElementById('sex').value = member.sex;
      document.getElementById('section').value = member.section;
      document.getElementById('email').value = member.email;
    } else {
      document.getElementById('message').innerText = 'Member not found.';
      return;
    }
  } catch (err) {
    console.error('Error loading member info:', err);
    document.getElementById('message').innerText = 'Error loading member info.';
    return;
  }

  // --- Update member when button is clicked ---
  const addToDatabaseBtn = document.getElementById('addToDatabaseBtn');
  if (!addToDatabaseBtn) return;

addToDatabaseBtn.addEventListener('click', async () => {
  const lastName = document.getElementById('lastName').value.trim();
  const firstName = document.getElementById('firstName').value.trim();
  const middleName = document.getElementById('middleName').value.trim();
  const sex = document.getElementById('sex').value.trim();
  const section = document.getElementById('section').value.trim();
  const email = document.getElementById('email').value.trim();

  // Validation (same as before)...

  try {
    const response = await fetch(`/admin/home/members/alter/${sid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lastName, firstName, middleName, sex, section, email })
    });

    const data = await response.json();
    if (data.success) {
      alert('Member updated successfully!');
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
