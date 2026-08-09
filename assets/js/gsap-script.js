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

    // Detailed Features: stacking cards (GSAP pin — CSS sticky fails with body overflow-x:hidden)
    const featuresStack = document.querySelector('#lanzamiento2026 .features-stack');
    const featureSections = gsap.utils.toArray('#lanzamiento2026 .features-stack .detailed-feature-section');
    const navbar = document.querySelector('.navbar.fixed-top');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let featureStackTriggers = [];

    const getFeaturesPinTop = () => {
        const navHeight = navbar ? navbar.offsetHeight : 80;
        const stackGap = window.innerWidth < 576 ? 8 : 14;
        return navHeight + stackGap;
    };

    const killFeatureStack = () => {
        featureStackTriggers.forEach((st) => st.kill());
        featureStackTriggers = [];
    };

    const initFeatureStack = () => {
        killFeatureStack();
        if (!featuresStack || !featureSections.length || prefersReducedMotion) return;

        const pinTop = getFeaturesPinTop();
        featuresStack.style.setProperty('--features-stack-top', `${pinTop}px`);

        featureSections.forEach((section, index) => {
            section.style.setProperty('--stack-z', String(index + 1));
            gsap.set(section, { zIndex: index + 1 });

            const st = ScrollTrigger.create({
                trigger: section,
                start: () => `top ${getFeaturesPinTop()}px`,
                endTrigger: featuresStack,
                end: 'bottom bottom',
                pin: true,
                pinSpacing: false,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                id: `feature-stack-${index}`
            });
            featureStackTriggers.push(st);
        });
    };

    initFeatureStack();
    window.addEventListener('load', () => {
        ScrollTrigger.refresh();
    });

    let featureStackResizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(featureStackResizeTimer);
        featureStackResizeTimer = setTimeout(() => {
            initFeatureStack();
            ScrollTrigger.refresh();
        }, 150);
    });

    // Recalculate after expand/collapse of mobile feature lists
    document.querySelectorAll('#lanzamiento2026 .feature-list-toggle').forEach((btn) => {
        btn.addEventListener('click', () => {
            setTimeout(() => ScrollTrigger.refresh(), 420);
        });
    });

    featureSections.forEach((section) => {
        const image = section.querySelector('.detailed-feature-image');
        if (image) {
            gsap.from(image, {
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                },
                scale: 0.97,
                duration: 0.9,
                delay: 0.1,
                ease: 'power2.out'
            });
        }

        const listItems = section.querySelectorAll('.detailed-feature-item');
        if (listItems.length > 0) {
            gsap.from(listItems, {
                scrollTrigger: {
                    trigger: section,
                    start: 'top 75%',
                },
                x: 20,
                duration: 0.5,
                stagger: 0.1,
                ease: 'power1.out'
            });
        }
    });

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

