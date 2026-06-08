(function () {
  function selectAll(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = selectAll('.hero-slide', slider);
    var dots = selectAll('[data-hero-dot]', slider);
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    restart();
  }

  function initFilters() {
    var input = document.querySelector('[data-filter-input]');
    var list = document.querySelector('[data-filter-list]');
    if (!input || !list) {
      return;
    }
    var cards = selectAll('[data-filter-item]', list);
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    if (input.hasAttribute('data-query-sync') && q) {
      input.value = q;
    }

    function apply() {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-filter-text') || card.textContent || '').toLowerCase();
        card.classList.toggle('is-hidden', value && text.indexOf(value) === -1);
      });
    }

    input.addEventListener('input', apply);
    apply();
  }

  function initPlayers() {
    selectAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var cover = player.querySelector('.player-cover');
      var url = player.getAttribute('data-play-url');
      var attached = false;
      var hls = null;

      function requestPlay() {
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {});
        }
      }

      function attach(autoplay) {
        if (!video || !url) {
          return;
        }
        if (attached) {
          if (autoplay) {
            requestPlay();
          }
          return;
        }
        attached = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            if (autoplay) {
              requestPlay();
            }
          });
        } else {
          video.src = url;
          if (autoplay) {
            requestPlay();
          }
        }
      }

      function play() {
        attach(true);
        if (cover) {
          cover.classList.add('is-hidden');
        }
      }

      if (cover) {
        cover.addEventListener('click', play);
      }

      if (video) {
        video.addEventListener('play', function () {
          if (cover) {
            cover.classList.add('is-hidden');
          }
        });
        video.addEventListener('click', function () {
          if (!attached) {
            play();
          }
        });
        video.addEventListener('error', function () {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }

      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
