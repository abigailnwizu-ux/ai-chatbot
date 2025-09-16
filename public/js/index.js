document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Clean index.js loaded");

  // === DOM Elements ===
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("backdrop");
  const searchToggle = document.getElementById("searchToggle");
  const searchBar = document.querySelector(".search-bar");
  const searchInput = document.querySelector(".search-bar input[name='q']");
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

  // === Search Functions - Mobile Optimized ===
  function handleSearchSubmit(e) {
    const input = searchInput;
    
    // Only validate on submit - don't interfere with typing
    if (!input?.value?.trim()) {
      e.preventDefault();
      console.log("❌ Empty search prevented");
      
      // Focus input for mobile
      if (input) {
        input.focus();
        // On mobile, show keyboard
        if ('ontouchstart' in window) {
          input.click();
        }
      }
      return false;
    }
    
    console.log("✅ Submitting search:", input.value);
    // Let form submit naturally
    return true;
  }

  // === Dark Mode Toggle ===
  function toggleDarkMode() {
    body.classList.toggle("dark");
    const isDark = body.classList.contains("dark");
    const icon = darkBtn?.querySelector("i");
    
    if (icon) {
      icon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
    }
    
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

  // === Mobile Input Fix ===
  function initMobileInputFix() {
    if (!searchInput) return;
    
    // Mobile-specific touch handling
    if ('ontouchstart' in window) {
      console.log("📱 Mobile device detected - applying input fixes");
      
      // Ensure input is focusable on mobile
      searchInput.addEventListener('touchstart', function(e) {
        // Don't preventDefault - let normal touch work
        console.log("👆 Touch on search input");
      }, { passive: true });
      
      // Handle input focus properly on mobile
      searchInput.addEventListener('focus', function() {
        console.log("✅ Search input focused");
        // Scroll input into view on mobile if needed
        this.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      
      // Debug typing
      searchInput.addEventListener('input', function() {
        console.log("✅ User typing:", this.value);
      });
    }
    
    // Ensure input is always interactive
    searchInput.style.pointerEvents = 'auto';
    searchInput.style.userSelect = 'text';
    searchInput.style.webkitUserSelect = 'text';
    searchInput.style.touchAction = 'manipulation';
  }

  // === Event Listeners ===
  
  // Sidebar
  menuBtn?.addEventListener("click", toggleSidebar);
  backdrop?.addEventListener("click", closeSidebar);
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeSidebar());
  
  // Search - SIMPLIFIED (no complex event handling)
  searchBar?.addEventListener("submit", handleSearchSubmit);
  
  // Dark mode
  darkBtn?.addEventListener("click", toggleDarkMode);
  
  // Scroll reveal
  window.addEventListener("scroll", revealOnScroll);

  // === Initialization ===
  revealOnScroll();
  initSwiper();
  initMobileInputFix();
  
  // === Debug Info ===
  console.log("🔍 Search elements check:");
  console.log("- Search bar:", !!searchBar);
  console.log("- Search input:", !!searchInput);
  console.log("- Search toggle:", !!searchToggle);
  console.log("- Input type:", searchInput?.type);
  console.log("- Input name:", searchInput?.name);
});