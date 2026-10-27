/**
 * Marca de nuevo1.html: orbe que pasa de libro a esfera y vuelve.
 */
import { mountLogoMarkOrb } from './logo-mark-orb.js';

const brand = { size: 36, label: 'Plan Maestro' };

mountLogoMarkOrb(document.getElementById('preloader-thinking-orb'), {
    size: 36,
    label: 'Cargando Plan Maestro',
});

document.querySelectorAll('.brand-thinking-orb').forEach((host) => {
    mountLogoMarkOrb(host, brand);
});

const heroHost = document.getElementById('hero-thinking-orb');
if (heroHost && !heroHost.hasAttribute('data-dock')) {
    mountLogoMarkOrb(heroHost, {
        size: 360,
        label: 'Plan Maestro',
    });
}

mountLogoMarkOrb(document.getElementById('institutions-thinking-orb'), {
    label: 'Presencia de Plan Maestro en todo el país',
    size: () => {
        const width = window.innerWidth;
        if (width <= 575) return 200;
        if (width <= 991) return 260;
        return 300;
    },
});
