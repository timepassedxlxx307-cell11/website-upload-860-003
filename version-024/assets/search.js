(function () {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = document.getElementById("search-input");
    var status = document.getElementById("search-status");
    var results = document.getElementById("search-results");
    var data = window.MovieSearchData || [];

    if (input) {
        input.value = query;
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                """: "&quot;"
            }[char];
        });
    }

    function renderCard(movie) {
        return "<article class="movie-card">" +
            "<a href="./" + escapeHtml(movie.file) + "" aria-label="观看" + escapeHtml(movie.title) + "">" +
            "<span class="poster-wrap">" +
            "<img src="" + escapeHtml(movie.cover) + "" alt="" + escapeHtml(movie.title) + "" loading="lazy">" +
            "<span class="poster-year">" + escapeHtml(movie.year) + "</span>" +
            "<span class="poster-type">" + escapeHtml(movie.type) + "</span>" +
            "<span class="poster-play">▶</span>" +
            "</span>" +
            "<span class="movie-card-body">" +
            "<strong>" + escapeHtml(movie.title) + "</strong>" +
            "<em>" + escapeHtml(movie.region) + " · " + escapeHtml(movie.genre) + "</em>" +
            "<span>" + escapeHtml(movie.oneLine) + "</span>" +
            "</span>" +
            "</a>" +
            "</article>";
    }

    if (!query) {
        if (status) {
            status.textContent = "输入关键词查找影片";
        }
        return;
    }

    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matches = data.filter(function (movie) {
        var haystack = [
            movie.title,
            movie.region,
            movie.type,
            movie.year,
            movie.genre,
            movie.tags,
            movie.oneLine
        ].join(" ").toLowerCase();
        return words.every(function (word) {
            return haystack.indexOf(word) !== -1;
        });
    });

    if (status) {
        status.textContent = matches.length ? "搜索结果" : "未找到相关影片";
    }
    if (results) {
        results.innerHTML = matches.slice(0, 160).map(renderCard).join("");
    }
})();
