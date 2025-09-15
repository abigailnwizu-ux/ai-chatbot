document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ index.js loaded");
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("backdrop");
  const searchToggle = document.getElementById("searchToggle");
  const searchBar = document.querySelector(".search-bar");
  const searchForm = document.querySelector(".search-bar");
  const darkBtn = document.getElementById("darkBtn");
  const body = document.body;
  
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
  function handleSearchClick(ev) {
    const input = searchBar?.querySelector("input[type='search'], input[name='q']");
    
    // If search bar is not expanded, expand it and focus input
    if (!searchBar?.classList.contains("expanded")) {
      ev.preventDefault();
      searchBar?.classList.add("expanded");
      // Small delay for mobile to prevent viewport jump
      setTimeout(() => input?.focus(), 100);
      return;
    }
    
    // If expanded but no input value, prevent submission
    if (!input?.value.trim()) {
      ev.preventDefault();
      // Remove alert, just refocus instead
      input?.focus();
      return;
    }
    
    // If we have input value, let the form submit naturally
    console.log("🔍 Submitting search:", input.value);
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

  // === Search Form Validation (backup validation) ===
  function validateSearchForm(e) {
    const input = e.target?.querySelector("input[name='q']");
    if (!input?.value.trim()) {
      e.preventDefault();
      // Remove alert, just focus the input
      input?.focus();
    } else {
      console.log("✅ Form validation passed, submitting to /ai/ask");
    }
  }

  // === Keyboard Support for Search ===
  function handleSearchKeydown(e) {
    if (e.key === "Enter") {
      const input = e.target;
      if (input.value.trim()) {
        console.log("⌨️ Enter pressed, submitting search");
        // Let the form submit naturally
      }
    }
  }

  // === Event Listeners ===
  menuBtn?.addEventListener("click", toggleSidebar);
  backdrop?.addEventListener("click", closeSidebar);
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeSidebar());
  
  // Updated search event listeners
  searchToggle?.addEventListener("click", handleSearchClick);
  searchForm?.addEventListener("submit", validateSearchForm);
  
  // Add keyboard support
  const searchInput = searchBar?.querySelector("input[name='q']");
  searchInput?.addEventListener("keydown", handleSearchKeydown);
  
  darkBtn?.addEventListener("click", toggleDarkMode);
  window.addEventListener("scroll", revealOnScroll);

  // === Initial Calls ===
  revealOnScroll();
  initSwiper();
});