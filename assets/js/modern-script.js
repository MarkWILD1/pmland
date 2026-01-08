// ===== MODERN SCRIPT FOR PLAɳ MAEŠTRɸ =====

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize AOS (Animate On Scroll)
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: false,
        mirror: true,
        offset: 100,
        delay: 0,
        anchorPlacement: 'top-bottom'
    });

    // Preloader
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', function() {
            preloader.style.opacity = '0';
            setTimeout(function() {
                preloader.style.display = 'none';
            }, 500);
        });
    }

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(31, 41, 55, 0.98)';
                navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.3)';
            } else {
                navbar.style.background = 'rgba(31, 41, 55, 0.95)';
                navbar.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.1)';
            }
        });
    }

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active navigation link highlighting
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.navbar-nav .nav-link');

    window.addEventListener('scroll', function() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    });

    // Enhanced AOS refresh for better scroll up/down animations
    let lastScrollTop = 0;
    let scrollTimeout;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Clear previous timeout
        clearTimeout(scrollTimeout);
        
        // Set a new timeout to handle scroll end
        scrollTimeout = setTimeout(function() {
            refreshVisibleAnimations();
        }, 150);
        
        lastScrollTop = scrollTop;
    });

    // Function to refresh animations for visible elements
    function refreshVisibleAnimations() {
        const aosElements = document.querySelectorAll('[data-aos]');
        aosElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible) {
                // Element is visible, ensure animation is active
                if (!element.classList.contains('aos-animate')) {
                    element.classList.add('aos-animate');
                }
            } else {
                // Element is not visible, reset animation state
                element.classList.remove('aos-animate');
            }
        });
    }

    // Function to reinitialize AOS for better control
    function reinitializeAOS() {
        AOS.refresh();
        refreshVisibleAnimations();
    }

    // Reinitialize AOS on window resize and orientation change
    window.addEventListener('resize', reinitializeAOS);
    window.addEventListener('orientationchange', reinitializeAOS);

    // Counter animation for stats
    const stats = document.querySelectorAll('.stat-item h3');
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    };

    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalValue = target.textContent;
                const isNumber = !isNaN(finalValue);
                
                if (isNumber) {
                    animateCounter(target, 0, parseInt(finalValue), 2000);
                }
                statsObserver.unobserve(target);
            }
        });
    }, observerOptions);

    stats.forEach(stat => {
        statsObserver.observe(stat);
    });

    function animateCounter(element, start, end, duration) {
        const startTime = performance.now();
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.floor(start + (end - start) * progress);
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }
        
        requestAnimationFrame(updateCounter);
    }

    // Parallax effect for hero section - DISABLED (Handled by GSAP)
    /*
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            heroSection.style.transform = `translateY(${rate}px)`;
        });
    }
    */

    // Feature cards hover effect
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Ecosystem cards hover effect
    const ecosystemCards = document.querySelectorAll('.ecosystem-card');
    ecosystemCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Button glow effect
    const glowButtons = document.querySelectorAll('.btn-glow');
    glowButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 0 30px rgba(99, 102, 241, 0.5)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.boxShadow = '';
        });
    });

    // WhatsApp button pulse animation
    const whatsappButton = document.querySelector('.whatsapp-float');
    if (whatsappButton) {
        setInterval(function() {
            whatsappButton.style.animation = 'pulse 2s infinite';
        }, 3000);
    }

    // Add pulse animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.1);
            }
            100% {
                transform: scale(1);
            }
        }
    `;
    document.head.appendChild(style);

    // Typing effect for hero title - DISABLED (Handled by GSAP)
    /*
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        // Store the original HTML structure
        const originalHTML = heroTitle.innerHTML;
        
        // Extract text content without HTML tags
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = originalHTML;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        
        // Clear the title
        heroTitle.innerHTML = '';
        
        let i = 0;
        const typeWriter = function() {
            if (i < textContent.length) {
                // Simple approach: just show the text without HTML for typing effect
                heroTitle.textContent = textContent.substring(0, i + 1);
                i++;
                setTimeout(typeWriter, 50);
            } else {
                // When typing is complete, restore the original HTML with gradient
                heroTitle.innerHTML = originalHTML;
            }
        };
        
        // Start typing effect after a delay
        setTimeout(typeWriter, 1000);
    }
    */

    // Lazy loading for images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => {
        imageObserver.observe(img);
    });

    // Close mobile menu when clicking on a link (using Bootstrap API)
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarCollapse && typeof bootstrap !== 'undefined') {
        // Close mobile menu when clicking on a link
        const mobileNavLinks = navbarCollapse.querySelectorAll('.nav-link');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', function() {
                // Use Bootstrap API to hide the collapse
                const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                if (bsCollapse) {
                    bsCollapse.hide();
                } else {
                    // Fallback: create new instance and hide
                    const collapse = new bootstrap.Collapse(navbarCollapse, {
                        toggle: false
                    });
                    collapse.hide();
                }
            });
        });
    }

    // Back to top button
    const backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopButton.className = 'back-to-top';
    backToTopButton.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 50px;
        height: 50px;
        background: var(--secondary-color);
        color: var(--dark-color);
        border: none;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 999;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    `;
    
    document.body.appendChild(backToTopButton);

    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopButton.style.opacity = '1';
            backToTopButton.style.visibility = 'visible';
        } else {
            backToTopButton.style.opacity = '0';
            backToTopButton.style.visibility = 'hidden';
        }
    });

    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Form validation (if any forms exist)
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // Add your form validation logic here
            console.log('Form submitted');
        });
    });

    // Performance optimization: Debounce scroll events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Apply debounce to scroll events
    const debouncedScrollHandler = debounce(function() {
        // Scroll event logic here
    }, 10);

    window.addEventListener('scroll', debouncedScrollHandler);

    // Console welcome message
    console.log(`
        🎓 Plaɳ MaeŠtrɸ - La Calculadora del Pensamiento Docente Uruguayo
        🚀 Desarrollado con ❤️ por Marcos Mello
        📧 Contacto: soporte@plan-maestro.com
        🌐 Visita: https://prime.plan-maestro.com
    `);

});

// Additional utility functions
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function addClassToElement(element, className) {
    if (element && !element.classList.contains(className)) {
        element.classList.add(className);
    }
}

function removeClassFromElement(element, className) {
    if (element && element.classList.contains(className)) {
        element.classList.remove(className);
    }
}

// Export functions for potential use in other scripts
window.PlanMaestroUtils = {
    isElementInViewport,
    addClassToElement,
    removeClassFromElement
};

// ===== PARALLAX EFFECTS =====
class ParallaxEffect {
    constructor() {
        this.isMobile = window.matchMedia('(max-width: 768px)').matches;
        this.parallaxElements = document.querySelectorAll('[data-speed]');
        this.parallaxSections = document.querySelectorAll('.parallax-section');
        this.isScrolling = false;
        this.ticking = false;
        
        this.init();
    }
    
    init() {
        if (this.isMobile) {
            return;
        }
        if (this.parallaxElements.length > 0) {
            this.bindEvents();
            this.updateParallax();
        }
    }
    
    bindEvents() {
        // Throttled scroll event for better performance
        window.addEventListener('scroll', () => {
            if (!this.ticking) {
                requestAnimationFrame(() => {
                    this.updateParallax();
                    this.ticking = false;
                });
                this.ticking = true;
            }
        });
        
        // Resize event for responsive behavior
        window.addEventListener('resize', () => {
            this.updateParallax();
        });
        
        // Touch events for mobile
        let touchStartY = 0;
        let touchEndY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchmove', (e) => {
            touchEndY = e.touches[0].clientY;
            this.updateParallax();
        });
    }
    
    updateParallax() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        this.parallaxElements.forEach(element => {
            const speed = parseFloat(element.getAttribute('data-speed')) || 0.5;
            const yPos = -(scrolled * speed);
            
            // Apply transform with hardware acceleration
            element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
        
        // Update section backgrounds
        this.parallaxSections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.1;
            
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const bg = section.querySelector('.parallax-bg');
                if (bg) {
                    const speed = parseFloat(bg.getAttribute('data-speed')) || 0.2;
                    const yPos = -(scrolled * speed);
                    bg.style.transform = `translate3d(0, ${yPos}px, 0)`;
                }
            }
        });
    }
    
    // Smooth parallax animation
    smoothParallax() {
        this.parallaxElements.forEach(element => {
            element.style.transition = 'transform 0.1s ease-out';
        });
    }
    
    // Disable parallax on mobile for better performance
    disableOnMobile() {
        if (window.innerWidth <= 768) {
            this.parallaxElements.forEach(element => {
                element.style.transform = 'none';
            });
        }
    }
}



// Initialize parallax effect
document.addEventListener('DOMContentLoaded', () => {
    // Initialize existing functionality
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: true,
            offset: 100
        });
    }
    
    // Initialize parallax
    const parallax = new ParallaxEffect();
    

    
    // Preloader
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
    
    // Enhanced floating animations
    const floatingElements = document.querySelectorAll('.floating-icon');
    floatingElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            element.style.animationPlayState = 'paused';
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.animationPlayState = 'running';
        });
    });
    
    // Performance optimization for parallax
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            parallax.smoothParallax();
        }, 100);
    });
});

// Intersection Observer for better performance
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
        }
    });
}, observerOptions);

// Observe parallax sections
document.querySelectorAll('.parallax-section').forEach(section => {
    observer.observe(section);
});
