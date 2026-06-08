(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (toggle && mobileNav) {
        toggle.addEventListener("click", function () {
            var expanded = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!expanded));
            mobileNav.hidden = expanded;
            toggle.classList.toggle("is-open", !expanded);
        });
    }

    var carousel = document.querySelector("[data-hero-carousel]");
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        var prev = carousel.querySelector(".hero-control.prev");
        var next = carousel.querySelector(".hero-control.next");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

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
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });
        restart();
    }

    var filterInput = document.querySelector(".js-card-filter");
    if (filterInput) {
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        filterInput.addEventListener("input", function () {
            var query = filterInput.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = card.getAttribute("data-search") || "";
                card.hidden = query.length > 0 && text.indexOf(query) === -1;
            });
        });
    }
})();
