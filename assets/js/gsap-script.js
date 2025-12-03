/**
 * GSAP Animations for Plan Maestro
 */

document.addEventListener('DOMContentLoaded', () => {
    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Initial Hero Animation
    const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    
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
        .from(".hero-float-card", { 
            y: 100, 
            opacity: 0, 
            duration: 0.8, 
            stagger: 0.15 
        }, "-=0.8");

    // Typing effect for "Pensamiento Docente" if present
    const gradientText = document.querySelector('.hero-title .text-gradient');
    if (gradientText) {
        // Simple scale/pop effect instead of typing to avoid breaking HTML structure
        gsap.from(gradientText, {
            scale: 0.9,
            opacity: 0,
            duration: 1.5,
            delay: 0.5,
            ease: "elastic.out(1, 0.3)"
        });
    }

    // Detailed Features Sections Animation
    const featureSections = document.querySelectorAll('.detailed-feature-section');
    
    featureSections.forEach((section, index) => {
        const direction = index % 2 === 0 ? -50 : 50;
        
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: "top 85%",
                toggleActions: "play none none reverse"
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out"
        });

        // Animate image inside section
        const image = section.querySelector('.detailed-feature-image');
        if (image) {
            gsap.from(image, {
                scrollTrigger: {
                    trigger: section,
                    start: "top 80%",
                },
                scale: 0.95,
                opacity: 0,
                duration: 1,
                delay: 0.2,
                ease: "power2.out"
            });
        }

        // Stagger list items
        const listItems = section.querySelectorAll('.detailed-feature-item');
        if (listItems.length > 0) {
            gsap.from(listItems, {
                scrollTrigger: {
                    trigger: section,
                    start: "top 75%",
                },
                x: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: "power1.out"
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

    // Parallax Effect for Hero Floating Cards
    document.addEventListener("mousemove", (e) => {
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;

        gsap.to(".hero-float-card", {
            duration: 1,
            x: mouseX * 20,
            y: mouseY * 20,
            rotation: mouseX * 5,
            ease: "power1.out"
        });
        
        gsap.to(".hero-background", {
            duration: 1.5,
            x: mouseX * -30,
            y: mouseY * -30,
            ease: "power1.out"
        });
    });

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

