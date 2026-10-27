/* Botonera inferior: al clicar, una pantalla con el título cruza y deja la sección. */
(function () {
    var band = document.querySelector(".curtain-band");
    var titleEl = band && band.querySelector(".curtain-title");
    var pages = Array.prototype.slice.call(document.querySelectorAll(".curtain-page"));
    if (!band || !titleEl || !pages.length) return;

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var nav = document.createElement("nav");
    var pill = document.createElement("div");
    nav.className = "curtain-nav";
    nav.setAttribute("aria-label", "Secciones");
    nav.setAttribute("inert", "");
    pill.className = "curtain-nav-pill";
    nav.appendChild(pill);

    pages.forEach(function (section) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "curtain-nav-btn";
        button.textContent = section.getAttribute("data-curtain-title") || "Sección";
        pill.appendChild(button);
    });
    document.body.appendChild(nav);

    var buttons = Array.prototype.slice.call(pill.querySelectorAll(".curtain-nav-btn"));
    var busy = false;
    var current = -1;

    function park() {
        if (window.gsap) gsap.set(band, { xPercent: 110 });
    }

    function setActive(index) {
        current = index;
        buttons.forEach(function (button, i) {
            var on = i === index;
            button.classList.toggle("is-active", on);
            if (on) button.setAttribute("aria-current", "true");
            else button.removeAttribute("aria-current");
        });
        var button = buttons[index];
        if (!button) return;
        var left = button.offsetLeft - (pill.clientWidth - button.offsetWidth) / 2;
        pill.scrollTo({ left: Math.max(0, left), behavior: reduce ? "auto" : "smooth" });
    }

    function jump(section) {
        var root = document.scrollingElement || document.documentElement;
        var previous = root.style.scrollBehavior;
        root.style.scrollBehavior = "auto";
        window.scrollTo(0, section.getBoundingClientRect().top + window.scrollY);
        root.style.scrollBehavior = previous;
        if (window.ScrollTrigger) ScrollTrigger.update();
    }

    function go(index) {
        if (busy || index === current || !pages[index]) return;
        var section = pages[index];
        titleEl.textContent = section.getAttribute("data-curtain-title") || "";
        if (reduce || !window.gsap) {
            jump(section);
            setActive(index);
            return;
        }
        busy = true;
        gsap.killTweensOf(band);
        gsap.timeline({
            onComplete: function () {
                busy = false;
                park();
            }
        })
            .set(band, { xPercent: 110 })
            .to(band, { xPercent: 0, duration: 0.55, ease: "power3.inOut" })
            .add(function () {
                jump(section);
                setActive(index);
            })
            .to({}, { duration: 0.42 })
            .to(band, { xPercent: -110, duration: 0.55, ease: "power3.inOut" });
    }

    buttons.forEach(function (button, index) {
        button.addEventListener("click", function () {
            go(index);
        });
    });

    if ("IntersectionObserver" in window) {
        var observer = new IntersectionObserver(function (entries) {
            if (busy) return;
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var index = pages.indexOf(entry.target);
                if (index !== -1) setActive(index);
            });
        }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
        pages.forEach(function (section) {
            observer.observe(section);
        });
    }

    if (!reduce && window.gsap) {
        park();
        band.classList.add("is-ready");
    }
})();
