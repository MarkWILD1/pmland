/**
 * Orbe del hero en nuevo1-scroll.html.
 * Arranca grande al centro y, con el scroll, se achica hasta la columna derecha.
 * El canvas se dibuja al tamaño grande; el viaje solo usa translate y scale hacia abajo.
 */
import { mountLogoMarkOrb } from './logo-mark-orb.js';

const host = document.getElementById('hero-thinking-orb');
const flight = document.querySelector('.hero-orb-flight');
const pin = document.querySelector('.hero-pin');
const runway = document.querySelector('.hero-runway');
const slot = document.querySelector('.hero-dock-slot');
const reveal = document.querySelector('.hero-reveal');
const cue = document.querySelector('.hero-scroll-cue');
const navbar = document.querySelector('.navbar');
const whatsapp = document.querySelector('.whatsapp-float');
const curtainNav = document.querySelector('.curtain-nav');

if (host && flight && pin && runway && slot && reveal) {
    const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const dockSize = () => {
        const width = window.innerWidth;
        const short = window.innerHeight <= 740;
        if (width <= 575) return short ? 144 : 240;
        if (width <= 991) return short ? 240 : 300;
        return 360;
    };

    const mountSize = () => {
        if (reducedQuery.matches) return dockSize();
        const large = Math.min(560, Math.round(window.innerHeight * 0.62));
        return Math.max(dockSize(), large);
    };

    const mobileNavQuery = window.matchMedia('(max-width: 991.98px)');

    const setChrome = (shown) => {
        const open = shown > 0.92;
        // En mobile el menú vive detrás de la hamburguesa. La barra ya es visible
        // (opacity forzada) y tiene que recibir el toque desde el primer pantallazo.
        const navReady = mobileNavQuery.matches;
        [navbar, whatsapp, curtainNav].forEach((el) => {
            if (!el) return;
            const ready = el === navbar && navReady;
            el.style.opacity = String(ready ? 1 : shown);
            el.style.pointerEvents = ready || open ? 'auto' : 'none';
            if (ready || open) el.removeAttribute('inert');
            else el.setAttribute('inert', '');
        });
    };

    if (reducedQuery.matches) {
        runway.classList.add('is-settled');
        slot.appendChild(flight);
        setChrome(1);
    }

    mountLogoMarkOrb(host, {
        size: mountSize,
        label: 'Plan Maestro',
    });

    if (!reducedQuery.matches) {
        let raf = 0;

        const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
        const ease = (t) => t * t * (3 - 2 * t);

        const apply = () => {
            raf = 0;
            const canvas = host.querySelector('canvas');
            const size = canvas ? canvas.offsetWidth : mountSize();
            if (!size) return;

            const pinRect = pin.getBoundingClientRect();
            const slotRect = slot.getBoundingClientRect();
            if (!slotRect.width) return;

            const travel = runway.offsetHeight - window.innerHeight;
            const raw = travel <= 0
                ? 1
                : clamp(-runway.getBoundingClientRect().top / travel, 0, 1);
            const t = ease(raw);

            const startX = pinRect.width / 2;
            const startY = pinRect.height / 2;
            const endX = slotRect.left - pinRect.left + slotRect.width / 2;
            const endY = slotRect.top - pinRect.top + slotRect.height / 2;
            const x = startX + (endX - startX) * t;
            const y = startY + (endY - startY) * t;
            const scale = 1 + (slotRect.width / size - 1) * t;

            flight.style.left = `${x - size / 2}px`;
            flight.style.top = `${y - size / 2}px`;
            flight.style.transform = `scale(${scale})`;

            const shown = clamp((t - 0.35) / 0.65, 0, 1);
            reveal.style.opacity = String(shown);
            reveal.style.pointerEvents = shown > 0.92 ? 'auto' : 'none';
            setChrome(shown);
            if (cue) cue.style.opacity = String(1 - clamp(t / 0.3, 0, 1));
        };

        const request = () => {
            if (!raf) raf = requestAnimationFrame(apply);
        };

        apply();
        window.addEventListener('scroll', request, { passive: true });
        window.addEventListener('resize', request);
    }
}
