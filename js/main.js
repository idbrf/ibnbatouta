/**
 * وكالة كراء السيارات ابن بطوطة - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initBookingModal();
  initCarDetailsModal();
  initQuickBookingForm();
});

/* ==========================================================================
   Navigation & Mobile Menu
   ========================================================================== */
function initNavbar() {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  // Sticky header on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = menuToggle.querySelector('i');
      if (icon) {
        if (navLinks.classList.contains('active')) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-xmark');
        } else {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !menuToggle.contains(e.target) && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        const icon = menuToggle.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      }
    });
  }

  // Active link detection based on path
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* ==========================================================================
   Toast Notification Utility
   ========================================================================== */
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconClass = 'fa-circle-info';
  if (type === 'success') iconClass = 'fa-circle-check';
  if (type === 'error') iconClass = 'fa-circle-exclamation';

  toast.innerHTML = `
    <i class="fa-solid ${iconClass}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/* ==========================================================================
   Global Booking Modal
   ========================================================================== */
let activeBookingCar = null;

function initBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (!modal) return;

  const closeBtns = modal.querySelectorAll('.modal-close, .btn-modal-cancel');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => closeBookingModal());
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeBookingModal();
  });

  // Calculate price dynamically on date change
  const pickDateInput = document.getElementById('bookingPickDate');
  const returnDateInput = document.getElementById('bookingReturnDate');
  const gpsCheck = document.getElementById('optGps');
  const seatCheck = document.getElementById('optBabySeat');
  const driverCheck = document.getElementById('optExtraDriver');

  // Set minimum dates to today & tomorrow
  const today = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 3);
  const tomorrow = tomorrowDate.toISOString().split('T')[0];

  if (pickDateInput) {
    pickDateInput.min = today;
    pickDateInput.value = today;
  }
  if (returnDateInput) {
    returnDateInput.min = today;
    returnDateInput.value = tomorrow;
  }

  [pickDateInput, returnDateInput, gpsCheck, seatCheck, driverCheck].forEach(el => {
    el?.addEventListener('change', updateBookingCalculation);
  });

  // Form submission
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', handleBookingSubmit);
  }

  // WhatsApp direct booking button
  const waBtn = document.getElementById('btnBookingWhatsApp');
  if (waBtn) {
    waBtn.addEventListener('click', handleWhatsAppBooking);
  }
}

function openBookingModal(carId, defaultDates = null) {
  const car = CARS_DATA.find(c => c.id === carId) || CARS_DATA[0];
  activeBookingCar = car;

  const modal = document.getElementById('bookingModal');
  if (!modal) return;

  // Fill car preview
  const imgEl = document.getElementById('bookingCarImg');
  const titleEl = document.getElementById('bookingCarTitle');
  const priceEl = document.getElementById('bookingCarDailyPrice');
  const catEl = document.getElementById('bookingCarCategory');

  if (imgEl) imgEl.src = car.image;
  if (titleEl) titleEl.textContent = car.name;
  if (priceEl) priceEl.textContent = `${car.price} درهم / يومياً`;
  if (catEl) catEl.textContent = `${car.categoryName} • ${car.transmissionName} • ${car.fuelName}`;

  if (defaultDates) {
    if (defaultDates.pickup) document.getElementById('bookingPickDate').value = defaultDates.pickup;
    if (defaultDates.return) document.getElementById('bookingReturnDate').value = defaultDates.return;
  }

  updateBookingCalculation();
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function calculateBookingDetails() {
  if (!activeBookingCar) return { days: 1, total: 0 };

  const pickDateVal = document.getElementById('bookingPickDate')?.value;
  const returnDateVal = document.getElementById('bookingReturnDate')?.value;

  let days = 1;
  if (pickDateVal && returnDateVal) {
    const d1 = new Date(pickDateVal);
    const d2 = new Date(returnDateVal);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    days = diffDays > 0 ? diffDays : 1;
  }

  let extrasDaily = 0;
  if (document.getElementById('optGps')?.checked) extrasDaily += 30;
  if (document.getElementById('optBabySeat')?.checked) extrasDaily += 40;
  if (document.getElementById('optExtraDriver')?.checked) extrasDaily += 50;

  const basePrice = activeBookingCar.price * days;
  const extrasPrice = extrasDaily * days;
  const total = basePrice + extrasPrice;

  return { days, basePrice, extrasPrice, total };
}

function updateBookingCalculation() {
  const calc = calculateBookingDetails();
  const daysEl = document.getElementById('calcDaysCount');
  const totalEl = document.getElementById('calcTotalPrice');

  if (daysEl) daysEl.textContent = `${calc.days} أيام`;
  if (totalEl) totalEl.textContent = `${calc.total} درهم مغربي`;
}

function handleBookingSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.bookingName.value.trim();
  const phone = form.bookingPhone.value.trim();
  const location = form.bookingLocation.value;
  const calc = calculateBookingDetails();

  if (!name || !phone) {
    showToast('يرجى كتابة الاسم ورقم الهاتف لإتمام الحجز', 'error');
    return;
  }

  const reservationCode = 'IBN-' + Math.floor(100000 + Math.random() * 900000);

  // Save reservation locally
  const reservation = {
    code: reservationCode,
    car: activeBookingCar.name,
    customerName: name,
    phone: phone,
    location: location,
    pickupDate: form.bookingPickDate.value,
    returnDate: form.bookingReturnDate.value,
    days: calc.days,
    total: calc.total,
    status: 'مؤكد مبدئياً',
    createdAt: new Date().toISOString()
  };

  const existing = JSON.parse(localStorage.getItem('ibn_batouta_bookings') || '[]');
  existing.push(reservation);
  localStorage.setItem('ibn_batouta_bookings', JSON.stringify(existing));

  closeBookingModal();
  showToast(`تم تسجيل حجزك بنجاح! رقم الحجز: ${reservationCode}. سيتصل بك فريق وكالة ابن بطوطة لتأكيد الاستلام.`, 'success');
  form.reset();
}

function handleWhatsAppBooking() {
  if (!activeBookingCar) return;
  const name = document.getElementById('bookingName')?.value.trim() || 'زبون محترم';
  const phone = document.getElementById('bookingPhone')?.value.trim() || '';
  const location = document.getElementById('bookingLocation')?.value || 'مقر الوكالة';
  const pickup = document.getElementById('bookingPickDate')?.value || '';
  const returnD = document.getElementById('bookingReturnDate')?.value || '';
  const calc = calculateBookingDetails();

  const msg = `السلام عليكم وكالة كراء السيارات ابن بطوطة،
أود حجز السيارة التالية:
🚗 السيارة: ${activeBookingCar.name} (${activeBookingCar.modelName})
👤 الاسم: ${name}
📞 الهاتف: ${phone}
📍 مكان الاستلام: ${location}
📅 تاريخ الاستلام: ${pickup}
📅 تاريخ الإرجاع: ${returnD}
⏱ المدة: ${calc.days} أيام
💰 التكلفة التقديرية: ${calc.total} درهم

هل السيارة متوفرة لتأكيد الحجز؟ شكراً لكم.`;

  const cleanPhone = AGENCY_INFO.phoneInternational.replace('+', '');
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

/* ==========================================================================
   Car Details Modal
   ========================================================================== */
function initCarDetailsModal() {
  const modal = document.getElementById('carDetailsModal');
  if (!modal) return;

  const closeBtns = modal.querySelectorAll('.modal-close, .btn-modal-cancel');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  const bookFromDetails = document.getElementById('btnDetailsBookNow');
  if (bookFromDetails) {
    bookFromDetails.addEventListener('click', () => {
      const carId = bookFromDetails.getAttribute('data-car-id');
      modal.classList.remove('active');
      openBookingModal(carId);
    });
  }
}

function openCarDetailsModal(carId) {
  const car = CARS_DATA.find(c => c.id === carId);
  if (!car) return;

  const modal = document.getElementById('carDetailsModal');
  if (!modal) return;

  document.getElementById('detailsCarImg').src = car.image;
  document.getElementById('detailsCarTitle').textContent = car.name;
  document.getElementById('detailsCarModel').textContent = `${car.modelName} • موديل ${car.year}`;
  document.getElementById('detailsCarPrice').textContent = `${car.price} درهم / اليوم`;
  document.getElementById('detailsCarCategory').textContent = car.categoryName;
  document.getElementById('detailsCarDesc').textContent = car.description;

  document.getElementById('specTransmission').textContent = car.transmissionName;
  document.getElementById('specFuel').textContent = car.fuelName;
  document.getElementById('specPassengers').textContent = `${car.passengers} ركاب`;
  document.getElementById('specDoors').textContent = `${car.doors} أبواب`;
  document.getElementById('specLuggage').textContent = `${car.luggage} حقائب`;
  document.getElementById('specAc').textContent = car.airConditioning ? 'متوفر (أوتوماتيكي)' : 'غير متوفر';

  // Features list
  const featList = document.getElementById('detailsFeaturesList');
  if (featList) {
    featList.innerHTML = car.features.map(f => `
      <li style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-weight: 600; font-size: 0.9rem;">
        <i class="fa-solid fa-circle-check" style="color: var(--accent);"></i>
        <span>${f}</span>
      </li>
    `).join('');
  }

  const bookBtn = document.getElementById('btnDetailsBookNow');
  if (bookBtn) {
    bookBtn.setAttribute('data-car-id', car.id);
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/* ==========================================================================
   Quick Booking Form in Hero
   ========================================================================== */
function initQuickBookingForm() {
  const form = document.getElementById('quickBookingForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const carCategory = form.quickCarType.value;
    const pickupDate = form.quickPickDate.value;
    const returnDate = form.quickReturnDate.value;

    let targetCar = CARS_DATA[0];
    if (carCategory && carCategory !== 'all') {
      const found = CARS_DATA.find(c => c.category === carCategory);
      if (found) targetCar = found;
    }

    openBookingModal(targetCar.id, { pickup: pickupDate, return: returnDate });
  });
}

// Make functions globally available for inline onclick attributes
window.openBookingModal = openBookingModal;
window.openCarDetailsModal = openCarDetailsModal;
window.closeBookingModal = closeBookingModal;
window.showToast = showToast;
