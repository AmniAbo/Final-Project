/* ---------- Tailwind Configuration ---------- */
/**
 * Enables dark mode based on the presence of the "dark" class.
 * Tailwind's dark mode will respond to `.dark` on the <html> tag.
 */
tailwind.config = { darkMode: 'class' };


/* ---------- Theme Toggle (Dark/Light) ---------- */
/**
 * Enables toggling between dark and light mode manually via a button.
 * Default is light mode; no localStorage is used to persist preference.
 */
const html = document.documentElement;
const sun  = document.getElementById('sun');   // ☀️ icon element
const moon = document.getElementById('moon');  // 🌙 icon element

/**
 * Sets the UI theme to dark or light.
 * @param {boolean} dark - If true, enable dark mode; else light mode.
 */
function setTheme(dark) {
  html.classList.toggle('dark', dark);
  sun.classList.toggle('hidden', dark);
  moon.classList.toggle('hidden', !dark);

  // Optional: store preference in localStorage (currently disabled)
  // localStorage.setItem('theme', dark ? 'dark' : 'light');
}

// Force initial theme to light (no memory from previous sessions)
setTheme(false);

// Toggle theme when clicking the button
document.getElementById('theme-toggle')
        .addEventListener('click', () => setTheme(!html.classList.contains('dark')));


/* ---------- Sidebar Navigation ---------- */
/**
 * Implements SPA-style (single page app) navigation between tabs.
 * Uses sessionStorage to remember the last visited tab between reloads.
 */

// All sidebar navigation buttons
const links = document.querySelectorAll('.nav-link');

// Section mapping by tab name
const sections = {
  dashboard   : document.getElementById('dashboard'),
  intersection: document.getElementById('intersection')
};

// Load last selected tab from sessionStorage or default to "dashboard"
let currentTab = sessionStorage.getItem('selectedTab') || 'dashboard';
activateTab(currentTab);

// Attach event listeners to all navigation buttons
links.forEach(btn => {
  btn.addEventListener('click', () => {
    const t = btn.dataset.target;

    // Highlight active tab
    links.forEach(l => l.classList.remove('active'));
    btn.classList.add('active');

    // Show/hide relevant section
    Object.keys(sections).forEach(k =>
      sections[k].classList.toggle('hidden', k !== t)
    );

    // Update breadcrumb
    document.getElementById('breadcrumb').textContent =
      t.charAt(0).toUpperCase() + t.slice(1);

    // Scroll to top
    document.querySelector('main').scrollTo({ top: 0, behavior: 'smooth' });

    // Save tab to sessionStorage
    sessionStorage.setItem('selectedTab', t);
  });
});

/**
 * Activates the given tab (used on page load or direct call).
 * @param {string} tabName - The ID of the tab to activate.
 */
function activateTab(tabName) {
  links.forEach(l => {
    const isActive = l.dataset.target === tabName;
    l.classList.toggle('active', isActive);
  });

  Object.keys(sections).forEach(k =>
    sections[k].classList.toggle('hidden', k !== tabName)
  );

  document.getElementById('breadcrumb').textContent =
    tabName.charAt(0).toUpperCase() + tabName.slice(1);
}
