document.addEventListener('DOMContentLoaded', async () => {
  // --- Back button navigation ---
  const backBtn = document.getElementById('backBtn');
  backBtn?.addEventListener('click', () => {
    window.location.href = '/admin/home';
  });

  // --- Container for homecoming events ---
  const eventsList = document.querySelector('.events-list');
  if (!eventsList) return;

  try {
    const response = await fetch('/admin/home/homecoming/list');
    const data = await response.json();

    if (data.success && Array.isArray(data.events)) {
      eventsList.innerHTML = ''; // Clear placeholder content

      if (data.events.length === 0) {
        eventsList.innerHTML = '<p>No homecoming events found.</p>';
        return;
      }

      data.events.forEach(event => {
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
        const deleteBtn = eventDiv.querySelector('.delete');
        deleteBtn.addEventListener('click', async () => {
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
            console.error('Error deleting event:', err);
            alert('Failed to delete event');
          }
        });

        // --- Edit functionality ---
        const editBtn = eventDiv.querySelector('.edit');
        editBtn.addEventListener('click', () => {
          // Redirect to edit page for Homecoming event
          window.location.href = `/admin/home/homecoming/edit?hid=${event.hid}`;
        });
      });
    } else {
      eventsList.innerHTML = `<div class="error">${data.message || 'No homecoming events found.'}</div>`;
    }
  } catch (err) {
    console.error('Error fetching homecoming events:', err);
    eventsList.innerHTML = `<div class="error">Failed to load homecoming events.</div>`;
  }
});
