document.addEventListener('DOMContentLoaded', async () => {
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '/admin/home';
    });
  }

  const membersList = document.querySelector('.members-list');

  try {
    const response = await fetch('/admin/home/members/list');
    const data = await response.json();

    if (data.success) {
      membersList.innerHTML = ''; // clear placeholder

      data.members.forEach(member => {
        const memberDiv = document.createElement('div');
        memberDiv.classList.add('member');

        memberDiv.innerHTML = `
          <span>${member.sid} - ${member.last_name}, ${member.first_name} ${member.middle_name || ''}</span>
          <div class="actions">
            <button class="edit">edit</button>
            <button class="delete">delete</button>
          </div>
        `;

        membersList.appendChild(memberDiv);

        // --- Delete functionality ---
        const deleteBtn = memberDiv.querySelector('.delete');
        deleteBtn.addEventListener('click', async () => {
          if (confirm(`Are you sure you want to delete ${member.first_name} ${member.last_name}?`)) {
            try {
              const delResponse = await fetch(`/admin/home/members/delete/${member.sid}`, {
                method: 'DELETE'
              });
              const delData = await delResponse.json();
              if (delData.success) {
                alert('Member deleted successfully');
                memberDiv.remove(); // remove member from DOM
              } else {
                alert(delData.message);
              }
            } catch (err) {
              console.error('Error deleting member:', err);
              alert('Failed to delete member');
            }
          }
        });

        // --- Edit functionality (redirect to editMembers route) ---
        const editBtn = memberDiv.querySelector('.edit');
        editBtn.addEventListener('click', () => {
          // Redirect to the editMembers page with the student's sid as a query parameter
          window.location.href = `/admin/home/members/editMembers?sid=${member.sid}`;
        });
      });
    } else {
      membersList.innerHTML = `<div class="error">${data.message}</div>`;
    }
  } catch (err) {
    console.error('Error fetching members:', err);
    membersList.innerHTML = `<div class="error">Failed to load members</div>`;
  }
});
