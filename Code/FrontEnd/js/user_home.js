document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('userLogoutBtn');

    // ----- LOGOUT -----
    logoutBtn?.addEventListener('click', async () => {
        await fetch('/logout', { method: 'POST' });
        window.location.href = '/';
    });

    // ----- NAVIGATE TO EDIT PERSONAL INFO -----
    const updateInfoBtn = document.getElementById('updateInfoBtn');
    updateInfoBtn?.addEventListener('click', () => {
        alert("Feature under maintenance.");
        window.location.href = '/user/home'; // Redirect back to dashboard or members list
    });

    // ----- REGISTER FOR EVENT -----
    const registerEventBtn = document.getElementById('registerEventBtn');
    registerEventBtn?.addEventListener('click', () => {
        alert("Feature under maintenance.");
        // Optional: stay on current page or redirect
        window.location.href = '/user/home';
    });

    // ----- VIEW PARTICIPATION STATUS -----
    const viewParticipationStatusBtn = document.getElementById('viewParticipationStatusBtn');
    viewParticipationStatusBtn?.addEventListener('click', () => {
        alert("Feature under maintenance.");
        window.location.href = '/user/home';
    });

    // ----- EVENT ANALYTICS -----
    const eventAnalyticsBtn = document.getElementById('eventAnalyticsBtn');
    eventAnalyticsBtn?.addEventListener('click', () => {
        alert("Feature under maintenance.");
        window.location.href = '/user/home';
    });
});
