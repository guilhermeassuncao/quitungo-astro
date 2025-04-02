import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.STRAPI_URL;
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;


export async function getCategories() {
    try {
        const { data } = await axios.get(`${BASE_URL}/categorias`, {
            headers: {
                Authorization: `Bearer ${STRAPI_TOKEN}`,
            },
        });

        return data.data.map((item) => ({
            slug: item.Rota,
            title: item.Nome,
            description: item.Descricao || '',
        }));
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getPagesByCategory(categoryName) {
    try {
        const uri = `/paginas?populate=categorias&filters[categorias][Nome][$eq]=${encodeURIComponent(categoryName)}&populate=Capa.Imagem&populate=Conteudo.Imagem&populate=Conteudo.Video&populate=Conteudo.Documento&populate=Conteudo.Galeria.Imagem&populate=Conteudo.Audio&populate=Conteudo.Imagem.Imagem&populate=categorias&populate=Dados`;

        const { data } = await axios.get(`${BASE_URL}${uri}`, {
            headers: {
                Authorization: `Bearer ${STRAPI_TOKEN}`,
            },
        });

        return data.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}