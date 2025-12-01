document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '/admin/home/section';
    });
  }

  const addBtn = document.getElementById('addToDatabaseBtn');
  const messageEl = document.getElementById('message');

  /* Add Section Button */
  addBtn.addEventListener('click', async () => {
    const sectionName = document.getElementById('sectionName').value.trim();
    const gradeLevel = document.getElementById('gradeLevel').value.trim();
    const academicYear = document.getElementById('academicYear').value.trim();
    const adviser = document.getElementById('adviser').value.trim();

    if (!sectionName) {
      messageEl.textContent = 'Section name is required.';
      messageEl.style.color = 'red';
      return;
    }

    /* Send POST request to add section */
    try {
      const response = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionName, gradeLevel, academicYear, adviser })
      });

      const result = await response.json();

      if (response.ok) {
        messageEl.textContent = 'Section added successfully!';
        messageEl.style.color = 'green';
        document.getElementById('sectionName').value = '';
        document.getElementById('gradeLevel').value = '';
        document.getElementById('academicYear').value = '';
        document.getElementById('adviser').value = '';
      } else {
        messageEl.textContent = `Error: ${result.message}`;
        messageEl.style.color = 'red';
      }
    } catch (err) {
      console.error(err);
      messageEl.textContent = 'An unexpected error occurred.';
      messageEl.style.color = 'red';
    }
  });
});
