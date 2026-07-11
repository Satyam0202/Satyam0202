document.addEventListener('DOMContentLoaded', () => {
  const themeButton = document.getElementById('themeToggle');
  if (themeButton) {
    themeButton.addEventListener('click', () => {
      const current = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', current);
      themeButton.textContent = current === 'dark' ? '☀️' : '🌙';
    });
  }
});
