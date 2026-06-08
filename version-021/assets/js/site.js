(function () {
  function onReady(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initMenu() {
    var button = document.querySelector(".mobile-toggle");
    var links = document.querySelector(".nav-links");
    if (!button || !links) {
      return;
    }
    button.addEventListener("click", function () {
      links.classList.toggle("open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    if (slides.length < 2) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var index = 0;
    var timer;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function restart() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initSearch() {
    var input = document.querySelector("#movieSearch");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-list .movie-card"));
    var chips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
    var empty = document.querySelector(".empty-state");
    var activeFilter = "";

    if (!cards.length) {
      return;
    }

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function apply() {
      var query = input ? normalize(input.value) : "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardCategory = normalize(card.getAttribute("data-category"));
        var byText = !query || haystack.indexOf(query) !== -1;
        var byFilter = !activeFilter || cardType === activeFilter || cardCategory === activeFilter || haystack.indexOf(activeFilter) !== -1;
        var keep = byText && byFilter;
        card.style.display = keep ? "" : "none";
        if (keep) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeFilter = normalize(chip.getAttribute("data-filter"));
        chips.forEach(function (item) {
          item.classList.toggle("active", item === chip);
        });
        apply();
      });
    });

    apply();
  }

  window.setupPlayer = function (source) {
    function run() {
      var video = document.getElementById("movieVideo");
      var start = document.getElementById("playerStart");
      var frame = document.getElementById("playerFrame");
      var state = document.getElementById("playerState");
      var hlsInstance = null;
      var loaded = false;

      if (!video || !start || !frame || !source) {
        return;
      }

      function setState(text) {
        if (state) {
          state.textContent = text || "";
        }
      }

      function load() {
        if (loaded) {
          return;
        }
        loaded = true;
        setState("加载中...");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          setState("");
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setState("");
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setState("播放暂不可用，请稍后再试");
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hlsInstance.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hlsInstance.recoverMediaError();
              }
            }
          });
          return;
        }
        setState("播放暂不可用，请稍后再试");
      }

      function begin() {
        load();
        start.classList.add("hidden");
        video.play().catch(function () {
          start.classList.remove("hidden");
        });
      }

      start.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        begin();
      });

      frame.addEventListener("click", function (event) {
        if (event.target === video && !video.paused) {
          return;
        }
        begin();
      });

      video.addEventListener("play", function () {
        start.classList.add("hidden");
      });

      video.addEventListener("pause", function () {
        if (!video.ended) {
          start.classList.remove("hidden");
        }
      });

      video.addEventListener("ended", function () {
        start.classList.remove("hidden");
      });

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }

    onReady(run);
  };

  onReady(function () {
    initMenu();
    initHero();
    initSearch();
  });
})();
