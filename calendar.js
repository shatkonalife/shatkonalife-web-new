// calendar.js
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig"; // Adjust path to your firebase config if needed

const MASTER_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", 
  "11:00 AM", "11:30 AM", "04:00 PM", "04:30 PM", "05:00 PM"
];

export let selectedTimeSlot = null;
export let selectedAppointmentDate = null;

export function initCalendar() {
  const dateInput = document.getElementById("appointmentDate");
  const slotsContainer = document.getElementById("slotsContainer");

  if (!dateInput || !slotsContainer) return;

  // 1. Restrict Date Picker (Today up to exactly 2 months/60 days from now)
  const today = new Date();
  const maxDate = new Date();
  setMonthWithOverflow(maxDate, today.getMonth() + 2); // Safely handles month rolls

  dateInput.min = formatDateISO(today);
  dateInput.max = formatDateISO(maxDate);

  // 2. Listen for Date Changes
  dateInput.addEventListener("change", async (e) => {
    selectedAppointmentDate = e.target.value;
    if (!selectedAppointmentDate) {
      slotsContainer.innerHTML = '<p class="placeholder-text" style="font-size: 13px; color: #888; margin: 0;">Please pick a valid date above to load open time slots.</p>';
      selectedTimeSlot = null;
      return;
    }

    slotsContainer.innerHTML = '<p style="font-size: 13px; color: #555; margin: 0;">Loading available slots...</p>';
    selectedTimeSlot = null;
    
    // Fetch booked slots from Firestore for this date
    const bookedSlots = await fetchBookedSlotsForDate(selectedAppointmentDate);
    
    renderSlotUI(slotsContainer, bookedSlots);
  });
}

// Helper to format date as YYYY-MM-DD avoiding timezone bugs
function formatDateISO(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Helper to securely increment months
function setMonthWithOverflow(dateObj, targetMonth) {
  dateObj.setMonth(targetMonth);
}

// 3. Query Firestore helper
async function fetchBookedSlotsForDate(dateStr) {
  try {
    const q = query(
      collection(db, "bookings"),
      where("date", "==", dateStr),
      where("status", "==", "confirmed")
    );
    const snapshot = await getDocs(q);
    const booked = [];
    snapshot.forEach(doc => booked.push(doc.data().timeSlot));
    return booked;
  } catch (err) {
    console.error("Error fetching slots:", err);
    return [];
  }
}

// 4. Render the Slot Buttons on the Screen
function renderSlotUI(slotsContainer, bookedSlots) {
  slotsContainer.innerHTML = "";
  selectedTimeSlot = null;

  if (MASTER_SLOTS.length === 0) {
    slotsContainer.innerHTML = '<p style="font-size: 13px; color: #888; margin: 0;">No slots available for this date.</p>';
    return;
  }

  MASTER_SLOTS.forEach(slot => {
    const isBooked = bookedSlots.includes(slot);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "slot-btn";
    btn.textContent = slot;

    if (isBooked) {
      btn.disabled = true; // Gray out and strike through taken slots
      btn.title = "This slot is already booked";
    } else {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".slot-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        selectedTimeSlot = slot;
      });
    }

    slotsContainer.appendChild(btn);
  });
}

// 5. Helper Getters for main view file
export function getSelectedDate() {
  return selectedAppointmentDate;
}

export function getSelectedSlot() {
  return selectedTimeSlot;
}