document.addEventListener('DOMContentLoaded', async () => { 
  const backBtn = document.getElementById('backBtn');
  const eventsList = document.querySelector('.events-list');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const filterSelect = document.getElementById('filterSelect');

  // Payments modal elements
  const modal = document.getElementById('studentsModal');
  const closeModal = document.getElementById('closeModal');
  const modalTitle = document.getElementById('modalTitle');
  const studentsTableBody = document.querySelector('#studentsTable tbody');
  const savePaymentBtn = document.getElementById('savePaymentBtn');

  // Attendees modal elements
  const attendeesModal = document.getElementById('attendeesModal');
  const closeAttendeesModal = document.getElementById('closeAttendeesModal');
  const attendeesModalTitle = document.getElementById('attendeesModalTitle');
  const attendeesTableBody = document.querySelector('#attendeesTable tbody');
  const saveAttendeesBtn = document.getElementById('saveAttendeesBtn');

  let allEvents = [];
  let currentEventId = null;
  let currentStudents = [];
  let currentAttendees = [];

  backBtn?.addEventListener('click', () => {
    window.location.href = '/admin/home/accountability';
  });

  // ======================== FETCH EVENTS ========================
  async function fetchEvents() {
    try {

      /* Fetch events from API */
      const res = await fetch('/api/events');
      const data = await res.json();

      /* Handle API response */
      if (data.success && Array.isArray(data.events)) {
        allEvents = data.events;
        populateYearDropdown(allEvents);
        renderEvents(allEvents);
      } else {
        eventsList.innerHTML = `<p>${data.message || 'No events found.'}</p>`;
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      eventsList.innerHTML = '<div class="error">Failed to load events.</div>';
    }
  }

  /* Populate year filter dropdown */
  function populateYearDropdown(events) {
    const years = [...new Set(events.map(e => new Date(e.start_date).getFullYear()))].sort((a,b) => b-a);
    filterSelect.innerHTML = '<option value="">All Years</option>';
    years.forEach(y => {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      filterSelect.appendChild(opt);
    });
  }

  /* Render events to the DOM */
  function renderEvents(events) {
    eventsList.innerHTML = '';
    if (!events.length) {
      eventsList.innerHTML = '<p>No events found.</p>';
      return;
    }

    /* Create event elements */
    events.forEach(event => {
      const eventDiv = document.createElement('div');
      eventDiv.classList.add('event');

      const badgeColor = event.type === 'Homecoming' ? '#ff6f61' : '#00bfff';
      const badge = `<span class="badge" style="background:${badgeColor}">${event.type}</span>`;
      const start = new Date(event.start_date).toLocaleDateString();
      const end = event.end_date ? new Date(event.end_date).toLocaleDateString() : '';
      const time = event.date_time ? ' @ ' + new Date(event.date_time).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '';
      const dateStr = event.type === 'Homecoming' && event.date_time ? new Date(event.date_time).toLocaleString() : `${start}${end ? ' - ' + end : ''}${time}`;

      const publishText = event.is_published ? 'Unpublish' : 'Publish';
      const publishColor = event.is_published ? '#888' : '#007bff';

      eventDiv.innerHTML = `
        <span class="event-info" data-id="${event.eid}">
          <strong>${event.event_name}</strong> ${badge}<br>
          Theme: ${event.theme || '—'}<br>
          Location: ${event.location || '—'}<br>
          Date: ${dateStr}<br>
          Fee: ₱${Number(event.amount).toFixed(2)}<br>
          Payment Due: ${event.payment_due || '—'}<br>
          Instructions: ${event.payment_instructions || '—'}
        </span>
        <div class="actions">
          <button class="publish" style="background:${publishColor};">${publishText}</button>
          <button class="edit">Edit</button>
          <button class="delete">Delete</button>
        </div>
      `;
      eventsList.appendChild(eventDiv);

      // VIEW PAYMENTS / ATTENDANCE
      eventDiv.querySelector('.event-info').addEventListener('click', () =>
        openEventChoiceModal(event.eid, event.event_name)
      );

      // DELETE
      eventDiv.querySelector('.delete').addEventListener('click', async () => {
        if (!confirm(`Delete "${event.event_name}"?`)) return;
        try {
          const delRes = await fetch(`/api/events/${event.eid}`, { method:'DELETE' });
          const delData = await delRes.json();
          if (delData.success) {
            alert('Event deleted');
            eventDiv.remove();
          } else alert(delData.message || 'Failed to delete');
        } catch (err) {
          console.error(err);
          alert('Error deleting event');
        }
      });

// EDIT EVENT
const editBtn = eventDiv.querySelector('.edit');
editBtn.addEventListener('click', () => {
  const eid = event.eid;
  if (!eid) {
    console.error('Event ID missing for edit.');
    return;
  }
  window.location.href = `/admin/home/accountability/editEvent?eid=${encodeURIComponent(eid)}`;
});



      // PUBLISH / UNPUBLISH
      const publishBtn = eventDiv.querySelector('.publish');
      publishBtn.addEventListener('click', async () => {
        const newState = publishText === 'Publish';
        try {
          const res = await fetch(`/api/events/${event.eid}/publish`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_published: newState })
          });
          const data = await res.json();
          if (data.success) fetchEvents();
          else alert(data.message || 'Failed to update publish state.');
        } catch (err) {
          console.error(err);
          alert('Error updating publish state.');
        }
      });
    });
  }

  function openEventChoiceModal(eid, eventName) {
    const choice = prompt(`Manage "${eventName}":\nType "1" for Payments\nType "2" for Attendance`);
    if (choice === "1") openStudentsModal(eid, eventName);
    else if (choice === "2") openAttendeesModal(eid, eventName);
  }

  // ======================== PAYMENTS ========================
  async function openStudentsModal(eid, eventName) {
    currentEventId = eid;
    modalTitle.textContent = `Payments - ${eventName}`;
    modal.classList.remove('hidden');

    try {
      const res = await fetch(`/api/events/${eid}/participants`);
      const data = await res.json();
      if (data.success) currentStudents = data.participants;
      else currentStudents = [];
      renderStudents(currentStudents);
    } catch (err) {
      console.error(err);
      alert('Failed to load participants.');
      currentStudents = [];
      renderStudents(currentStudents);
    }
  }

  /* Render students to the payments modal */
  function renderStudents(students) {
    studentsTableBody.innerHTML = '';
    students.forEach(stu => {
      const row = document.createElement('tr');
      const isRegistered = stu.paid || false;
      const buttonLabel = isRegistered ? 'Unregister' : 'Register';
      const buttonColor = isRegistered ? '#dc3545' : '#28a745';

      row.innerHTML = `
        <td>${stu.sid}</td>
        <td>${stu.last_name}, ${stu.first_name}</td>
        <td>${stu.section}</td>
        <td>
          <button 
            class="toggle-register-btn" 
            data-sid="${stu.sid}" 
            style="background:${buttonColor}; color:#fff; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">
            ${buttonLabel}
          </button>
        </td>
      `;
      studentsTableBody.appendChild(row);
    });

    // Toggle registration
    studentsTableBody.querySelectorAll('.toggle-register-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const sid = btn.dataset.sid;
        const student = currentStudents.find(s => s.sid === sid);
        student.paid = !student.paid;

        try {
          const res = await fetch(`/api/events/${currentEventId}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sid, registered: student.paid })
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.message || 'Update failed');
        } catch (err) {
          console.error(err);
          alert('Failed to update registration.');
          student.paid = !student.paid;
          return;
        }

        btn.textContent = student.paid ? 'Unregister' : 'Register';
        btn.style.background = student.paid ? '#dc3545' : '#28a745';
      });
    });
  }

  savePaymentBtn.addEventListener('click', () => modal.classList.add('hidden'));
  closeModal.addEventListener('click', () => modal.classList.add('hidden'));
  window.addEventListener('click', e => { if(e.target === modal) modal.classList.add('hidden'); });

  // ======================== ATTENDANCE ========================
  async function openAttendeesModal(eid, eventName) {
    currentEventId = eid;
    attendeesModalTitle.textContent = `Attendees - ${eventName}`;
    attendeesModal.classList.remove('hidden');

    /* Fetch attendees */
    try {
      const res = await fetch(`/api/events/${eid}/attendees`);
      const data = await res.json();
      if (data.success) currentAttendees = data.attendees;
      else currentAttendees = [];
      renderAttendees(currentAttendees);
    } catch (err) {
      console.error(err);
      alert('Failed to load attendees.');
      currentAttendees = [];
      renderAttendees(currentAttendees);
    }
  }

  /* Render attendees to the attendance modal */
  function renderAttendees(attendees) {
    attendeesTableBody.innerHTML = '';
    attendees.forEach(stu => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${stu.sid}</td>
        <td>${stu.last_name}, ${stu.first_name}</td>
        <td>${stu.section}</td>
        <td><input type="checkbox" data-sid="${stu.sid}" ${stu.attended ? 'checked' : ''}></td>
      `;
      attendeesTableBody.appendChild(row);
    });
  }

  saveAttendeesBtn.addEventListener('click', async () => {
    /* Gather attendance updates */
    const updates = Array.from(attendeesTableBody.querySelectorAll('input[type="checkbox"]'))
      .map(cb => ({ sid: cb.dataset.sid, attended: cb.checked }));

    try {
      const res = await fetch(`/api/events/${currentEventId}/attendees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });
      const data = await res.json();
      if (data.success) alert('Attendance updated.');
      else alert(data.message || 'Failed to update attendance.');
    } catch (err) {
      console.error(err);
      alert('Failed to update attendance.');
    }
    attendeesModal.classList.add('hidden');
  });

  closeAttendeesModal.addEventListener('click', () => attendeesModal.classList.add('hidden'));
  window.addEventListener('click', e => { if(e.target === attendeesModal) attendeesModal.classList.add('hidden'); });

  // ======================== SEARCH & FILTER ========================
  searchBtn.addEventListener('click', filterEvents);
  filterSelect.addEventListener('change', filterEvents);

  /* Filter events based on search and year */
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
