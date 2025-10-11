// editEvent.js

document.addEventListener("DOMContentLoaded", async () => {
  const backBtn = document.getElementById("backBtn");
  const updateBtn = document.getElementById("addToDatabaseBtn");

  const nameInput = document.getElementById("nameOfEvent");
  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");
  const amountInput = document.getElementById("amount");

  // --- Get event ID from URL parameters ---
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get("eid");

  if (!eventId) {
    alert("Error: No event ID provided.");
    updateBtn.disabled = true;
    return;
  }

  // --- Fetch event data from backend ---
  async function loadEventData() {
    try {
      const res = await fetch(`/admin/home/events/get/${eventId}`);
      const data = await res.json();

      if (!data.success) throw new Error(data.message || "Failed to fetch event details");

      const event = data.event;
      nameInput.value = event.event_name || "";
      startDateInput.value = event.start_date ? event.start_date.split("T")[0] : "";
      endDateInput.value = event.end_date ? event.end_date.split("T")[0] : "";
      amountInput.value = event.amount || "";
    } catch (error) {
      console.error("Error loading event data:", error);
      alert("Error loading event data.");
    }
  }

  await loadEventData();

  // --- Update event data ---
  updateBtn.addEventListener("click", async () => {
    const updatedEvent = {
      eventId: eventId,
      nameOfEvent: nameInput.value.trim(),
      startDate: startDateInput.value,
      endDate: endDateInput.value,
      amount: amountInput.value.trim(),
    };

    if (!updatedEvent.nameOfEvent || !updatedEvent.startDate || !updatedEvent.endDate || !updatedEvent.amount) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const res = await fetch("/admin/home/events/alter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEvent),
      });

      const data = await res.json();

      if (data.success) {
        alert(data.message || "Event updated successfully!");
        window.location.href = "/admin/home/accountability/viewEvent";
      } else {
        alert(data.message || "Failed to update event.");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Error updating event.");
    }
  });

  // --- Back button ---
  backBtn?.addEventListener("click", () => {
    window.location.href = "/admin/home/accountability";
  });
});
