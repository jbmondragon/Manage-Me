document.addEventListener('DOMContentLoaded', async () => {
  // --- Back button navigation ---
  const backBtn = document.getElementById('backBtn');
  backBtn?.addEventListener('click', () => {
    window.location.href = '/admin/home/accountability';
  });

  // --- Container for event list ---
  const eventsList = document.querySelector('.events-list');
  if (!eventsList) return;

  try {
    const response = await fetch('/admin/home/events/list');
    const data = await response.json();

    if (data.success && Array.isArray(data.events)) {
      eventsList.innerHTML = ''; // Clear placeholder content

      if (data.events.length === 0) {
        eventsList.innerHTML = '<p>No events found.</p>';
        return;
      }

      data.events.forEach(event => {
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

        // --- Delete functionality ---
        const deleteBtn = eventDiv.querySelector('.delete');
        deleteBtn.addEventListener('click', async () => {
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

        // --- Edit functionality ---
        const editBtn = eventDiv.querySelector('.edit');
        editBtn.addEventListener('click', () => {
          // Redirect to your specified edit page
          window.location.href = `/admin/home/event/editMembers?eid=${event.eid}`;
        });
      });
    } else {
      eventsList.innerHTML = `<div class="error">${data.message || 'No events found.'}</div>`;
    }
  } catch (err) {
    console.error('Error fetching events:', err);
    eventsList.innerHTML = `<div class="error">Failed to load events.</div>`;
  }
});
