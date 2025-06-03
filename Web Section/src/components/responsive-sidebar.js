/**
 * Sets up a responsive sidebar that adapts to screen size.
 * 
 * - On small screens (width < 992px):
 *   - Adds a toggle button (☰) to the top navbar to open/close the sidebar.
 *   - Adds a close button (←) inside the sidebar to collapse it.
 *   - The sidebar is collapsed by default.
 * 
 * - On large screens (width >= 992px):
 *   - Removes both the toggle and close buttons if they exist.
 *   - Ensures the sidebar is always visible.
 * 
 * This function is executed initially and whenever the window is resized,
 * ensuring dynamic adaptation to screen width changes.
 */
export function setupResponsiveSidebar() {
  const sidebar = document.querySelector('aside');
  const topNavbar = document.querySelector('header');

  const manageSidebarUI = () => {
    if (window.innerWidth < 992) {
      // Add ☰ toggle button if not present
      if (!document.querySelector('.sidebar-toggle')) {
        const toggleButton = document.createElement('button');
        toggleButton.className = 'sidebar-toggle text-2xl mr-4 text-gray-700 hover:text-black';
        toggleButton.innerHTML = '☰';
        toggleButton.title = 'Open Sidebar';

        toggleButton.addEventListener('click', () => {
          sidebar.classList.toggle('collapsed');
        });

        topNavbar.prepend(toggleButton);
      }

      // Add ← close button if not present
      if (!document.querySelector('.sidebar-close')) {
        const closeButton = document.createElement('button');
        closeButton.className = 'sidebar-close text-lg px-2 py-1 text-gray-600 hover:text-black';
        closeButton.innerHTML = '←';
        closeButton.title = 'Close Sidebar';

        closeButton.addEventListener('click', () => {
          sidebar.classList.add('collapsed');
        });

        sidebar.insertBefore(closeButton, sidebar.firstChild);
      }

      // Collapse the sidebar by default
      sidebar.classList.add('collapsed');
    } else {
      // On large screens, remove both buttons and show sidebar
      const toggleBtn = document.querySelector('.sidebar-toggle');
      const closeBtn = document.querySelector('.sidebar-close');

      if (toggleBtn) toggleBtn.remove();
      if (closeBtn) closeBtn.remove();

      sidebar.classList.remove('collapsed');
    }
  };

  // Initial setup
  manageSidebarUI();

  // Recalculate on window resize
  window.addEventListener('resize', manageSidebarUI);
}
