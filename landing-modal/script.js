// Funciones principales de las funcionalidades detalladas
function openFeaturesModal() {
    const featuresSection = document.getElementById('detailedFeatures');
    featuresSection.style.display = 'block';
    
    // Trigger reflow para asegurar que el display: block se aplique
    featuresSection.offsetHeight;
    
    // Agregar clase de animación
    featuresSection.classList.add('show');
    
    // Scroll suave hacia la sección
    setTimeout(() => {
        featuresSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, 200);
    
    // Animación de entrada para las secciones
    const sections = document.querySelectorAll('.feature-section');
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            section.style.transition = 'all 0.6s ease';
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, 500 + (index * 100)); // Delay después de la animación principal
    });
}

function closeDetailedFeatures() {
    const featuresSection = document.getElementById('detailedFeatures');
    featuresSection.classList.remove('show');
    
    // Ocultar después de la animación
    setTimeout(() => {
        featuresSection.style.display = 'none';
    }, 500);
}

function scrollToFeatures() {
    document.getElementById('features').scrollIntoView({
        behavior: 'smooth'
    });
}

function scrollToDetailedFeatures() {
    document.getElementById('detailedFeatures').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Cerrar sección detallada con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeDetailedFeatures();
        }
    });
    
    // Animación de entrada para las cards del hero
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.8s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 200 + 500);
    });
    
    // Animación de entrada para las feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            }
        });
    }, { threshold: 0.1 });
    
    featureCards.forEach(card => {
        observer.observe(card);
    });
    
    // Animación automática para las secciones de funcionalidades detalladas
    const sections = document.querySelectorAll('.feature-section');
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            section.style.transition = 'all 0.6s ease';
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, 1000 + (index * 100)); // Delay después de que cargue la página
    });
    
    // Efecto parallax suave en el hero
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.hero');
        const speed = scrolled * 0.5;
        
        if (parallax) {
            parallax.style.transform = `translateY(${speed}px)`;
        }
    });
    
    // Animación de typing para el título (preserva el markup)
    const titleElement = document.querySelector('.hero-title');
    if (titleElement) {
        const originalNodes = Array.from(titleElement.childNodes);
        titleElement.innerHTML = '';

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const typeTextInto = async (container, text, speed) => {
            const textNode = document.createTextNode('');
            container.appendChild(textNode);
            for (let index = 0; index < text.length; index++) {
                textNode.nodeValue += text.charAt(index);
                await sleep(speed);
            }
        };

        const typeNode = async (node, container, speed) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const content = node.nodeValue || '';
                await typeTextInto(container, content, speed);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const clone = node.cloneNode(false);
                container.appendChild(clone);
                const children = Array.from(node.childNodes);
                for (const child of children) {
                    await typeNode(child, clone, speed);
                }
            }
        };

        (async () => {
            await sleep(500);
            for (const node of originalNodes) {
                await typeNode(node, titleElement, 35);
            }
        })();
    }
    
    // Efecto hover mejorado para los botones
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-modal-primary');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Animación de las feature items al hacer hover
    const featureItems = document.querySelectorAll('.feature-item');
    featureItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(115, 103, 240, 0.15)';
            this.style.transform = 'translateX(10px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.background = 'rgba(115, 103, 240, 0.05)';
            this.style.transform = 'translateX(0) scale(1)';
        });
    });
    
    // Contador animado para las funcionalidades
    const featureCount = document.querySelectorAll('.feature-item').length;
    const createCounter = () => {
        const counterElement = document.createElement('div');
        counterElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--gradient-primary);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: 600;
            box-shadow: var(--shadow);
            z-index: 100;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
        `;
        counterElement.innerHTML = `✨ ${featureCount} funcionalidades disponibles`;
        document.body.appendChild(counterElement);
        
        setTimeout(() => {
            counterElement.style.opacity = '1';
            counterElement.style.transform = 'translateY(0)';
        }, 2000);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            counterElement.style.opacity = '0';
            counterElement.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                document.body.removeChild(counterElement);
            }, 300);
        }, 7000);
    };
    
    setTimeout(createCounter, 3000);
    
    // Efecto de partículas flotantes
    createFloatingParticles();
    
    // Smooth scroll para todos los enlaces
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
});

// Función para crear partículas flotantes
function createFloatingParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
        overflow: hidden;
    `;
    document.body.appendChild(particleContainer);
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            animation: floatParticle ${5 + Math.random() * 10}s infinite linear;
            left: ${Math.random() * 100}%;
            top: 100%;
        `;
        particleContainer.appendChild(particle);
    }
    
    // Agregar la animación CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatParticle {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100vh) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Función para mostrar notificación de bienvenida
function showWelcomeNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        background: var(--gradient-primary);
        color: white;
        padding: 15px 30px;
        border-radius: 50px;
        font-weight: 600;
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        transition: all 0.5s ease;
    `;
    notification.innerHTML = `
        <i class="fas fa-star" style="margin-right: 8px;"></i>
        ¡Bienvenido a Plan Maestro PRIME!
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(-50%) translateY(0)';
    }, 500);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(-50%) translateY(-100px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 4000);
}

// Mostrar notificación después de cargar la página
window.addEventListener('load', () => {
    setTimeout(showWelcomeNotification, 1000);
});

// Función para agregar efectos de sonido (opcional)
function playHoverSound() {
    // Solo si el usuario ha interactuado con la página
    if (window.userInteracted) {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OSdTgwOUarm7blmGgU7k9n1unEiBS13yO/eizEIHWq+8+OWT');
        audio.volume = 0.1;
        audio.play().catch(() => {});
    }
}

// Marcar interacción del usuario
document.addEventListener('click', () => {
    window.userInteracted = true;
});

// Agregar efectos de hover con sonido
document.addEventListener('DOMContentLoaded', () => {
    const interactiveElements = document.querySelectorAll('button, .feature-item, .card');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', playHoverSound);
    });
});

// Función para mostrar estadísticas en tiempo real
function showRealTimeStats() {
    const stats = [
        { label: 'Funcionalidades', value: 47, icon: '⚡' },
        { label: 'Herramientas IA', value: 8, icon: '🤖' },
        { label: 'Formatos', value: 12, icon: '📄' },
        { label: 'Niveles', value: "EBI - EMS", icon: '🎓' }
    ];
    
    const statsContainer = document.createElement('div');
    statsContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 15px;
        padding: 20px;
        box-shadow: var(--shadow-lg);
        z-index: 100;
        opacity: 0;
        transform: translateX(-100px);
        transition: all 0.5s ease;
    `;
    
    stats.forEach(stat => {
        const statElement = document.createElement('div');
        statElement.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
            font-weight: 600;
        `;
        statElement.innerHTML = `
            <span style="font-size: 1.2rem;">${stat.icon}</span>
            <span style="color: var(--primary-color);">${stat.value}</span>
            <span style="color: var(--text-secondary);">${stat.label}</span>
        `;
        statsContainer.appendChild(statElement);
    });
    
    document.body.appendChild(statsContainer);
    
    setTimeout(() => {
        statsContainer.style.opacity = '1';
        statsContainer.style.transform = 'translateX(0)';
    }, 5000);
    
    // Remover después de 10 segundos
    setTimeout(() => {
        statsContainer.style.opacity = '0';
        statsContainer.style.transform = 'translateX(-100px)';
        setTimeout(() => {
            if (document.body.contains(statsContainer)) {
                document.body.removeChild(statsContainer);
            }
        }, 500);
    }, 15000);
}

// Mostrar estadísticas después de un tiempo
setTimeout(showRealTimeStats, 8000);
