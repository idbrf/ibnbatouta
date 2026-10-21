/**
 * وكالة كراء السيارات ابن بطوطة - Cars Management & Filtering
 */

document.addEventListener('DOMContentLoaded', () => {
  // If on homepage, render featured / offer cars
  const featuredContainer = document.getElementById('featuredCarsGrid');
  if (featuredContainer) {
    renderFeaturedCars(featuredContainer);
  }

  // If on cars.html, init complete catalog & filter listeners
  const catalogContainer = document.getElementById('allCarsGrid');
  if (catalogContainer) {
    initCarsCatalog(catalogContainer);
  }
});

/* ==========================================================================
   Render Featured / Offer Cars (Home Page)
   ========================================================================== */
function renderFeaturedCars(container) {
  // Cars that are either featured or have an active offer or are new
  const carsToShow = CARS_DATA.filter(car => car.isFeatured || car.isOffer).slice(0, 6);
  container.innerHTML = carsToShow.map(car => createCarCardHTML(car)).join('');
}

/* ==========================================================================
   Cars Catalog with Live Search & Filtering (Cars Page)
   ========================================================================== */
function initCarsCatalog(container) {
  const searchInput = document.getElementById('searchCarInput');
  const brandSelect = document.getElementById('filterBrand');
  const categorySelect = document.getElementById('filterCategory');
  const transmissionSelect = document.getElementById('filterTransmission');
  const sortSelect = document.getElementById('sortPrice');
  const countBadge = document.getElementById('carsCountBadge');
  const categoryPills = document.querySelectorAll('.filter-pill');

  let currentCategory = 'all';

  function applyFilters() {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const selectedBrand = brandSelect ? brandSelect.value : 'all';
    const selectedCat = categorySelect ? categorySelect.value : currentCategory;
    const selectedTrans = transmissionSelect ? transmissionSelect.value : 'all';
    const sortBy = sortSelect ? sortSelect.value : 'default';

    let filtered = CARS_DATA.filter(car => {
      // Search match
      const matchQuery = !query || 
        car.name.toLowerCase().includes(query) || 
        car.modelName.toLowerCase().includes(query) ||
        car.brand.toLowerCase().includes(query);

      // Brand match
      const matchBrand = selectedBrand === 'all' || car.brand.toLowerCase() === selectedBrand.toLowerCase();

      // Category match
      const matchCategory = selectedCat === 'all' || car.category === selectedCat;

      // Transmission match
      const matchTrans = selectedTrans === 'all' || car.transmission === selectedTrans;

      return matchQuery && matchBrand && matchCategory && matchTrans;
    });

    // Sort
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    // Update count
    if (countBadge) {
      countBadge.textContent = `${filtered.length} سيارة متوفرة`;
    }

    // Render cards
    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #fff; border-radius: 16px; border: 1px solid #e2e8f0;">
          <i class="fa-solid fa-car-tunnel" style="font-size: 3rem; color: var(--gray-400); margin-bottom: 16px;"></i>
          <h3 style="font-size: 1.4rem; color: var(--primary); margin-bottom: 8px;">لم نجد أي سيارة مطابقة لبحثك</h3>
          <p style="color: var(--gray-500); margin-bottom: 20px;">جرّب تغيير معايير البحث أو تصفير الفلاتر للاطلاع على باقي الأسطول.</p>
          <button class="btn btn-primary" onclick="resetAllFilters()">
            <i class="fa-solid fa-rotate-left"></i> عرض جميع السيارات
          </button>
        </div>
      `;
    } else {
      container.innerHTML = filtered.map(car => createCarCardHTML(car)).join('');
    }
  }

  // Category Pills Click
  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.getAttribute('data-category') || 'all';
      if (categorySelect) categorySelect.value = currentCategory;
      applyFilters();
    });
  });

  // Event listeners
  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (brandSelect) brandSelect.addEventListener('change', applyFilters);
  if (categorySelect) {
    categorySelect.addEventListener('change', () => {
      currentCategory = categorySelect.value;
      categoryPills.forEach(p => {
        if (p.getAttribute('data-category') === currentCategory) {
          p.classList.add('active');
        } else {
          p.classList.remove('active');
        }
      });
      applyFilters();
    });
  }
  if (transmissionSelect) transmissionSelect.addEventListener('change', applyFilters);
  if (sortSelect) sortSelect.addEventListener('change', applyFilters);

  window.resetAllFilters = function() {
    if (searchInput) searchInput.value = '';
    if (brandSelect) brandSelect.value = 'all';
    if (categorySelect) categorySelect.value = 'all';
    if (transmissionSelect) transmissionSelect.value = 'all';
    if (sortSelect) sortSelect.value = 'default';
    currentCategory = 'all';
    categoryPills.forEach(p => {
      if (p.getAttribute('data-category') === 'all') p.classList.add('active');
      else p.classList.remove('active');
    });
    applyFilters();
  };

  // Initial render
  applyFilters();
}

/* ==========================================================================
   Create Car Card HTML
   ========================================================================== */
function createCarCardHTML(car) {
  // Badges logic
  let badgesHTML = '';
  if (car.isOffer && car.discountText) {
    badgesHTML += `<span class="badge badge-offer"><i class="fa-solid fa-tag"></i> ${car.discountText}</span>`;
  }
  if (car.isNew) {
    badgesHTML += `<span class="badge badge-new"><i class="fa-solid fa-sparkles"></i> جديد</span>`;
  }

  return `
    <article class="car-card" data-id="${car.id}">
      <div class="car-media">
        <img src="${car.image}" alt="${car.name}" loading="lazy" />
        <div class="car-badges">
          ${badgesHTML}
        </div>
        <div class="car-brand-tag">
          ${car.brand} • ${car.year}
        </div>
      </div>

      <div class="car-body">
        <div class="car-category">
          <i class="fa-solid fa-shapes"></i> ${car.categoryName}
        </div>
        <h3 class="car-title">${car.name}</h3>
        <div class="car-model-name">${car.modelName}</div>

        <!-- Spec Pills -->
        <div class="car-specs">
          <div class="car-spec-item" title="ناقل الحركة">
            <i class="fa-solid fa-gears"></i>
            <span>${car.transmissionName}</span>
          </div>
          <div class="car-spec-item" title="نوع الوقود">
            <i class="fa-solid fa-gas-pump"></i>
            <span>${car.fuel === 'diesel' ? 'ديزل' : 'بنزين'}</span>
          </div>
          <div class="car-spec-item" title="عدد الركاب">
            <i class="fa-solid fa-user-group"></i>
            <span>${car.passengers} مقاعد</span>
          </div>
          <div class="car-spec-item" title="سعة الأمتعة">
            <i class="fa-solid fa-suitcase"></i>
            <span>${car.luggage} حقائب</span>
          </div>
        </div>

        <!-- Footer / Price / Actions -->
        <div class="car-footer">
          <div class="car-price-box">
            ${car.oldPrice ? `<span class="car-old-price">${car.oldPrice} درهم</span>` : ''}
            <div class="car-price">${car.price} <span>درهم / يوم</span></div>
          </div>
          <div class="car-actions">
            <button class="btn btn-outline btn-sm" onclick="openCarDetailsModal('${car.id}')" title="تفاصيل أكثر">
              <i class="fa-solid fa-circle-info"></i> التفاصيل
            </button>
            <button class="btn btn-accent btn-sm" onclick="openBookingModal('${car.id}')" title="احجز هذه السيارة">
              <i class="fa-solid fa-calendar-check"></i> احجز الآن
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}
