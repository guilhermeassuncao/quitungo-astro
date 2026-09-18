/**
 * Prefixa um caminho com o `base` configurado em astro.config.mjs.
 * Necessário porque o site é servido em /quitungo-astro/, não na raiz.
 * Use como url("/quem-somos") em qualquer href/src interno.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function url(path = '/') {
    const clean = path.startsWith('/') ? path : `/${path}`;
    return `${BASE}${clean}` || '/';
}
