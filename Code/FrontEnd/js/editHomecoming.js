// editHomecoming.js

document.addEventListener("DOMContentLoaded", async () => {
  const backBtn = document.getElementById("backBtn");
  const updateBtn = document.getElementById("addToDatabaseBtn");

  const nameInput = document.getElementById("eventName");
  const themeInput = document.getElementById("theme");
  const dateTimeInput = document.getElementById("dateTime");
  const venueInput = document.getElementById("venue");

  // --- Get Homecoming ID from URL parameters ---
  const urlParams = new URLSearchParams(window.location.search);
  const homecomingId = urlParams.get("hid");

  if (!homecomingId) {
    alert("Error: No Homecoming ID provided.");
    updateBtn.disabled = true;
    return;
  }

  // --- Helper to format timestamp for datetime-local input ---
  function formatDateTimeForInput(timestamp) {
    if (!timestamp) return "";
    const dt = new Date(timestamp);
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    const hours = String(dt.getHours()).padStart(2, "0");
    const minutes = String(dt.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // --- Fetch Homecoming event data from backend ---
  async function loadHomecomingData() {
    try {
      const res = await fetch(`/admin/home/homecoming/get/${homecomingId}`);
      const data = await res.json();

      if (!data.success) throw new Error(data.message || "Failed to fetch Homecoming event details");

      const event = data.event;
      nameInput.value = event.event_name || "";
      themeInput.value = event.theme || "";
      dateTimeInput.value = formatDateTimeForInput(event.date_time); // correct format
      venueInput.value = event.venue || "";
    } catch (error) {
      console.error("Error loading Homecoming data:", error);
      alert("Error loading Homecoming event data.");
    }
  }

  await loadHomecomingData();

  // --- Update Homecoming event data ---
  updateBtn.addEventListener("click", async () => {
    const updatedEvent = {
      hid: homecomingId,
      eventName: nameInput.value.trim(),
      theme: themeInput.value.trim(),
      dateTime: dateTimeInput.value,
      venue: venueInput.value.trim(),
    };

    if (!updatedEvent.eventName || !updatedEvent.theme || !updatedEvent.dateTime || !updatedEvent.venue) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const res = await fetch("/admin/home/homecoming/alter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEvent),
      });

      const data = await res.json();

      if (data.success) {
        alert(data.message || "Homecoming event updated successfully!");
        // Redirect after alert is closed
        window.location.href = "/admin/homecoming/view";
      } else {
        alert(data.message || "Failed to update Homecoming event.");
      }
    } catch (error) {
      console.error("Error updating Homecoming event:", error);
      alert("Error updating Homecoming event.");
    }
  });

  // --- Back button navigation ---
  backBtn?.addEventListener("click", () => {
    window.location.href = "/admin/homecoming/view";
  });
});
