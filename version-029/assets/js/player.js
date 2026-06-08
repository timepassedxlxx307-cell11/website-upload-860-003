(function () {
  function initPlayer(root) {
    var video = root.querySelector("video");
    var overlay = root.querySelector("[data-player-overlay]");
    var url = video ? video.getAttribute("data-stream") : "";
    var loaded = false;

    function attach() {
      if (!video || !url || loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        video.hlsInstance = hls;
        return;
      }
      video.src = url;
    }

    function play() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      if (video) {
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
    }
  }

  if (document.readyState !== "loading") {
    Array.prototype.forEach.call(document.querySelectorAll("[data-player]"), initPlayer);
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      Array.prototype.forEach.call(document.querySelectorAll("[data-player]"), initPlayer);
    });
  }
})();
