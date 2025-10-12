document.addEventListener('DOMContentLoaded', async () => {
  const backBtn = document.getElementById('backBtn');
  const eventsList = document.querySelector('.events-list');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const filterSelect = document.getElementById('filterSelect');

  backBtn?.addEventListener('click', () => {
    window.location.href = '/admin/home';
  });

  if (!eventsList) return;

  let allEvents = [];

  // --- Fetch all homecoming events ---
  async function fetchEvents() {
    try {
      const response = await fetch('/admin/home/homecoming/list');
      const data = await response.json();

      if (data.success && Array.isArray(data.events)) {
        allEvents = data.events;
        populateYearDropdown(allEvents);
        renderEvents(allEvents);
      } else {
        eventsList.innerHTML = `<p>${data.message || 'No homecoming events found.'}</p>`;
      }
    } catch (err) {
      console.error('Error fetching homecoming events:', err);
      eventsList.innerHTML = `<div class="error">Failed to load homecoming events.</div>`;
    }
  }

  // --- Populate dropdown with years ---
  function populateYearDropdown(events) {
    const years = [...new Set(events.map(e => new Date(e.date_time).getFullYear()))].sort((a, b) => b - a);

    filterSelect.innerHTML = `<option value="">All Years</option>`;
    years.forEach(year => {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      filterSelect.appendChild(option);
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
      const eventDiv = document.createElement('div');
      eventDiv.classList.add('event');

      eventDiv.innerHTML = `
        <span>
          <strong>${event.event_name}</strong><br>
          Theme: ${event.theme}<br>
          Date & Time: ${new Date(event.date_time).toLocaleString()}<br>
          Venue: ${event.venue}
        </span>
        <div class="actions">
          <button class="edit">Edit</button>
          <button class="delete">Delete</button>
        </div>
      `;

      eventsList.appendChild(eventDiv);

      // --- Delete functionality ---
      eventDiv.querySelector('.delete').addEventListener('click', async () => {
        if (!confirm(`Are you sure you want to delete "${event.event_name}"?`)) return;

        try {
          const delResponse = await fetch(`/admin/home/homecoming/delete/${event.hid}`, {
            method: 'DELETE',
          });
          const delData = await delResponse.json();

          if (delData.success) {
            alert('Homecoming event deleted successfully');
            eventDiv.remove();
          } else {
            alert(delData.message || 'Failed to delete event');
          }
        } catch (err) {
          console.error('Error deleting homecoming event:', err);
          alert('Failed to delete event');
        }
      });

      // --- Edit functionality ---
      eventDiv.querySelector('.edit').addEventListener('click', () => {
        window.location.href = `/admin/home/homecoming/edit?hid=${event.hid}`;
      });
    });
  }

  // --- Filter + Search functionality ---
  function filterEvents() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedYear = filterSelect.value;

    let filtered = allEvents.filter(event => {
      const nameMatch = event.event_name.toLowerCase().includes(searchTerm) || event.theme.toLowerCase().includes(searchTerm);
      const yearMatch = !selectedYear || new Date(event.date_time).getFullYear().toString() === selectedYear;
      return nameMatch && yearMatch;
    });

    renderEvents(filtered);
  }

  // --- Search button click ---
  searchBtn.addEventListener('click', filterEvents);

  // --- Filter change ---
  filterSelect.addEventListener('change', filterEvents);

  // --- Initial load ---
  await fetchEvents();
});
