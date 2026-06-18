const API_URL = "YOUR_GOOGLE_APPS_SCRIPT_URL";

let currentDay = "sun";
let selectedSlot = null;
let bookings = {};

async function loadBookings(day) {
  const res = await fetch(`${API_URL}?action=get&day=${day}`);
  return await res.json();
}

async function saveBooking(payload) {
  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return await res.json();
}

async function renderSlots() {
  const container = document.getElementById("slotsContainer");
  container.innerHTML = "Loading...";

  const data = await loadBookings(currentDay);
  bookings = data.bookings;

  container.innerHTML = data.slots.map(slot => {
    const b = bookings[slot];
    const cls = b ? "slot taken" : "slot";
    return `<div class="${cls}" data-slot="${slot}">${slot}</div>`;
  }).join("");

  document.querySelectorAll(".slot").forEach(el => {
    el.onclick = () => {
      selectedSlot = el.dataset.slot;
    };
  });
}

document.getElementById("confirmBtn").onclick = async () => {
  const pseudo = prompt("Pseudo ?");
  const playerId = prompt("ID ?");
  const alliance = prompt("Alliance ?");

  const payload = {
    action: "book",
    day: currentDay,
    slot: selectedSlot,
    pseudo,
    playerId,
    alliance
  };

  const res = await saveBooking(payload);

  alert(res.message);
  renderSlots();
};

renderSlots();
