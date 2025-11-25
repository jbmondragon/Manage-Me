document.addEventListener("DOMContentLoaded", async () => {
  // --- Elements ---
  const backBtn = document.getElementById("backBtn");
  const updateBtn = document.getElementById("createEventBtn");

  const nameInput = document.getElementById("eventName");
  const typeSelect = document.getElementById("eventType");
  const themeInput = document.getElementById("theme");
  const locationInput = document.getElementById("location");
  const startDateInput = document.getElementById("startDate");
  const timeInput = document.getElementById("time");
  const endDateInput = document.getElementById("endDate");
  const feeInput = document.getElementById("fee");
  const dueDateInput = document.getElementById("dueDate");
  const paymentInstructionsInput = document.getElementById("paymentInstructions");

  // --- Back button ---
  backBtn?.addEventListener("click", () => {
    window.location.href = "/admin/home/accountability/viewEvent";
  });

  // --- Get event ID ---
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get("eid");

  if (!eventId) {
    alert("No event ID provided.");
    updateBtn.disabled = true;
    return;
  }

  // ------------------------------------------
  //   LOAD EVENT INTO FORM (FIXED FORMATTING)
  // ------------------------------------------
  async function loadEventData() {
    try {
      const res = await fetch(`/api/events/${eventId}/details`);
      const data = await res.json();

      if (!data.success) throw new Error(data.message || "Failed to fetch event details");

      const event = data.event;

      nameInput.value = event.event_name || "";
      typeSelect.value = event.type || "General";
      themeInput.value = event.theme || "";
      locationInput.value = event.location || "";

      // FIXED: format for <input type="date">
      startDateInput.value = event.start_date
        ? event.start_date.split("T")[0]
        : "";

      // FIXED: format for <input type="time">
      timeInput.value = event.date_time
        ? new Date(event.date_time).toISOString().slice(11, 16)
        : "";

      endDateInput.value = event.end_date
        ? event.end_date.split("T")[0]
        : "";

      feeInput.value = event.amount !== null ? event.amount : "";
      dueDateInput.value = event.payment_due ? event.payment_due.split("T")[0] : "";

      paymentInstructionsInput.value = event.payment_instructions || "";
    } catch (error) {
      console.error("Error loading event data:", error);
      alert("Error loading event data. Check console for details.");
    }
  }

  await loadEventData();

  // ------------------------------------------
  //      UPDATE EVENT (MATCHES BACKEND)
  // ------------------------------------------
  updateBtn.addEventListener("click", async () => {
    const updatedEvent = {
  eventId,
  event_name: nameInput.value.trim(),
  type: typeSelect.value,
  theme: themeInput.value.trim(),
  location: locationInput.value.trim(),
  start_date: startDateInput.value,
  
  // FIX: backend expects TIMESTAMP, not "HH:mm"
  date_time: timeInput.value
    ? `${startDateInput.value} ${timeInput.value}`
    : null,

  end_date: endDateInput.value,
  amount: feeInput.value.trim(),
  payment_due: dueDateInput.value,
  payment_instructions: paymentInstructionsInput.value.trim(),
};


    // FRONTEND Validation
    if (!updatedEvent.event_name || !updatedEvent.start_date) {
      alert("Event name and start date are required.");
      return;
    }

    try {
      const res = await fetch(`/admin/home/events/alter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEvent),
      });

      const data = await res.json();

      if (data.success) {
        alert("Event updated successfully!");
        window.location.href = "/admin/home/accountability/viewEvent";
      } else {
        alert(data.message || "Failed to update event.");
      }

    } catch (error) {
      console.error("Error updating event:", error);
      alert("Error updating event. Check console for details.");
    }
  });
});
