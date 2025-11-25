document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('userLogoutBtn');

    // Logout
    logoutBtn.addEventListener('click', async () => {
        await fetch('/logout', { method: 'POST' });
        window.location.href = '/login';
    });

    // Navigate to Edit Personal Info
    document.getElementById('updateInfoBtn').addEventListener('click', () => {
        window.location.href = '/user/home/members/editMembers';
    });

    // Register for Event
    document.getElementById('registerEventBtn').addEventListener('click', async () => {
        const res = await fetch('/api/events/available');
        const events = await res.json();

        const eventId = prompt(
            `Available events:\n${events.map(e => `${e.eid}: ${e.event_name}`).join('\n')}\nEnter event ID to register:`
        );

        if (eventId) {
            const registerRes = await fetch('/api/events/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eid: eventId })
            });
            const result = await registerRes.json();
            alert(result.message);
        }
    });

    // View Participation Status
    document.getElementById('viewParticipationStatusBtn').addEventListener('click', async () => {
        const res = await fetch('/api/events/participation-status');
        const participations = await res.json();

        let msg = 'Your Event Participation:\n';
        participations.forEach(p => {
            msg += `${p.event_name} - Registered: ${p.registered}, Attended: ${p.attended}, Paid: ${p.paid}\n`;
        });
        alert(msg);
    });

    // Event Analytics
    document.getElementById('eventAnalyticsBtn').addEventListener('click', async () => {
        const res = await fetch('/api/events/analytics');
        const analytics = await res.json();

        let msg = 'Event Analytics:\n';
        analytics.forEach(a => {
            msg += `${a.event_name} - Registered: ${a.registered_count}, Attended: ${a.attended_count}\n`;
        });
        alert(msg);
    });
});
