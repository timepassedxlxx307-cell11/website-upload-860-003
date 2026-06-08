document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll(".site-search-form").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector("input[name='q']");
      if (!input) {
        return;
      }
      var query = input.value.trim();
      if (!query) {
        event.preventDefault();
        window.location.href = "search.html";
      }
    });
  });

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");

    if (previous) {
      previous.addEventListener("click", function () {
        showSlide(current - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startHero();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        startHero();
      });
    });

    hero.addEventListener("mouseenter", stopHero);
    hero.addEventListener("mouseleave", startHero);
    showSlide(0);
    startHero();
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
  var filterInput = document.querySelector(".filter-input");
  var filterSelects = Array.prototype.slice.call(document.querySelectorAll(".filter-select"));
  var emptyFilter = document.querySelector(".empty-filter");

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  if (filterInput) {
    var query = getQueryParam("q");
    if (query) {
      filterInput.value = query;
    }
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
    var activeFilters = {};

    filterSelects.forEach(function (select) {
      if (select.value) {
        activeFilters[select.getAttribute("data-filter")] = select.value;
      }
    });

    var visible = 0;
    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-tags") || "",
        card.getAttribute("data-year") || "",
        card.getAttribute("data-region") || "",
        card.getAttribute("data-type") || ""
      ].join(" ").toLowerCase();

      var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchesSelects = Object.keys(activeFilters).every(function (key) {
        return (card.getAttribute("data-" + key) || "") === activeFilters[key];
      });
      var shouldShow = matchesKeyword && matchesSelects;

      card.style.display = shouldShow ? "" : "none";
      if (shouldShow) {
        visible += 1;
      }
    });

    if (emptyFilter) {
      emptyFilter.classList.toggle("is-visible", visible === 0);
    }
  }

  if (filterInput) {
    filterInput.addEventListener("input", applyFilters);
  }

  filterSelects.forEach(function (select) {
    select.addEventListener("change", applyFilters);
  });

  applyFilters();
});
