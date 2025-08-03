
const emailInput = document.getElementById("email-input");
const loginBtn = document.getElementById("login-btn");
const loginSection = document.getElementById("login-section");
const bookingSection = document.getElementById("booking-section");
const bookBtn = document.getElementById("book-btn");
const datePicker = document.getElementById("date-picker");
const timeSelect = document.getElementById("time-select");
const reservedList = document.getElementById("reserved-list");
const toggleLangBtn = document.getElementById("toggle-lang");
const adminSection = document.getElementById("admin-section");
const adminLoginBtn = document.getElementById("admin-login");
const adminPasswordInput = document.getElementById("admin-password");
const adminPanel = document.getElementById("admin-panel");
const allBookingsList = document.getElementById("all-bookings");

let currentUser = null;
let currentLang = "ar";

const times = Array.from({ length: 32 }, (_, i) => {
  const hour = 8 + Math.floor(i / 4);
  const minute = (i % 4) * 15;
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
});

function loadTimes(date) {
  timeSelect.innerHTML = "";
  const dayBookings = getBookingsByDate(date);
  times.forEach((time) => {
    const booked = dayBookings.find((b) => b.time === time);
    const option = document.createElement("option");
    option.value = time;
    option.textContent = time + (booked ? " (محجوز)" : "");
    option.disabled = !!booked;
    timeSelect.appendChild(option);
  });
}

function getBookings() {
  return JSON.parse(localStorage.getItem("bookings") || "[]");
}

function saveBooking(booking) {
  const bookings = getBookings();
  bookings.push(booking);
  localStorage.setItem("bookings", JSON.stringify(bookings));
}

function getBookingsByDate(date) {
  return getBookings().filter((b) => b.date === date);
}

function getUserBookings(date, email) {
  return getBookings().filter((b) => b.date === date && b.email === email);
}

function refreshReservedList(date) {
  const bookings = getBookingsByDate(date);
  reservedList.innerHTML = "";
  bookings.forEach((b) => {
    const li = document.createElement("li");
    li.textContent = `${b.time} - ${b.email}`;
    reservedList.appendChild(li);
  });
}

function refreshAllBookings() {
  const bookings = getBookings();
  allBookingsList.innerHTML = "";
  bookings.forEach((b, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${b.date} ${b.time} - ${b.email}</span>
    <button onclick="deleteBooking(${i})" class="bg-red-500 text-white px-2 rounded">X</button>`;
    allBookingsList.appendChild(li);
  });
}

window.deleteBooking = function (index) {
  const bookings = getBookings();
  bookings.splice(index, 1);
  localStorage.setItem("bookings", JSON.stringify(bookings));
  refreshAllBookings();
};

loginBtn.onclick = () => {
  const email = emailInput.value.trim().toLowerCase();
  if (!email.endsWith("@moh.gov.sa") && !email.endsWith("@makkahhc.sa")) {
    alert("يرجى استخدام البريد الوزاري");
    return;
  }
  currentUser = email;
  loginSection.classList.add("hidden");
  bookingSection.classList.remove("hidden");
};

bookBtn.onclick = () => {
  const date = datePicker.value;
  const time = timeSelect.value;
  if (!date || !time) return;

  const existing = getUserBookings(date, currentUser);
  if (existing.length > 0) {
    alert("لا يمكنك حجز أكثر من موعد في نفس اليوم");
    return;
  }

  saveBooking({ date, time, email: currentUser });
  loadTimes(date);
  refreshReservedList(date);
};

adminLoginBtn.onclick = () => {
  if (adminPasswordInput.value === "admin123") {
    adminPanel.classList.remove("hidden");
    refreshAllBookings();
  } else {
    alert("كلمة مرور خاطئة");
  }
};

toggleLangBtn.onclick = () => {
  currentLang = currentLang === "ar" ? "en" : "ar";
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
  toggleLangBtn.textContent = currentLang === "ar" ? "English" : "العربية";
};

mobiscroll.setOptions({
  locale: mobiscroll.localeAr,
  theme: "ios",
  themeVariant: "light",
});

mobiscroll.datepicker("#date-picker", {
  controls: ["calendar"],
  calendarSystem: "hijri",
  display: "anchored",
  onChange: function (event) {
    const dateStr = event.valueText;
    loadTimes(dateStr);
    refreshReservedList(dateStr);
  },
});
