(function() {
  var menuButton = document.querySelector('[data-menu-button]');
  var menuPanel = document.querySelector('[data-menu-panel]');

  if (menuButton && menuPanel) {
    menuButton.addEventListener('click', function() {
      menuPanel.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', menuPanel.classList.contains('is-open'));
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var tabs = Array.prototype.slice.call(hero.querySelectorAll('.hero-tab'));
    var activeIndex = 0;

    function showHeroSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      tabs.forEach(function(tab, tabIndex) {
        tab.classList.toggle('is-active', tabIndex === activeIndex);
      });
    }

    tabs.forEach(function(tab, index) {
      tab.addEventListener('click', function() {
        showHeroSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function() {
        showHeroSlide(activeIndex + 1);
      }, 5200);
    }
  }

  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    var input = filterPanel.querySelector('[data-search-input]');
    var region = filterPanel.querySelector('[data-region-select]');
    var type = filterPanel.querySelector('[data-type-select]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      var keyword = normalize(input ? input.value : '');
      var selectedRegion = region ? region.value : '';
      var selectedType = type ? type.value : '';

      cards.forEach(function(card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre')
        ].join(' '));
        var regionMatch = !selectedRegion || card.getAttribute('data-region') === selectedRegion;
        var typeMatch = !selectedType || card.getAttribute('data-type') === selectedType;
        var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
        card.classList.toggle('hidden-by-filter', !(regionMatch && typeMatch && keywordMatch));
      });
    }

    [input, region, type].forEach(function(control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('.watch-player'));

  players.forEach(function(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var status = player.querySelector('[data-player-status]');
    var streamUrl = player.getAttribute('data-hls-url');
    var hasLoaded = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message || '';
      }
    }

    function attachStream() {
      if (!video || !streamUrl || hasLoaded) {
        return;
      }

      hasLoaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function(event, data) {
          if (data && data.fatal) {
            setStatus('视频加载遇到问题，请稍后重试');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else {
        video.src = streamUrl;
      }
    }

    function playVideo() {
      attachStream();
      player.classList.add('is-playing');
      if (video) {
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function() {
            setStatus('点击视频画面即可继续播放');
          });
        }
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('play', function() {
        player.classList.add('is-playing');
        setStatus('');
      });

      video.addEventListener('click', function() {
        if (video.paused) {
          playVideo();
        }
      });
    }
  });
})();
