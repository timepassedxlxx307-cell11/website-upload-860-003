(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
      menuButton.textContent = mobilePanel.classList.contains('open') ? '×' : '☰';
    });
  }

  var slider = document.querySelector('.hero-slider');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var previousButton = slider.querySelector('.hero-prev');
    var nextButton = slider.querySelector('.hero-next');
    var index = 0;
    var timer;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === index);
      });
    }

    function startTimer() {
      if (slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function resetTimer() {
      window.clearInterval(timer);
      startTimer();
    }

    if (previousButton) {
      previousButton.addEventListener('click', function () {
        showSlide(index - 1);
        resetTimer();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        showSlide(index + 1);
        resetTimer();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        resetTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function renderSuggestions(form, matches) {
    var box = form.querySelector('.search-suggest');
    if (!box) {
      return;
    }

    if (!matches.length) {
      box.innerHTML = '';
      box.hidden = true;
      return;
    }

    box.innerHTML = matches.slice(0, 8).map(function (movie) {
      return '<a class="suggest-item" href="' + movie.url + '">' +
        '<img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '">' +
        '<span><strong>' + movie.title + '</strong><span>' + movie.year + ' · ' + movie.region + ' · ' + movie.type + '</span></span>' +
        '</a>';
    }).join('');
    box.hidden = false;
  }

  Array.prototype.slice.call(document.querySelectorAll('.global-search-form')).forEach(function (form) {
    var input = form.querySelector('.global-search');
    if (!input) {
      return;
    }

    input.addEventListener('input', function () {
      var keyword = normalize(input.value);
      var source = window.HPT_MOVIES || [];
      if (!keyword) {
        renderSuggestions(form, []);
        return;
      }
      var matches = source.filter(function (movie) {
        return normalize(movie.title + ' ' + movie.region + ' ' + movie.type + ' ' + movie.genre + ' ' + movie.line).indexOf(keyword) !== -1;
      });
      renderSuggestions(form, matches);
    });

    form.addEventListener('submit', function (event) {
      var keyword = normalize(input.value);
      var source = window.HPT_MOVIES || [];
      if (!keyword) {
        return;
      }
      var match = source.find(function (movie) {
        return normalize(movie.title + ' ' + movie.region + ' ' + movie.type + ' ' + movie.genre + ' ' + movie.line).indexOf(keyword) !== -1;
      });
      if (match) {
        event.preventDefault();
        window.location.href = match.url;
      }
    });

    document.addEventListener('click', function (event) {
      var box = form.querySelector('.search-suggest');
      if (box && !form.contains(event.target)) {
        box.hidden = true;
      }
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('.filter-panel')).forEach(function (panel) {
    var input = panel.querySelector('[data-filter="keyword"]');
    var year = panel.querySelector('[data-filter="year"]');
    var type = panel.querySelector('[data-filter="type"]');
    var reset = panel.querySelector('[data-filter="reset"]');
    var scopeSelector = panel.getAttribute('data-scope') || '.movie-card';
    var cards = Array.prototype.slice.call(document.querySelectorAll(scopeSelector));
    var empty = document.querySelector('.empty-state');

    function applyFilters() {
      var keyword = normalize(input && input.value);
      var selectedYear = normalize(year && year.value);
      var selectedType = normalize(type && type.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-type'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardType = normalize(card.getAttribute('data-type'));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesYear = !selectedYear || cardYear === selectedYear;
        var matchesType = !selectedType || cardType === selectedType;
        var show = matchesKeyword && matchesYear && matchesType;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (year) {
          year.value = '';
        }
        if (type) {
          type.value = '';
        }
        applyFilters();
      });
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && input) {
      input.value = query;
    }
    applyFilters();
  });
})();

function setupPlayer(source) {
  var video = document.getElementById('moviePlayer');
  var cover = document.querySelector('.player-cover');
  var loaded = false;
  var hlsInstance = null;

  if (!video || !source) {
    return;
  }

  function attachSource() {
    if (loaded) {
      return;
    }
    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls();
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }

    video.src = source;
  }

  function startPlayback() {
    attachSource();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    video.play().catch(function () {});
  }

  if (cover) {
    cover.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
