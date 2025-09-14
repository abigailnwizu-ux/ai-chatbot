// public/js/index.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ index.js loaded");

  // === Sidebar ===
  const menuBtn = document.getElementById("menuBtn"); // hamburger
  const sidebar = document.getElementById("sidebar"); // sidebar container
  const backdrop = document.getElementById("backdrop"); // dark overlay


  function openSidebar() {
    sidebar?.classList.add("open");
    backdrop?.classList.add("active");
    menuBtn?.setAttribute("aria-expanded", "true");
  }
  function revealOnScroll() {
    const reveals = document.querySelectorAll(".reveal");
    const windowHeight = window.innerHeight;

    reveals.forEach((el) => {
      const elementTop = el.getBoundingClientRect().top;
      const elementVisible = 100;

      if (elementTop < windowHeight - elementVisible) {
        el.classList.add("active");
      } else{
        el.classList.remove("active");
      }
    });
  }

  window.addEventListener("scroll",revealOnScroll);
  revealOnScroll();

  function closeSidebar() {
    sidebar?.classList.remove("open");
    backdrop?.classList.remove("active");
    menuBtn?.setAttribute("aria-expanded", "false");
  }

  function toggleSidebar() {
    if (sidebar?.classList.contains("open")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  menuBtn?.addEventListener("click", toggleSidebar);
  backdrop?.addEventListener("click", closeSidebar);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidebar();
  });

  // === Dark Mode ===
  const darkBtn = document.getElementById("darkBtn");
  const body = document.body;

  function toggleDarkMode() {
    body.classList.toggle("dark");
    if (body.classList.contains("dark")) {
      darkBtn.classList.replace("fa-moon","fa-sun"); // switch to sun
      console.log("🌙 Dark mode ON");
    } else {
      darkBtn.classList.replace("fa-sun","fa-moon"); // switch to moon
      console.log("☀️ Dark mode OFF");
    }
  }

  darkBtn?.addEventListener("click", toggleDarkMode);

  // === Swiper (used on dashboard and index testimonials) ===
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

  // === Search form (header) ===
  const searchForm = document.querySelector(".search-bar form");
  searchForm?.addEventListener("submit", (e) => {
    const input = searchForm.querySelector("input[name='q']");
    if (!input.value.trim()) {
      e.preventDefault();
      alert("Please enter a search term.");
    }
  });
});
