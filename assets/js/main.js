// ============================================================
// LeafTable â€” Main JavaScript
// Version: 1.0.0 | Â© 2026 LeafTable
// ============================================================

'use strict';

// ============================================================
// 1. THEME (Dark/Light) TOGGLE
// ============================================================

const initTheme = () => {
  const saved = localStorage.getItem('leaftable-theme') || 'light';
  document.documentElement.setAttribute('data-bs-theme', saved);
  document.body.classList.toggle('dark-mode', saved === 'dark');
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.innerHTML = saved === 'dark' ? '<i class="bi bi-moon-stars-fill"></i>' : '<i class="bi bi-sun-fill"></i>';
};

const toggleTheme = () => {
  const current = document.documentElement.getAttribute('data-bs-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem('leaftable-theme', next);
  document.documentElement.setAttribute('data-bs-theme', next);
  document.body.classList.toggle('dark-mode', next === 'dark');
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.innerHTML = next === 'dark' ? '<i class="bi bi-moon-stars-fill"></i>' : '<i class="bi bi-sun-fill"></i>';
};

// ============================================================
// 2. RTL TOGGLE
// ============================================================

const initRTL = () => {
  const saved = localStorage.getItem('leaftable-dir') || 'ltr';
  document.documentElement.setAttribute('dir', saved);
  document.documentElement.setAttribute('lang', saved === 'rtl' ? 'ar' : 'en');
  const btn = document.getElementById('rtl-toggle');
  if (btn) {
    btn.setAttribute('aria-pressed', saved === 'rtl' ? 'true' : 'false');
    btn.title = saved === 'rtl' ? 'Switch to LTR' : 'Switch to RTL';
  }
};

const toggleRTL = () => {
  const current = document.documentElement.getAttribute('dir') || 'ltr';
  const next = current === 'rtl' ? 'ltr' : 'rtl';
  localStorage.setItem('leaftable-dir', next);
  document.documentElement.setAttribute('dir', next);
  document.documentElement.setAttribute('lang', next === 'rtl' ? 'ar' : 'en');
  const btn = document.getElementById('rtl-toggle');
  if (btn) {
    btn.setAttribute('aria-pressed', next === 'rtl' ? 'true' : 'false');
    btn.title = next === 'rtl' ? 'Switch to LTR' : 'Switch to RTL';
  }
};

// ============================================================
// 3. STICKY NAVBAR
// ============================================================

const initStickyNavbar = () => {
  const navbar = document.querySelector('.navbar-vegan');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  // Run once on load to set correct state
  handleScroll();
};

// ============================================================
// 4. MOBILE NAV AUTO-CLOSE
// ============================================================

const initMobileNavClose = () => {
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  const navbarCollapse = document.getElementById('navbarNav') ||
                         document.querySelector('.navbar-collapse');

  if (!navbarCollapse) return;

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const isExpanded = navbarCollapse.classList.contains('show');
      if (isExpanded) {
        const bsCollapse = window.bootstrap
          ? new bootstrap.Collapse(navbarCollapse, { toggle: false })
          : null;
        if (bsCollapse) {
          bsCollapse.hide();
        } else {
          navbarCollapse.classList.remove('show');
        }
      }
    });
  });
};

// ============================================================
// 5. SCROLL TO TOP
// ============================================================

const initScrollToTop = () => {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;

  const handleScroll = () => {
    if (window.scrollY > 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  handleScroll();
};

// ============================================================
// 6. AOS INIT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      once: true,
      offset: 80,
      easing: 'ease-out-cubic'
    });
  }
});

// ============================================================
// 7. COUNTER ANIMATION
// ============================================================

const easeOutQuad = (t) => t * (2 - t);

const animateCounter = (el) => {
  const target = parseFloat(el.getAttribute('data-counter')) || 0;
  const duration = 2000;
  const decimals = el.getAttribute('data-decimals') ? parseInt(el.getAttribute('data-decimals')) : 0;
  const prefix = el.getAttribute('data-prefix') || '';
  const suffix = el.getAttribute('data-suffix') || '';
  let startTime = null;

  const step = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutQuad(progress);
    const current = eased * target;
    el.textContent = prefix + current.toFixed(decimals) + suffix;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = prefix + target.toFixed(decimals) + suffix;
    }
  };

  requestAnimationFrame(step);
};

const initCounters = () => {
  const counterEls = document.querySelectorAll('[data-counter]');
  if (!counterEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  counterEls.forEach(el => observer.observe(el));
};

// ============================================================
// 8. FORM VALIDATION HELPERS
// ============================================================

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const validateRequired = (val) => val.trim().length > 0;

const validateMinLength = (val, min) => val.trim().length >= min;

const showFieldError = (fieldId, message) => {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.add('is-invalid');
  field.classList.remove('is-valid');

  // Try explicit error element first
  let errorEl = document.getElementById('err-' + fieldId);
  if (!errorEl) {
    // Fall back to sibling .invalid-feedback
    errorEl = field.parentElement
      ? field.parentElement.querySelector('.invalid-feedback')
      : null;
  }
  if (!errorEl) {
    // Create one dynamically
    errorEl = document.createElement('div');
    errorEl.classList.add('invalid-feedback');
    errorEl.id = 'err-' + fieldId;
    field.parentElement.appendChild(errorEl);
  }
  errorEl.textContent = message;
};

const clearFieldError = (fieldId) => {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.remove('is-invalid');
  field.classList.add('is-valid');

  let errorEl = document.getElementById('err-' + fieldId);
  if (!errorEl) {
    errorEl = field.parentElement
      ? field.parentElement.querySelector('.invalid-feedback')
      : null;
  }
  if (errorEl) errorEl.textContent = '';
};

const resetFieldState = (fieldId) => {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.remove('is-invalid', 'is-valid');
  let errorEl = document.getElementById('err-' + fieldId);
  if (!errorEl) {
    errorEl = field.parentElement
      ? field.parentElement.querySelector('.invalid-feedback')
      : null;
  }
  if (errorEl) errorEl.textContent = '';
};

const validateForm = (formEl) => {
  if (!formEl) return false;
  let isValid = true;
  const requiredFields = formEl.querySelectorAll('[required]');

  requiredFields.forEach(field => {
    const fieldId = field.id;
    const value = field.value || '';
    const type = field.type || 'text';

    if (!validateRequired(value)) {
      showFieldError(fieldId, 'This field is required.');
      isValid = false;
      return;
    }

    if (type === 'email' && !validateEmail(value)) {
      showFieldError(fieldId, 'Please enter a valid email address.');
      isValid = false;
      return;
    }

    const minLen = field.getAttribute('data-min-length');
    if (minLen && !validateMinLength(value, parseInt(minLen))) {
      showFieldError(fieldId, `Please enter at least ${minLen} characters.`);
      isValid = false;
      return;
    }

    clearFieldError(fieldId);
  });

  return isValid;
};

// ============================================================
// 9. RESERVATION FORM HANDLER
// ============================================================

const generateBookingRef = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'LT-';
  for (let i = 0; i < 8; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
};

const initReservationForm = () => {
  const form = document.getElementById('res-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate all fields
    const fieldsValid = validateForm(form);
    if (!fieldsValid) return;

    // Additional custom validations
    const nameEl = document.getElementById('res-name');
    const emailEl = document.getElementById('res-email');
    const dateEl = document.getElementById('res-date');
    const timeEl = document.getElementById('res-time');
    const guestsEl = document.getElementById('res-guests');

    let customValid = true;

    if (nameEl && !validateRequired(nameEl.value)) {
      showFieldError('res-name', 'Please enter your full name.');
      customValid = false;
    }

    if (emailEl && !validateEmail(emailEl.value)) {
      showFieldError('res-email', 'Please enter a valid email address.');
      customValid = false;
    }

    if (dateEl) {
      const selectedDate = new Date(dateEl.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (!dateEl.value || selectedDate < today) {
        showFieldError('res-date', 'Please select a future date.');
        customValid = false;
      }
    }

    if (!customValid) return;

    // Show loading state
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-leaf me-2"></span> Bookingâ€¦';
    }

    setTimeout(() => {
      const bookingRef = generateBookingRef();
      const guestName = nameEl ? nameEl.value.trim().split(' ')[0] : 'Guest';
      const dateStr = dateEl ? new Date(dateEl.value).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';
      const timeStr = timeEl ? timeEl.value : '';
      const guestCount = guestsEl ? guestsEl.value : '2';

      // Success message
      const successEl = document.getElementById('res-success') || (() => {
        const div = document.createElement('div');
        div.id = 'res-success';
        form.parentElement.insertBefore(div, form.nextSibling);
        return div;
      })();

      successEl.innerHTML = `
        <div class="alert alert-success border-0 rounded-3 p-4 mt-4" role="alert">
          <h5 class="mb-2"><i class="bi bi-tree-fill"></i> Reservation Confirmed, ${guestName}!</h5>
          <p class="mb-1">We've reserved a table for <strong>${guestCount} guest${guestCount > 1 ? 's' : ''}</strong> on <strong>${dateStr}</strong> at <strong>${timeStr}</strong>.</p>
          <p class="mb-0 text-muted small">Your booking reference: <strong class="text-success">${bookingRef}</strong>. A confirmation email is on its way!</p>
        </div>
      `;

      form.reset();
      form.querySelectorAll('.is-valid, .is-invalid').forEach(el => el.classList.remove('is-valid', 'is-invalid'));

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }

      successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 1500);
  });

  // Live validation on input
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur', () => {
      if (field.id) {
        const value = field.value || '';
        if (field.hasAttribute('required') && !validateRequired(value)) {
          showFieldError(field.id, 'This field is required.');
        } else if (field.type === 'email' && value && !validateEmail(value)) {
          showFieldError(field.id, 'Please enter a valid email address.');
        } else {
          clearFieldError(field.id);
        }
      }
    });
  });
};

// ============================================================
// 10. NEWSLETTER HANDLER
// ============================================================

const showToast = (message, title = 'LeafTable', variant = 'success') => {
  // Create toast container if missing
  let toastContainer = document.getElementById('lt-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'lt-toast-container';
    toastContainer.style.cssText = 'position:fixed;top:20px;right:20px;z-index:11000;';
    document.body.appendChild(toastContainer);
  }

  const toastEl = document.createElement('div');
  toastEl.className = 'toast toast-vegan align-items-center show';
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'polite');
  toastEl.style.cssText = 'min-width:280px;margin-bottom:8px;';

  toastEl.innerHTML = `
    <div class="toast-header">
      <strong class="me-auto">${title}</strong>
      <button type="button" class="btn-close btn-close-white ms-2" aria-label="Close"></button>
    </div>
    <div class="toast-body">${message}</div>
  `;

  toastContainer.appendChild(toastEl);

  const closeBtn = toastEl.querySelector('.btn-close');
  if (closeBtn) closeBtn.addEventListener('click', () => toastEl.remove());

  setTimeout(() => {
    toastEl.style.transition = 'opacity 0.4s ease';
    toastEl.style.opacity = '0';
    setTimeout(() => toastEl.remove(), 400);
  }, 4000);
};

const initNewsletterForms = () => {
  const forms = document.querySelectorAll('.newsletter-form');
  if (!forms.length) return;

  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      if (!emailInput) return;

      const email = emailInput.value.trim();

      if (!validateEmail(email)) {
        emailInput.classList.add('is-invalid');
        const errEl = form.querySelector('.invalid-feedback') || (() => {
          const div = document.createElement('div');
          div.className = 'invalid-feedback';
          emailInput.parentElement.appendChild(div);
          return div;
        })();
        errEl.textContent = 'Please enter a valid email address.';
        return;
      }

      emailInput.classList.remove('is-invalid');
      emailInput.classList.add('is-valid');

      const btn = form.querySelector('[type="submit"]');
      const origText = btn ? btn.innerHTML : '';
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Subscribingâ€¦';
      }

      setTimeout(() => {
        showToast('<i class="bi bi-tree-fill"></i> You\'re on the list! Welcome to the LeafTable family.', '<i class="bi bi-tree-fill"></i> Newsletter');
        form.reset();
        emailInput.classList.remove('is-valid');
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = origText;
        }
      }, 800);
    });
  });
};

// ============================================================
// 11. COMMENT FORM HANDLER
// ============================================================

const initCommentForm = () => {
  const form = document.getElementById('comment-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameEl = document.getElementById('comment-name');
    const emailEl = document.getElementById('comment-email');
    const commentEl = document.getElementById('comment-body');

    let isValid = true;

    if (!nameEl || !validateRequired(nameEl.value)) {
      showFieldError('comment-name', 'Please enter your name.');
      isValid = false;
    } else {
      clearFieldError('comment-name');
    }

    if (!emailEl || !validateEmail(emailEl.value)) {
      showFieldError('comment-email', 'Please enter a valid email address.');
      isValid = false;
    } else {
      clearFieldError('comment-email');
    }

    if (!commentEl || !validateMinLength(commentEl.value, 20)) {
      showFieldError('comment-body', 'Comment must be at least 20 characters long.');
      isValid = false;
    } else {
      clearFieldError('comment-body');
    }

    if (!isValid) return;

    // Show success alert
    const existingAlert = form.parentElement.querySelector('.comment-success-alert');
    if (existingAlert) existingAlert.remove();

    const alertEl = document.createElement('div');
    alertEl.className = 'alert alert-success border-0 rounded-3 p-4 mt-4 comment-success-alert';
    alertEl.role = 'alert';
    alertEl.innerHTML = `
      <strong><i class="bi bi-tree-fill"></i> Thank you, ${nameEl.value.trim().split(' ')[0]}!</strong>
      <p class="mb-0 mt-1">Your comment has been submitted and is pending review. We appreciate your feedback!</p>
    `;

    form.parentElement.insertBefore(alertEl, form.nextSibling);
    form.reset();
    form.querySelectorAll('.is-valid, .is-invalid').forEach(el => el.classList.remove('is-valid', 'is-invalid'));
    alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Auto-dismiss alert
    setTimeout(() => {
      alertEl.style.transition = 'opacity 0.5s ease';
      alertEl.style.opacity = '0';
      setTimeout(() => alertEl.remove(), 500);
    }, 6000);
  });
};

// ============================================================
// 12. CHAR COUNTER
// ============================================================

const attachCharCounter = (textareaId, counterId, max) => {
  const textarea = document.getElementById(textareaId);
  const counter = document.getElementById(counterId);
  if (!textarea || !counter) return;

  const update = () => {
    const len = textarea.value.length;
    const remaining = max - len;
    counter.textContent = `${len} / ${max}`;

    if (remaining < 20) {
      counter.classList.add('warning');
    } else {
      counter.classList.remove('warning');
    }

    if (len > max) {
      textarea.classList.add('is-invalid');
      counter.style.color = '#dc3545';
    } else {
      textarea.classList.remove('is-invalid');
      counter.style.color = '';
    }
  };

  textarea.addEventListener('input', update);
  update();
};

// ============================================================
// 13. PASSWORD STRENGTH METER
// ============================================================

const initPasswordStrength = () => {
  const passwordInput = document.getElementById('password');
  if (!passwordInput) return;

  const strengthBar = document.getElementById('strength-bar');
  const strengthText = document.getElementById('strength-text');

  const scorePassword = (password) => {
    let score = 0;
    if (!password) return { score: 0, label: '', color: '' };

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
      { label: '', color: '', width: '0%' },
      { label: 'Very Weak', color: '#dc3545', width: '20%' },
      { label: 'Weak', color: '#fd7e14', width: '40%' },
      { label: 'Fair', color: '#ffc107', width: '60%' },
      { label: 'Strong', color: '#7A9E5A', width: '80%' },
      { label: 'Very Strong', color: '#2D5016', width: '100%' }
    ];

    return { score, ...levels[Math.min(score, 5)] };
  };

  passwordInput.addEventListener('input', () => {
    const pwd = passwordInput.value;
    const result = scorePassword(pwd);

    if (strengthBar) {
      strengthBar.style.width = result.width;
      strengthBar.style.backgroundColor = result.color;
    }

    if (strengthText) {
      strengthText.textContent = result.label;
      strengthText.style.color = result.color;
    }
  });
};

// ============================================================
// 14. LOGIN/REGISTER PANEL TOGGLE
// ============================================================

const showPanel = (panel) => {
  const panels = ['login-panel', 'register-panel', 'forgot-panel'];

  panels.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.opacity = '0';
      setTimeout(() => {
        el.classList.add('d-none');
        el.style.opacity = '';
      }, 300);
    }
  });

  setTimeout(() => {
    const target = document.getElementById(panel + '-panel');
    if (target) {
      target.classList.remove('d-none');
      target.style.opacity = '0';
      setTimeout(() => {
        target.style.transition = 'opacity 0.3s ease';
        target.style.opacity = '1';
      }, 10);
    }
  }, 350);
};

const initPanelToggle = () => {
  document.querySelectorAll('[data-panel]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      showPanel(el.dataset.panel);
    });
  });
};

// ============================================================
// 15. COUNTDOWN TIMER
// ============================================================

const initCountdown = () => {
  const daysEl = document.getElementById('countdown-days');
  const hoursEl = document.getElementById('countdown-hours');
  const minsEl = document.getElementById('countdown-mins');
  const secsEl = document.getElementById('countdown-secs');

  if (!daysEl && !hoursEl && !minsEl && !secsEl) return;

  const targetDate = new Date('2026-12-15T00:00:00').getTime();

  const pad = (n) => String(Math.floor(n)).padStart(2, '0');

  const updateDigit = (el, newValue) => {
    if (!el) return;
    if (el.textContent !== newValue) {
      el.classList.add('flip-anim');
      setTimeout(() => {
        el.textContent = newValue;
        el.classList.remove('flip-anim');
      }, 150);
    }
  };

  const updateCountdown = () => {
    const now = Date.now();
    const diff = targetDate - now;

    if (diff <= 0) {
      updateDigit(daysEl, '00');
      updateDigit(hoursEl, '00');
      updateDigit(minsEl, '00');
      updateDigit(secsEl, '00');
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    updateDigit(daysEl, pad(days));
    updateDigit(hoursEl, pad(hours));
    updateDigit(minsEl, pad(mins));
    updateDigit(secsEl, pad(secs));
  };

  updateCountdown();
  setInterval(updateCountdown, 1000);
};

// ============================================================
// 16. COOKIE CONSENT
// ============================================================

const initCookieConsent = () => {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;

  const consent = localStorage.getItem('lt-cookie-consent');

  if (!consent) {
    // Show banner after short delay for UX
    setTimeout(() => {
      banner.classList.add('show');
    }, 1200);
  }

  const acceptBtn = document.getElementById('cookie-accept');
  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('lt-cookie-consent', 'accepted');
      banner.classList.remove('show');
      banner.style.transition = 'transform 0.4s ease';
      // Fire any analytics consent events here
    });
  }

  const declineBtn = document.getElementById('cookie-decline');
  if (declineBtn) {
    declineBtn.addEventListener('click', () => {
      localStorage.setItem('lt-cookie-consent', 'declined');
      banner.classList.remove('show');
    });
  }
};

// ============================================================
// 17. IMAGE LAZY LOAD
// ============================================================

const initLazyLoad = () => {
  const lazyImages = document.querySelectorAll('img[data-src]');
  if (!lazyImages.length) return;

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.getAttribute('data-src');
            if (src) {
              img.src = src;
              img.addEventListener('load', () => {
                img.classList.add('img-loaded');
                img.removeAttribute('data-src');
              });
              img.addEventListener('error', () => {
                img.classList.add('img-error');
              });
            }
            imageObserver.unobserve(img);
          }
        });
      },
      { rootMargin: '100px 0px', threshold: 0.01 }
    );

    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for older browsers
    lazyImages.forEach(img => {
      const src = img.getAttribute('data-src');
      if (src) {
        img.src = src;
        img.classList.add('img-loaded');
      }
    });
  }
};

// ============================================================
// 18. COPY LINK
// ============================================================

const initCopyLink = () => {
  const copyBtn = document.getElementById('copy-link-btn');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', () => {
    const url = window.location.href;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        showCopiedFeedback(copyBtn);
      }).catch(() => {
        fallbackCopy(url, copyBtn);
      });
    } else {
      fallbackCopy(url, copyBtn);
    }
  });
};

const fallbackCopy = (text, btn) => {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showCopiedFeedback(btn);
  } catch (err) {
    console.warn('Copy failed:', err);
  }
  document.body.removeChild(textArea);
};

const showCopiedFeedback = (btn) => {
  const original = btn.innerHTML;
  btn.innerHTML = '<i class="bi bi-check2 me-1"></i> Copied!';
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = original;
    btn.disabled = false;
  }, 2000);
};

// ============================================================
// 19. NAVBAR ACTIVE LINK
// ============================================================

const initNavActiveLink = () => {
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  if (!navLinks.length) return;

  // Get current page filename (e.g., "about.html", "menu.html")
  const pathParts = window.location.pathname.split('/');
  const currentPage = pathParts[pathParts.length - 1] || 'index.html';

  navLinks.forEach(link => {
    const href = link.getAttribute('href') || '';
    const hrefParts = href.split('/');
    const linkPage = hrefParts[hrefParts.length - 1];

    // Remove pre-existing active class
    link.classList.remove('active');
    link.removeAttribute('aria-current');

    if (
      linkPage === currentPage ||
      (currentPage === '' && (linkPage === 'index.html' || linkPage === '/')) ||
      (currentPage === 'index.html' && linkPage === '/')
    ) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
};

// ============================================================
// 20. SHOW PASSWORD TOGGLE
// ============================================================

const initPasswordToggles = () => {
  const toggleBtns = document.querySelectorAll('.toggle-password');

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target') || btn.getAttribute('aria-controls');
      const input = targetId
        ? document.getElementById(targetId)
        : btn.closest('.password-wrapper')
          ? btn.closest('.password-wrapper').querySelector('input')
          : null;

      if (!input) return;

      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';

      const icon = btn.querySelector('i');
      if (icon) {
        if (isPassword) {
          icon.classList.remove('bi-eye-fill', 'bi-eye');
          icon.classList.add('bi-eye-slash-fill');
        } else {
          icon.classList.remove('bi-eye-slash-fill', 'bi-eye-slash');
          icon.classList.add('bi-eye-fill');
        }
      }

      btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    });
  });
};

// ============================================================
// UTILITY: GENERATE FLOATING LEAVES
// ============================================================

const generateFloatingLeaves = (containerId, count = 8) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  const leaves = ['bi-tree', 'bi-tree-fill', 'bi-flower1', 'bi-flower2'];

  for (let i = 0; i < count; i++) {
    const leaf = document.createElement('span');
    leaf.className = 'floating-leaf';
    leaf.innerHTML = '<i class="bi ' + leaves[Math.floor(Math.random() * leaves.length)] + '"></i>';
    leaf.style.left = Math.random() * 100 + '%';
    leaf.style.animationDuration = (Math.random() * 10 + 8) + 's';
    leaf.style.animationDelay = (Math.random() * 8) + 's';
    leaf.style.fontSize = (Math.random() * 1 + 1) + 'rem';
    leaf.style.opacity = (Math.random() * 0.4 + 0.3).toString();
    container.appendChild(leaf);
  }
};

// ============================================================
// UTILITY: SMOOTH SECTION SCROLL FOR ANCHOR LINKS
// ============================================================

const initAnchorScrolling = () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();
      const navbarHeight = document.querySelector('.navbar-vegan')
        ? document.querySelector('.navbar-vegan').offsetHeight
        : 80;

      const targetY = targetEl.getBoundingClientRect().top + window.scrollY - navbarHeight - 16;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });
};

// ============================================================
// UTILITY: DEBOUNCE
// ============================================================

const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// ============================================================
// UTILITY: THROTTLE
// ============================================================

const throttle = (fn, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
};

// ============================================================
// UTILITY: FORMAT DATE
// ============================================================

const formatDate = (dateStr, locale = 'en-US') => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// ============================================================
// UTILITY: OBSERVE REVEAL ELEMENTS
// ============================================================

const initRevealObserver = () => {
  const revealEls = document.querySelectorAll('.reveal-image');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  revealEls.forEach(el => observer.observe(el));
};

// ============================================================
// UTILITY: MENU ITEM FILTER
// ============================================================

const initMenuFilter = () => {
  const filterBtns = document.querySelectorAll('.pill-filter');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-filter');
      const items = document.querySelectorAll('[data-category]');

      items.forEach(item => {
        if (category === 'all' || item.getAttribute('data-category') === category) {
          item.style.display = '';
          item.style.opacity = '0';
          item.style.transform = 'translateY(16px)';
          setTimeout(() => {
            item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, 50);
        } else {
          item.style.transition = 'opacity 0.3s ease';
          item.style.opacity = '0';
          setTimeout(() => { item.style.display = 'none'; }, 300);
        }
      });
    });
  });
};

// ============================================================
// BOOT â€” DOMContentLoaded
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Core features
  initTheme();
  initRTL();
  initStickyNavbar();
  initMobileNavClose();
  initScrollToTop();
  initCounters();

  // Forms
  initReservationForm();
  initNewsletterForms();
  initCommentForm();
  initPasswordStrength();

  // UI
  initPanelToggle();
  initCountdown();
  initCookieConsent();
  initLazyLoad();
  initCopyLink();
  initPasswordToggles();
  initRevealObserver();
  initMenuFilter();
  initAnchorScrolling();

  // Char counters (configure per page)
  attachCharCounter('comment-body', 'comment-counter', 1000);
  attachCharCounter('res-notes', 'notes-counter', 300);

  // Theme toggle button binding
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  // RTL toggle button binding
  const rtlBtn = document.getElementById('rtl-toggle');
  if (rtlBtn) rtlBtn.addEventListener('click', toggleRTL);

  // Floating leaves
  generateFloatingLeaves('leaves-container', 10);
  generateFloatingLeaves('hero-leaves', 6);

  console.log('%cLeafTable v1.0.0 loaded successfully', 'color:#2D5016;font-weight:bold;');
});

// ============================================================
// WINDOW LOAD â€” after all resources loaded
// ============================================================

window.addEventListener('load', () => {
  // Remove any page loader
  const loader = document.getElementById('page-loader');
  if (loader) {
    loader.style.opacity = '0';
    loader.style.transition = 'opacity 0.5s ease';
    setTimeout(() => loader.remove(), 500);
  }

  // Trigger AOS refresh if present
  if (typeof AOS !== 'undefined') {
    AOS.refresh();
  }
});

// ============================================================
// GLOBAL EXPORTS (for inline onclick attributes if needed)
// ============================================================

window.LeafTable = {
  toggleTheme,
  toggleRTL,
  showPanel,
  attachCharCounter,
  showToast,
  generateFloatingLeaves
};

// ============================================================
// END OF FILE
// ============================================================
