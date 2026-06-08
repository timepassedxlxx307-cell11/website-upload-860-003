function initMoviePlayer(source) {
    var video = document.querySelector(".movie-player-video");
    var button = document.querySelector(".player-cover-button");
    var hlsInstance = null;
    var loaded = false;

    function loadAndPlay() {
        if (!video || !source) {
            return;
        }
        if (button) {
            button.classList.add("is-hidden");
        }
        if (!loaded) {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
            loaded = true;
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    if (button) {
        button.addEventListener("click", loadAndPlay);
    }
    if (video) {
        video.addEventListener("click", function () {
            if (!loaded) {
                loadAndPlay();
            }
        });
        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("is-hidden");
            }
        });
    }
    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
