document.addEventListener('DOMContentLoaded', async () => {
  const backBtn = document.getElementById('backBtn');
  const eventsList = document.querySelector('.events-list');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const filterSelect = document.getElementById('filterSelect');

  const modal = document.getElementById('studentsModal');
  const closeModal = document.getElementById('closeModal');
  const modalTitle = document.getElementById('modalTitle');
  const studentsTableBody = document.querySelector('#studentsTable tbody');
  const saveBtn = document.getElementById('saveAttendanceBtn');

  let allEvents = [];
  let currentHomecomingId = null;
  let currentStudents = [];

  // --- Navigation ---
  backBtn?.addEventListener('click', () => (window.location.href = '/admin/home'));

  // --- Fetch all homecoming events ---
  async function fetchEvents() {
    try {
      const res = await fetch('/admin/home/homecoming/list');
      const data = await res.json();

      if (data.success && Array.isArray(data.events)) {
        allEvents = data.events;
        populateYearDropdown(allEvents);
        renderEvents(allEvents);
      } else {
        eventsList.innerHTML = `<p>No homecoming events found.</p>`;
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      eventsList.innerHTML = `<div class="error">Failed to load events.</div>`;
    }
  }

  // --- Populate dropdown ---
  function populateYearDropdown(events) {
    const years = [...new Set(events.map(e => new Date(e.date_time).getFullYear()))].sort((a, b) => b - a);
    filterSelect.innerHTML = `<option value="">All Years</option>`;
    years.forEach(y => {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      filterSelect.appendChild(opt);
    });
  }

  // --- Render homecoming events ---
  function renderEvents(events) {
    eventsList.innerHTML = '';

    if (events.length === 0) {
      eventsList.innerHTML = '<p>No homecoming events found.</p>';
      return;
    }

    events.forEach(event => {
      const div = document.createElement('div');
      div.classList.add('events');
      div.dataset.id = event.hid; // store hid on div
      div.innerHTML = `
        <span class="event-info">
          <strong>${event.event_name}</strong><br>
          Theme: ${event.theme}<br>
          Date: ${new Date(event.date_time).toLocaleString()}<br>
          Venue: ${event.venue}
        </span>
        <div class="actions">
          <button class="edit" data-id="${event.hid}">Edit</button>
          <button class="delete" data-id="${event.hid}">Delete</button>
        </div>
      `;
      eventsList.appendChild(div);
    });
  }

  // --- Handle clicks on events list ---
  eventsList.addEventListener('click', async e => {
    const div = e.target.closest('.events');
    if (!div) return;
    const hid = div.dataset.id;

    // Open modal if clicked on the event div (but not edit/delete buttons)
    if (!e.target.classList.contains('edit') && !e.target.classList.contains('delete')) {
      openStudentsModal(hid);
      return;
    }

    // Edit event
    if (e.target.classList.contains('edit')) {
      window.location.href = `/admin/home/homecoming/edit?hid=${hid}`;
      return;
    }

    // Delete event
    if (e.target.classList.contains('delete')) {
      if (!confirm('Are you sure you want to delete this homecoming event?')) return;

      try {
        const res = await fetch(`/admin/home/homecoming/delete/${hid}`, { method: 'DELETE' });
        const data = await res.json();

        if (data.success) {
          alert('Homecoming event deleted successfully.');
          await fetchEvents(); // Refresh the list
        } else {
          alert(data.message || 'Failed to delete event.');
        }
      } catch (err) {
        console.error('Error deleting event:', err);
        alert('Error deleting event.');
      }
    }
  });

  // --- Open modal & load students ---
  async function openStudentsModal(hid) {
    const event = allEvents.find(e => e.hid == hid);
    if (!event) return;

    currentHomecomingId = hid;
    modalTitle.textContent = `Participants - ${event.event_name}`;
    modal.classList.remove('hidden');
    studentsTableBody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

    try {
      const res = await fetch(`/admin/home/homecoming/${hid}/students`);
      const data = await res.json();

      if (data.success) {
        currentStudents = data.students;
        renderStudents(data.students);
      } else {
        studentsTableBody.innerHTML = '<tr><td colspan="4">No students found.</td></tr>';
      }
    } catch (err) {
      console.error('Error loading students:', err);
      studentsTableBody.innerHTML = '<tr><td colspan="4">Error loading students.</td></tr>';
    }
  }

  // --- Render student list ---
  function renderStudents(students) {
    studentsTableBody.innerHTML = '';
    students.forEach(stu => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${stu.sid}</td>
        <td>${stu.last_name}, ${stu.first_name}</td>
        <td>${stu.section}</td>
        <td><input type="checkbox" data-sid="${stu.sid}" ${stu.attended ? 'checked' : ''}></td>
      `;
      studentsTableBody.appendChild(row);
    });
  }

  // --- Save attendance ---
  saveBtn.addEventListener('click', async () => {
    const updates = Array.from(studentsTableBody.querySelectorAll('input[type="checkbox"]')).map(cb => ({
      sid: cb.dataset.sid,
      attended: cb.checked
    }));

    try {
      const res = await fetch(`/admin/home/homecoming/${currentHomecomingId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });

      const data = await res.json();
      if (data.success) {
        alert('Attendance updated successfully!');
        modal.classList.add('hidden');
        await fetchEvents(); // refresh homecoming list in case attendance affects display
      } else {
        alert(data.message || 'Failed to update attendance.');
      }
    } catch (err) {
      console.error('Error saving attendance:', err);
      alert('Error saving attendance.');
    }
  });

  // --- Modal behavior ---
  closeModal.addEventListener('click', () => modal.classList.add('hidden'));
  window.addEventListener('click', e => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  // --- Filtering & search ---
  searchBtn.addEventListener('click', filterEvents);
  filterSelect.addEventListener('change', filterEvents);

  function filterEvents() {
    const search = searchInput.value.toLowerCase();
    const year = filterSelect.value;

    const filtered = allEvents.filter(e => {
      const matchesSearch =
        e.event_name.toLowerCase().includes(search) ||
        e.theme.toLowerCase().includes(search);
      const matchesYear =
        !year || new Date(e.date_time).getFullYear().toString() === year;
      return matchesSearch && matchesYear;
    });

    renderEvents(filtered);
  }

  // --- Initial load ---
  await fetchEvents();
});
