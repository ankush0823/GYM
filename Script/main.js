// Hamburger toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navBtn = document.querySelector('.nav-btn');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  navBtn.classList.toggle('active');
  menuToggle.classList.toggle('open');
});