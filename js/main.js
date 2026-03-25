/* ==========================================================================
   AURELIA — Main JavaScript
   v2 design: bottom nav, scroll reveal, locale toggle, forms, allergen modal
   ========================================================================== */

(function () {
  'use strict';

  // -----------------------------------------------------------------------
  // Scroll reveal
  // -----------------------------------------------------------------------
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }

  // -----------------------------------------------------------------------
  // Locale toggle (US / UK)
  // -----------------------------------------------------------------------
  const localeBtns = document.querySelectorAll('.locale-btn');
  let currentLocale = localStorage.getItem('aurelia-locale') || 'us';

  function applyLocale(locale) {
    currentLocale = locale;
    localStorage.setItem('aurelia-locale', locale);
    const sym = locale === 'uk' ? '£' : '$';

    // Locale buttons active state
    localeBtns.forEach(btn => {
      const isActive = btn.dataset.locale === locale;
      btn.classList.toggle('text-secondary', isActive);
      btn.classList.toggle('font-bold', isActive);
    });

    // Prices: data-price-us / data-price-uk
    document.querySelectorAll('[data-price-us]').forEach(el => {
      const val = locale === 'uk' ? el.dataset.priceUk : el.dataset.priceUs;
      if (val) el.textContent = sym + val;
    });

    // Localized text spans: data-us / data-uk
    document.querySelectorAll('[data-us]').forEach(el => {
      el.textContent = locale === 'uk' ? (el.dataset.uk || '') : (el.dataset.us || '');
    });

    // Section headings: data-heading-us / data-heading-uk
    document.querySelectorAll('[data-heading-us]').forEach(el => {
      el.textContent = locale === 'uk' ? (el.dataset.headingUk || '') : (el.dataset.headingUs || '');
    });

    // Service charge / gratuity notes
    document.querySelectorAll('.service-charge-uk').forEach(el => el.classList.toggle('hidden', locale !== 'uk'));
    document.querySelectorAll('.gratuity-us').forEach(el => el.classList.toggle('hidden', locale !== 'us'));

    // Budget selects on private dining form
    document.querySelectorAll('.locale-budget-us').forEach(el => el.classList.toggle('hidden', locale !== 'us'));
    document.querySelectorAll('.locale-budget-uk').forEach(el => el.classList.toggle('hidden', locale !== 'uk'));
  }

  localeBtns.forEach(btn => {
    btn.addEventListener('click', () => applyLocale(btn.dataset.locale));
  });

  // Apply saved locale on page load
  applyLocale(currentLocale);

  // -----------------------------------------------------------------------
  // Menu tabs
  // -----------------------------------------------------------------------
  const menuTabBtns = document.querySelectorAll('.menu-tab-btn');
  const menuTabPanels = document.querySelectorAll('.menu-tab-panel');

  menuTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      // Update button states
      menuTabBtns.forEach(b => {
        b.classList.remove('text-secondary', 'border-secondary');
        b.classList.add('text-stone-400', 'border-transparent');
      });
      btn.classList.add('text-secondary', 'border-secondary');
      btn.classList.remove('text-stone-400', 'border-transparent');

      // Show correct panel
      menuTabPanels.forEach(panel => {
        if (panel.id === target) {
          panel.classList.remove('hidden');
          panel.style.animation = 'none';
          panel.offsetHeight; // reflow
          panel.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          panel.classList.add('hidden');
        }
      });
    });
  });

  // -----------------------------------------------------------------------
  // Dietary filters (menu page)
  // -----------------------------------------------------------------------
  const dietFilterBtns = document.querySelectorAll('.diet-filter-btn');
  const menuItemRows = document.querySelectorAll('.menu-item-row');
  const activeFilters = new Set();

  dietFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      if (activeFilters.has(filter)) {
        activeFilters.delete(filter);
        btn.classList.remove('border-secondary', 'text-secondary');
        btn.classList.add('border-stone-300', 'text-stone-400');
      } else {
        activeFilters.add(filter);
        btn.classList.add('border-secondary', 'text-secondary');
        btn.classList.remove('border-stone-300', 'text-stone-400');
      }

      menuItemRows.forEach(row => {
        if (activeFilters.size === 0) {
          row.classList.remove('opacity-30');
        } else {
          const tags = (row.dataset.dietary || '').split(',').map(s => s.trim());
          const matches = [...activeFilters].some(f => tags.includes(f));
          row.classList.toggle('opacity-30', !matches);
        }
      });
    });
  });

  // -----------------------------------------------------------------------
  // Allergen modal
  // -----------------------------------------------------------------------
  const allergenModal = document.getElementById('allergen-modal');

  document.addEventListener('click', e => {
    // Open
    const triggerBtn = e.target.closest('.allergen-info-btn');
    if (triggerBtn && allergenModal) {
      const dishName = triggerBtn.dataset.dish || '';
      const allergens = (triggerBtn.dataset.allergens || '').split(',').map(s => s.trim()).filter(Boolean);

      const titleEl = allergenModal.querySelector('.modal-dish-name');
      const listEl = allergenModal.querySelector('.modal-allergen-list');
      if (titleEl) titleEl.textContent = dishName;
      if (listEl) {
        listEl.innerHTML = allergens.length
          ? allergens.map(a => `<li class="py-2 border-b border-stone-100 last:border-0 text-sm text-on-surface">${a}</li>`).join('')
          : '<li class="py-2 text-sm text-stone-400">No major allergens declared.</li>';
      }

      allergenModal.classList.remove('hidden');
      allergenModal.classList.add('flex');
      document.body.style.overflow = 'hidden';
    }

    // Close via button or backdrop
    if (e.target.closest('.modal-close') || e.target === allergenModal) {
      closeAllergenModal();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && allergenModal && allergenModal.classList.contains('flex')) {
      closeAllergenModal();
    }
  });

  function closeAllergenModal() {
    if (!allergenModal) return;
    allergenModal.classList.add('hidden');
    allergenModal.classList.remove('flex');
    document.body.style.overflow = '';
  }

  // -----------------------------------------------------------------------
  // Gallery filters
  // -----------------------------------------------------------------------
  const galleryFilterBtns = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  galleryFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      galleryFilterBtns.forEach(b => {
        b.classList.remove('text-secondary', 'border-secondary');
        b.classList.add('text-stone-400', 'border-transparent');
      });
      btn.classList.add('text-secondary', 'border-secondary');
      btn.classList.remove('text-stone-400', 'border-transparent');

      const filter = btn.dataset.filter;
      galleryItems.forEach(item => {
        const show = filter === 'all' || item.dataset.category === filter;
        item.style.display = show ? 'block' : 'none';
      });
    });
  });

})();
