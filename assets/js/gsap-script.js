/**
 * GSAP Animations for Plan Maestro
 */

document.addEventListener('DOMContentLoaded', () => {
    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Initial Hero Animation — dispatch pmHeroIntroComplete when timeline + gradient intro both finish (for Anime.js hero layer)
    let heroIntroTimelineDone = false;
    let heroIntroGradientDone = false;
    let heroIntroCompleteDispatched = false;

    const tryDispatchHeroIntroComplete = () => {
        if (heroIntroCompleteDispatched || !heroIntroTimelineDone || !heroIntroGradientDone) return;
        heroIntroCompleteDispatched = true;
        window.dispatchEvent(new CustomEvent('pmHeroIntroComplete'));
    };

    const heroTimeline = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
            heroIntroTimelineDone = true;
            tryDispatchHeroIntroComplete();
        }
    });
    
    heroTimeline
        .from(".hero-title", { 
            y: 50, 
            opacity: 0, 
            duration: 1, 
            delay: 0.2 
        })
        .from(".hero-subtitle", { 
            y: 30, 
            opacity: 0, 
            duration: 0.8 
        }, "-=0.6")
        .from(".hero-buttons", { 
            y: 30, 
            opacity: 0, 
            duration: 0.8 
        }, "-=0.6")
        // Hero composing orb entrance
        if (document.querySelector('.hero-thinking-orb')) {
            heroTimeline.from('.hero-thinking-orb', {
                y: 40,
                opacity: 0,
                scale: 0.9,
                duration: 0.9
            }, '-=0.8');
        }

    // Typing effect for "Pensamiento Docente" if present
    const gradientText = document.querySelector('.hero-title .text-gradient');
    if (gradientText) {
        heroIntroGradientDone = false;
        // Simple scale/pop effect instead of typing to avoid breaking HTML structure
        gsap.from(gradientText, {
            scale: 0.9,
            opacity: 0,
            duration: 1.5,
            delay: 0.5,
            ease: "elastic.out(1, 0.3)",
            onComplete: () => {
                heroIntroGradientDone = true;
                tryDispatchHeroIntroComplete();
            }
        });
    } else {
        heroIntroGradientDone = true;
    }

    // Features motion slider (Code Jungle style: preview cards expand into full-bleed)
    const featuresSlider = document.querySelector('#lanzamiento2026 .features-motion-slider');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (featuresSlider) {
        const nav = featuresSlider.querySelector('.features-slider-nav');
        const prevBtn = featuresSlider.querySelector('.features-slider-prev');
        const nextBtn = featuresSlider.querySelector('.features-slider-next');
        let sliding = false;

        const getSlides = () =>
            Array.from(featuresSlider.querySelectorAll('.detailed-feature-section'));

        // Corporate accent + ensure photo layer exists for data-bg slides
        getSlides().forEach((section) => {
            const visual = section.querySelector('.feature-visual');
            if (visual) {
                const accent = getComputedStyle(visual).getPropertyValue('--fv-accent').trim();
                if (accent) section.style.setProperty('--card-accent', accent);
            }

            const bgSrc = section.getAttribute('data-bg');
            if (bgSrc) {
                section.classList.add('has-slide-bg');
                let bgEl = section.querySelector('.slide-bg');
                if (!bgEl) {
                    bgEl = document.createElement('div');
                    bgEl.className = 'slide-bg';
                    bgEl.setAttribute('aria-hidden', 'true');
                    section.insertBefore(bgEl, section.firstChild);
                }
                bgEl.style.backgroundImage = `url('${bgSrc}')`;
            }

            section.querySelectorAll('.detailed-feature-item').forEach((item) => {
                gsap.set(item, { clearProps: 'opacity,transform' });
            });
            section.classList.add('items-visible');
        });

        // Bootstrap: put last slide first so the real first feature is in the active slot (nth-child 2)
        const bootstrapSlides = getSlides();
        if (bootstrapSlides.length > 1 && nav) {
            featuresSlider.insertBefore(bootstrapSlides[bootstrapSlides.length - 1], bootstrapSlides[0]);
        }

        const goNext = () => {
            if (sliding) return;
            const slides = getSlides();
            if (slides.length < 2 || !nav) return;
            sliding = true;
            featuresSlider.insertBefore(slides[0], nav);
            window.setTimeout(() => { sliding = false; }, prefersReducedMotion ? 0 : 560);
        };

        const goPrev = () => {
            if (sliding) return;
            const slides = getSlides();
            if (slides.length < 2 || !nav) return;
            sliding = true;
            featuresSlider.insertBefore(slides[slides.length - 1], slides[0]);
            window.setTimeout(() => { sliding = false; }, prefersReducedMotion ? 0 : 560);
        };

        if (nextBtn) nextBtn.addEventListener('click', goNext);
        if (prevBtn) prevBtn.addEventListener('click', goPrev);

        // Click a preview card (3rd–5th) to jump forward in one motion
        featuresSlider.addEventListener('click', (e) => {
            if (e.target.closest('.features-slider-nav')) return;
            const slide = e.target.closest('.detailed-feature-section');
            if (!slide || !featuresSlider.contains(slide)) return;
            const slides = getSlides();
            const index = slides.indexOf(slide);
            if (index < 2 || sliding || !nav) return;
            sliding = true;
            const steps = index - 1;
            for (let i = 0; i < steps; i += 1) {
                const current = getSlides();
                featuresSlider.insertBefore(current[0], nav);
            }
            window.setTimeout(() => { sliding = false; }, prefersReducedMotion ? 0 : 560);
        });

        // Keyboard when section is in view
        featuresSlider.setAttribute('tabindex', '0');
        featuresSlider.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                goNext();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                goPrev();
            }
        });

        // Light swipe on touch
        let touchX = null;
        featuresSlider.addEventListener('touchstart', (e) => {
            touchX = e.changedTouches[0].clientX;
        }, { passive: true });
        featuresSlider.addEventListener('touchend', (e) => {
            if (touchX == null) return;
            const dx = e.changedTouches[0].clientX - touchX;
            touchX = null;
            if (Math.abs(dx) < 40) return;
            if (dx < 0) goNext();
            else goPrev();
        }, { passive: true });
    }

    // Ecosystem Cards Stagger
    gsap.set(".ecosystem-card", { opacity: 0, y: 50 }); // Ensure initial state is hidden
    
    gsap.to(".ecosystem-card", {
        scrollTrigger: {
            trigger: ".ecosystem-section",
            start: "top 75%", // Trigger slightly earlier
            toggleActions: "play none none reverse"
        },
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out"
    });

    // Subtle parallax for hero composing orb (Desktop only)
    if (window.innerWidth > 768) {
        document.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth - 0.5;
            const mouseY = e.clientY / window.innerHeight - 0.5;

            if (document.querySelector('.hero-thinking-orb')) {
                gsap.to('.hero-thinking-orb', {
                    duration: 1,
                    x: mouseX * 16,
                    y: mouseY * 12,
                    ease: 'power1.out'
                });
            }

            gsap.to('.hero-background', {
                duration: 1.5,
                x: mouseX * -30,
                y: mouseY * -30,
                ease: 'power1.out'
            });
        });
    }

    // Ticker Animation (if CSS animation needs JS support or enhancement)
    // The CSS animation is usually sufficient, but we can add pause on hover
    const ticker = document.querySelector('.launch-track');
    if (ticker) {
        ticker.addEventListener('mouseenter', () => {
            ticker.style.animationPlayState = 'paused';
        });
        ticker.addEventListener('mouseleave', () => {
            ticker.style.animationPlayState = 'running';
        });
    }

    // Refresh ScrollTrigger on window load to ensure correct positions after images load
    window.addEventListener("load", () => {
        ScrollTrigger.refresh();
    });
});

