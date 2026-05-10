/**
 * Hero micro-motion with Anime.js v4 — runs after GSAP hero intro (pmHeroIntroComplete).
 * Respects prefers-reduced-motion. Safe on mobile (same as desktop; cards already handled in GSAP).
 */
(function () {
    'use strict';

    var started = false;

    function prefersReducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function startGradientMicroLoop() {
        if (prefersReducedMotion()) return;

        var el = document.querySelector('.hero-title .text-gradient');
        if (!el) return;

        var root = typeof anime !== 'undefined' ? anime : null;
        if (!root || typeof root.animate !== 'function') return;

        el.style.display = 'inline-block';
        el.style.willChange = 'transform';

        root.animate(el, {
            scale: [1, 1.022, 1],
            letterSpacing: ['0em', '0.028em', '0em'],
            duration: 4800,
            ease: 'inOutQuad',
            loop: true,
            alternate: true
        });
    }

    function onIntroComplete() {
        if (started) return;
        started = true;
        startGradientMicroLoop();
    }

    window.addEventListener('pmHeroIntroComplete', onIntroComplete);

    // Fallback if the custom event never fires (e.g. script order / GSAP)
    window.setTimeout(function () {
        if (!started) onIntroComplete();
    }, 10000);
})();
