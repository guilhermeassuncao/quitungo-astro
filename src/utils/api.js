import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.STRAPI_URL;
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

if (!BASE_URL || !STRAPI_TOKEN) {
    throw new Error(
        'STRAPI_URL e STRAPI_TOKEN precisam estar definidos (arquivo .env ou secrets do GitHub).'
    );
}

const http = axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
    timeout: 60_000,
});

/** Tudo que a dynamic zone "Conteudo" pode conter e precisa vir populado. */
const POPULATE_CONTEUDO = [
    'populate=Conteudo.Imagem',
    'populate=Conteudo.Imagem.Imagem',
    'populate=Conteudo.Video',
    'populate=Conteudo.Audio',
    'populate=Conteudo.Documento',
    'populate=Conteudo.Galeria.Imagem',
].join('&');

const PAGE_SIZE = 100;

/**
 * Busca uma coleção inteira, percorrendo todas as páginas da API.
 * O Strapi limita cada resposta (25 por padrão, 100 no máximo); sem isto,
 * uma categoria com mais de 25 posts perderia conteúdo no build.
 */
async function fetchAll(path) {
    const sep = path.includes('?') ? '&' : '?';
    const items = [];
    let page = 1;
    let pageCount = 1;

    do {
        const { data } = await http.get(
            `${path}${sep}pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}`
        );
        items.push(...data.data);
        pageCount = data.meta?.pagination?.pageCount ?? 1;
        page += 1;
    } while (page <= pageCount);

    return items;
}

function logErro(contexto, error) {
    const status = error.response?.status;
    const detalhe = error.response?.data?.error?.message || error.message;
    console.error(`[strapi] ${contexto}: ${status ? `HTTP ${status} - ` : ''}${detalhe}`);
}

export async function getCategories() {
    try {
        const data = await fetchAll('/categorias?sort=id:asc');
        return data.map((item) => ({
            slug: item.Rota,
            title: item.Nome,
            description: item.Descricao || '',
        }));
    } catch (error) {
        logErro('categorias', error);
        return [];
    }
}

/**
 * Posts de uma categoria, pelo slug (campo Rota). Filtrar pelo slug em vez do
 * nome evita quebrar a associação quando a categoria é renomeada no painel.
 */
export async function getPagesByCategory(slug) {
    if (!slug) return [];
    try {
        const uri =
            `/paginas?sort[0]=publishedAt:desc` +
            `&filters[categorias][Rota][$eq]=${encodeURIComponent(slug)}` +
            `&populate=categorias&populate=Capa.Imagem&${POPULATE_CONTEUDO}`;
        return await fetchAll(uri);
    } catch (error) {
        logErro(`paginas da categoria "${slug}"`, error);
        return [];
    }
}

async function getSingleType(path, contexto) {
    try {
        const { data } = await http.get(`${path}?${POPULATE_CONTEUDO}`);
        return data.data;
    } catch (error) {
        // 404 = single type nunca preenchido no painel; não é erro de build.
        if (error.response?.status !== 404) logErro(contexto, error);
        return null;
    }
}

export function getPageQuemSomos() {
    return getSingleType('/historia', 'quem-somos');
}

export function getPageAmigosParceiros() {
    return getSingleType('/amigos', 'amigos-e-parceiros');
}
