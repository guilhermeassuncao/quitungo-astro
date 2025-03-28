import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.STRAPI_URL;
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;


export async function getCategories(uri) {
    try {
        const { data } = await axios.get(`${BASE_URL}${uri}`, {
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
