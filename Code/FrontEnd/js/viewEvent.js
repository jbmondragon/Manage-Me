document.addEventListener('DOMContentLoaded', async () => {
  const backBtn = document.getElementById('backBtn');
  const eventsList = document.querySelector('.events-list');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const filterSelect = document.getElementById('filterSelect');

  // Modal elements
  const modal = document.getElementById('studentsModal');
  const closeModal = document.getElementById('closeModal');
  const modalTitle = document.getElementById('modalTitle');
  const studentsTableBody = document.querySelector('#studentsTable tbody');
  const savePaymentBtn = document.getElementById('savePaymentBtn');

  let allEvents = [];
  let currentEventId = null;
  let currentStudents = [];

  // Go back
  backBtn?.addEventListener('click', () => {
    window.location.href = '/admin/home/accountability';
  });

  // --- Fetch all events ---
  async function fetchEvents() {
    try {
      const response = await fetch('/admin/home/events/list');
      const data = await response.json();

      if (data.success && Array.isArray(data.events)) {
        allEvents = data.events;
        populateYearDropdown(allEvents);
        renderEvents(allEvents);
      } else {
        eventsList.innerHTML = `<p>${data.message || 'No events found.'}</p>`;
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      eventsList.innerHTML = `<div class="error">Failed to load events.</div>`;
    }
  }

  // --- Populate dropdown with years ---
  function populateYearDropdown(events) {
    const years = [...new Set(events.map(e => new Date(e.start_date).getFullYear()))].sort((a, b) => b - a);
    filterSelect.innerHTML = `<option value="">All Years</option>`;
    years.forEach(year => {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      filterSelect.appendChild(option);
    });
  }

  // --- Render event cards ---
  function renderEvents(events) {
    eventsList.innerHTML = '';

    if (events.length === 0) {
      eventsList.innerHTML = '<p>No events found.</p>';
      return;
    }

    events.forEach(event => {
      const eventDiv = document.createElement('div');
      eventDiv.classList.add('event');
      eventDiv.innerHTML = `
        <span class="event-info" data-id="${event.eid}">
          <strong>${event.event_name}</strong><br>
          ${new Date(event.start_date).toLocaleDateString()} – ${new Date(event.end_date).toLocaleDateString()}<br>
          Amount: ₱${Number(event.amount).toFixed(2)}
        </span>
        <div class="actions">
          <button class="edit">Edit</button>
          <button class="delete">Delete</button>
        </div>
      `;
      eventsList.appendChild(eventDiv);

      // Event click → open modal
      eventDiv.querySelector('.event-info').addEventListener('click', () =>
        openStudentsModal(event.eid, event.event_name)
      );

      // Delete button
      eventDiv.querySelector('.delete').addEventListener('click', async () => {
        if (!confirm(`Are you sure you want to delete "${event.event_name}"?`)) return;
        try {
          const delRes = await fetch(`/admin/home/events/delete/${event.eid}`, { method: 'DELETE' });
          const delData = await delRes.json();
          if (delData.success) {
            alert('Event deleted successfully');
            eventDiv.remove();
          } else {
            alert(delData.message || 'Failed to delete event');
          }
        } catch (err) {
          console.error('Error deleting event:', err);
          alert('Failed to delete event');
        }
      });

      // Edit button
      eventDiv.querySelector('.edit').addEventListener('click', () => {
        window.location.href = `/admin/home/event/editMembers?eid=${event.eid}`;
      });
    });
  }

  // --- Open students modal for payments ---
  async function openStudentsModal(eid, eventName) {
    currentEventId = eid;
    modalTitle.textContent = `Payments - ${eventName}`;
    modal.classList.remove('hidden');
    studentsTableBody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

    try {
      const res = await fetch(`/admin/home/accountability/${eid}/students`);
      const data = await res.json();

      if (data.success) {
        currentStudents = data.students;
        renderStudents(data.students);
      } else {
        studentsTableBody.innerHTML = '<tr><td colspan="4">No students found.</td></tr>';
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      studentsTableBody.innerHTML = '<tr><td colspan="4">Error loading students.</td></tr>';
    }
  }

  // --- Render student rows ---
  function renderStudents(students) {
    studentsTableBody.innerHTML = '';
    students.forEach(stu => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${stu.sid}</td>
        <td>${stu.last_name}, ${stu.first_name}</td>
        <td>${stu.section}</td>
        <td><input type="checkbox" data-sid="${stu.sid}" ${stu.paid ? 'checked' : ''}></td>
      `;
      studentsTableBody.appendChild(row);
    });
  }

  // --- Save payments ---
  savePaymentBtn.addEventListener('click', async () => {
    const updates = Array.from(studentsTableBody.querySelectorAll('input[type="checkbox"]')).map(cb => ({
      sid: cb.dataset.sid,
      paid: cb.checked
    }));

    try {
      const res = await fetch(`/admin/home/accountability/${currentEventId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });

      const data = await res.json();
      if (data.success) {
        alert('Payment statuses updated successfully!');
        modal.classList.add('hidden');
      } else {
        alert(data.message || 'Failed to update payments.');
      }
    } catch (err) {
      console.error('Error saving payments:', err);
      alert('Error saving payments.');
    }
  });

  // Close modal
  closeModal.addEventListener('click', () => modal.classList.add('hidden'));
  window.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });

  // Search and filter
  searchBtn.addEventListener('click', filterEvents);
  filterSelect.addEventListener('change', filterEvents);

  function filterEvents() {
    const search = searchInput.value.toLowerCase();
    const year = filterSelect.value;
    const filtered = allEvents.filter(e => {
      const matchesSearch = e.event_name.toLowerCase().includes(search);
      const matchesYear = !year || new Date(e.start_date).getFullYear().toString() === year;
      return matchesSearch && matchesYear;
    });
    renderEvents(filtered);
  }

  await fetchEvents();
});
