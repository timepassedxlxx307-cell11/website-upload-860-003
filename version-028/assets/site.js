(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var body = document.body;
    var menuToggle = document.querySelector("[data-menu-toggle]");

    if (menuToggle) {
      menuToggle.addEventListener("click", function () {
        body.classList.toggle("menu-open");
      });
    }

    var searchForms = document.querySelectorAll("[data-global-search]");
    searchForms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = "./library.html";

        if (value) {
          target += "?q=" + encodeURIComponent(value);
        }

        window.location.href = target;
      });
    });

    var hero = document.querySelector("[data-hero-slider]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;

      var showSlide = function (index) {
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
      };

      var nextSlide = function () {
        showSlide(current + 1);
      };

      var startTimer = function () {
        window.clearInterval(timer);
        timer = window.setInterval(nextSlide, 5200);
      };

      var previousButton = hero.querySelector("[data-hero-prev]");
      var nextButton = hero.querySelector("[data-hero-next]");

      if (previousButton) {
        previousButton.addEventListener("click", function () {
          showSlide(current - 1);
          startTimer();
        });
      }

      if (nextButton) {
        nextButton.addEventListener("click", function () {
          showSlide(current + 1);
          startTimer();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
          startTimer();
        });
      });

      showSlide(0);
      startTimer();
    }

    var movieList = document.querySelector("[data-movie-list]");

    if (movieList) {
      var cards = Array.prototype.slice.call(movieList.querySelectorAll(".movie-card"));
      var searchInput = document.querySelector("[data-movie-search]");
      var regionFilter = document.querySelector("[data-region-filter]");
      var yearFilter = document.querySelector("[data-year-filter]");
      var genreFilter = document.querySelector("[data-genre-filter]");
      var emptyState = document.querySelector("[data-empty-state]");

      var applyFilters = function () {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var region = regionFilter ? regionFilter.value : "";
        var year = yearFilter ? yearFilter.value : "";
        var genre = genreFilter ? genreFilter.value : "";
        var visibleCount = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var cardRegion = card.getAttribute("data-region") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var cardGenre = card.getAttribute("data-genre") || "";
          var matches = true;

          if (query && text.indexOf(query) === -1) {
            matches = false;
          }

          if (region && cardRegion !== region) {
            matches = false;
          }

          if (year && cardYear !== year) {
            matches = false;
          }

          if (genre && cardGenre.indexOf(genre) === -1) {
            matches = false;
          }

          card.style.display = matches ? "" : "none";

          if (matches) {
            visibleCount += 1;
          }
        });

        if (emptyState) {
          emptyState.classList.toggle("is-visible", visibleCount === 0);
        }
      };

      [searchInput, regionFilter, yearFilter, genreFilter].forEach(function (element) {
        if (element) {
          element.addEventListener("input", applyFilters);
          element.addEventListener("change", applyFilters);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var queryValue = params.get("q");

      if (queryValue && searchInput) {
        searchInput.value = queryValue;
      }

      applyFilters();
    }
  });
})();

function initializeMoviePlayer(source) {
  document.addEventListener("DOMContentLoaded", function () {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    var button = document.querySelector("[data-player-button]");

    if (!video || !source) {
      return;
    }

    var loaded = false;
    var hlsInstance = null;

    var beginPlay = function () {
      video.controls = true;

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      var playTask = video.play();

      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {});
      }
    };

    var loadSource = function () {
      if (loaded) {
        beginPlay();
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", beginPlay, { once: true });
        video.load();
        beginPlay();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, beginPlay);
        return;
      }

      video.src = source;
      video.load();
      beginPlay();
    };

    if (button) {
      button.addEventListener("click", loadSource);
    }

    if (overlay && overlay !== button) {
      overlay.addEventListener("click", loadSource);
    }

    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        loadSource();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
}
