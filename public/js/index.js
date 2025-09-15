document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ index.js loaded");

  // === DOM Elements ===
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("backdrop");
  const searchToggle = document.getElementById("searchToggle");
  const searchBar = document.querySelector(".search-bar");
  const searchForm = document.querySelector(".search-bar form");
  const darkBtn = document.getElementById("darkBtn");
  const body = document.body;

  // === Sidebar Functions ===
  function openSidebar() {
    sidebar?.classList.add("open", "active");
    backdrop?.classList.add("active");
    menuBtn?.setAttribute("aria-expanded", "true");
    sidebar?.setAttribute("aria-hidden", "false");
  }

  function closeSidebar() {
    sidebar?.classList.remove("open", "active");
    backdrop?.classList.remove("active");
    menuBtn?.setAttribute("aria-expanded", "false");
    sidebar?.setAttribute("aria-hidden", "true");
  }

  function toggleSidebar() {
    sidebar?.classList.contains("active") ? closeSidebar() : openSidebar();
  }

  // === Scroll Reveal ===
  function revealOnScroll() {
    const reveals = document.querySelectorAll(".reveal");
    const windowHeight = window.innerHeight;

    reveals.forEach((el) => {
      const elementTop = el.getBoundingClientRect().top;
      const threshold = 100;
      el.classList.toggle("active", elementTop < windowHeight - threshold);
    });
  }

  // === Search Bar Toggle ===
  function toggleSearchBar(ev) {
    ev.preventDefault();
    searchBar?.classList.toggle("expanded");
    const input = searchBar?.querySelector("input[type='search'], input[name='q']");
    if (searchBar?.classList.contains("expanded")) input?.focus();
  }

  // === Dark Mode Toggle ===
  function toggleDarkMode() {
    body.classList.toggle("dark");
    const isDark = body.classList.contains("dark");
    darkBtn?.classList.replace(isDark ? "fa-moon" : "fa-sun", isDark ? "fa-sun" : "fa-moon");
    console.log(isDark ? "🌙 Dark mode ON" : "☀️ Dark mode OFF");
  }

  // === Swiper Initialization ===
  function initSwiper() {
    if (typeof Swiper !== "undefined") {
      new Swiper(".swiper-container", {
        loop: true,
        spaceBetween: 24,
        autoplay: { delay: 4000 },
        pagination: { el: ".swiper-pagination", clickable: true },
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
        breakpoints: {
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        },
      });
      console.log("🎞️ Swiper initialized");
    }
  }

  // === Search Form Validation ===
  function validateSearchForm(e) {
    const input = searchForm?.querySelector("input[name='q']");
    if (!input?.value.trim()) {
      e.preventDefault();
      alert("Please enter a search term.");
    }
  }

  // === Event Listeners ===
  menuBtn?.addEventListener("click", toggleSidebar);
  backdrop?.addEventListener("click", closeSidebar);
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeSidebar());
  searchToggle?.addEventListener("click", toggleSearchBar);
  darkBtn?.addEventListener("click", toggleDarkMode);
  searchForm?.addEventListener("submit", validateSearchForm);
  window.addEventListener("scroll", revealOnScroll);

  // === Initial Calls ===
  revealOnScroll();
  initSwiper();
});
