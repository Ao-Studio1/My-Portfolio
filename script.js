// ---------------------------
// Dark mode toggle with persistence
// ---------------------------
const body = document.body;
const toggleBtn = document.getElementById('darkToggle');
const darkIcon = document.getElementById('darkIcon');
const darkLabel = document.getElementById('darkLabel');

const saved = localStorage.getItem('ao_dark_mode');
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

if (saved === 'true' || (saved === null && prefersDark)) {
  body.classList.add('dark-mode');
  toggleBtn.setAttribute('aria-pressed', 'true');
  darkIcon.className = 'fa-solid fa-sun';
  darkLabel.textContent = 'Light';
} else {
  body.classList.remove('dark-mode');
  toggleBtn.setAttribute('aria-pressed', 'false');
  darkIcon.className = 'fa-regular fa-moon';
  darkLabel.textContent = 'Dark';
}

toggleBtn.addEventListener('click', () => {
  const isDark = body.classList.toggle('dark-mode');
  localStorage.setItem('ao_dark_mode', isDark ? 'true' : 'false');
  toggleBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  if (isDark) {
    darkIcon.className = 'fa-solid fa-sun';
    darkLabel.textContent = 'Light';
  } else {
    darkIcon.className = 'fa-regular fa-moon';
    darkLabel.textContent = 'Dark';
  }
});

// ---------------------------
// Contact form validation + submission
// ---------------------------
const form = document.getElementById("contactForm");
const status = document.getElementById("formStatus");

const nameInput = document.getElementById("name");
const nameError = document.getElementById("nameError");
const emailInput = document.getElementById("email");
const emailError = document.getElementById("emailError");
const messageInput = document.getElementById("message");
const messageError = document.getElementById("messageError");

// Live validation
nameInput.addEventListener("input", () => {
  nameError.textContent = nameInput.validity.valueMissing ? "Please enter your name." : "";
});
emailInput.addEventListener("input", () => {
  emailError.textContent = (emailInput.validity.valueMissing || emailInput.validity.typeMismatch) ? "Please enter a valid email address." : "";
});
messageInput.addEventListener("input", () => {
  messageError.textContent = messageInput.validity.valueMissing ? "Please enter a message." : "";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  let valid = true;

  if (!nameInput.checkValidity()) { nameError.textContent = "Please enter your name."; valid = false; }
  if (!emailInput.checkValidity()) { emailError.textContent = "Please enter a valid email address."; valid = false; }
  if (!messageInput.checkValidity()) { messageError.textContent = "Please enter a message."; valid = false; }
  if (!valid) return;

  status.textContent = "Sending...";
  status.className = "";

  try {
    const response = await fetch(form.action, {
      method: form.method,
      body: new FormData(form),
      headers: { "Accept": "application/json" }
    });

    if (response.ok) {
      status.textContent = "✅ Message sent! I’ll reply shortly.";
      status.className = "status-success";
      form.reset();
    } else {
      status.textContent = "❌ Something went wrong. Try again later.";
      status.className = "status-error";
    }
  } catch (err) {
    status.textContent = "⚠️ Network error. Please try again.";
    status.className = "status-error";
  }
});

// ---------------------------
// Project cards: lazy-load, reveal, ripple
// ---------------------------
document.addEventListener('DOMContentLoaded', () => {
  const lazyImages = document.querySelectorAll('img.lazy');
  const cards = document.querySelectorAll('.project-card');

  // Lazy-load images
  if ('IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.addEventListener('load', () => img.classList.add('loaded'));
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '200px 0px', threshold: 0.01 });
    lazyImages.forEach(img => imgObserver.observe(img));
  } else {
    lazyImages.forEach(img => { img.src = img.dataset.src; img.classList.add('loaded'); });
  }

  // Reveal animation with stagger
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = entry.target;
          const delay = parseInt(card.dataset.index || '0', 10);
          setTimeout(() => card.classList.add('visible'), delay);
          observer.unobserve(card);
        }
      });
    }, { threshold: 0.15 });

    cards.forEach((card, i) => {
      card.classList.add('reveal');
      card.dataset.index = i * 80; // 80ms stagger
      revealObserver.observe(card);
    });
  } else {
    cards.forEach(card => card.classList.add('visible'));
  }

  // Image fade-in for non-lazy or cached images
  const imgs = document.querySelectorAll('.project-card img');
  imgs.forEach(img => {
    if (img.complete) img.classList.add('loaded');
    else img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
  });

  // Ripple effect for buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.project-overlay .btn');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const span = document.createElement('span');
    span.className = 'ripple';
    span.style.left = (e.clientX - rect.left) + 'px';
    span.style.top = (e.clientY - rect.top) + 'px';
    span.style.width = span.style.height = Math.max(rect.width, rect.height) + 'px';
    btn.appendChild(span);
    setTimeout(() => span.remove(), 650);
  });
});







document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('ao-header');
  const root = document.documentElement;
  const main = document.querySelector('main');

  if (!header || !main) return;

  // Measure header height and set CSS var used by main
  function updateHeaderHeight() {
    const h = header.getBoundingClientRect().height;
    root.style.setProperty('--header-height', `${Math.ceil(h)}px`);
    // defensive inline fallback for older browsers:
    main.style.paddingTop = getComputedStyle(root).getPropertyValue('--header-height') || `${h}px`;
  }

  // Throttle scroll updates via rAF
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrolled = window.scrollY || window.pageYOffset;
        const shouldShrink = scrolled > 50; // threshold
        if (shouldShrink) header.classList.add('shrink');
        else header.classList.remove('shrink');
        // Update height after class toggle so padding matches new header size
        updateHeaderHeight();
        ticking = false;
      });
      ticking = true;
    }
  }

  // Initial setup
  updateHeaderHeight();
  // Set initial shrink state in-case page loaded scrolled
  if ((window.scrollY || window.pageYOffset) > 50) header.classList.add('shrink');

  // Events
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateHeaderHeight);
  window.addEventListener('orientationchange', () => { setTimeout(updateHeaderHeight, 120); });

  // Some fonts/images can change layout after load — catch those
  // If Font Loading API supported:
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateHeaderHeight);
  }

  // Update when images inside header or above load (good for logo height)
  const imgs = header.querySelectorAll('img');
  imgs.forEach(img => {
    if (!img.complete) img.addEventListener('load', updateHeaderHeight, { once: true });
  });

  // small post-load correction
  setTimeout(updateHeaderHeight, 350);
});
