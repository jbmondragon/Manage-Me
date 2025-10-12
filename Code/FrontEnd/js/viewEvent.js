document.addEventListener('DOMContentLoaded', async () => {
  const backBtn = document.getElementById('backBtn');
  const eventsList = document.querySelector('.events-list');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const filterSelect = document.getElementById('filterSelect');

  backBtn?.addEventListener('click', () => {
    window.location.href = '/admin/home/accountability';
  });

  if (!eventsList) return;

  let allEvents = [];

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

  // --- Populate dropdown with event years ---
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

  // --- Render events ---
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
        <span>
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

      // Delete functionality
      eventDiv.querySelector('.delete').addEventListener('click', async () => {
        if (!confirm(`Are you sure you want to delete "${event.event_name}"?`)) return;

        try {
          const delResponse = await fetch(`/admin/home/events/delete/${event.eid}`, {
            method: 'DELETE',
          });
          const delData = await delResponse.json();

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

      // Edit functionality
      eventDiv.querySelector('.edit').addEventListener('click', () => {
        window.location.href = `/admin/home/event/editMembers?eid=${event.eid}`;
      });
    });
  }

  // --- Filter events based on search and year ---
  function filterEvents() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedYear = filterSelect.value;

    let filtered = allEvents.filter(event => {
      const nameMatch = event.event_name.toLowerCase().includes(searchTerm);
      const yearMatch = !selectedYear || new Date(event.start_date).getFullYear().toString() === selectedYear;
      return nameMatch && yearMatch;
    });

    renderEvents(filtered);
  }

  // --- Search button ---
  searchBtn.addEventListener('click', filterEvents);

  // --- Dropdown change ---
  filterSelect.addEventListener('change', filterEvents);

  // --- Initial load ---
  await fetchEvents();
});
