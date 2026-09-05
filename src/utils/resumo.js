/**
 * Chamada curta para o cartão da listagem: o início do primeiro bloco de
 * Texto do post, sem HTML. Quem cadastra escreve o texto uma vez só.
 */
const LIMITE = 140;

const ENTIDADES = {
    nbsp: ' ', amp: '&', quot: '"', apos: "'", lt: '<', gt: '>',
    ccedil: 'ç', Ccedil: 'Ç', atilde: 'ã', Atilde: 'Ã', otilde: 'õ', Otilde: 'Õ',
    aacute: 'á', Aacute: 'Á', eacute: 'é', Eacute: 'É', iacute: 'í', Iacute: 'Í',
    oacute: 'ó', Oacute: 'Ó', uacute: 'ú', Uacute: 'Ú', acirc: 'â', Acirc: 'Â',
    ecirc: 'ê', Ecirc: 'Ê', ocirc: 'ô', Ocirc: 'Ô', agrave: 'à', Agrave: 'À',
    uuml: 'ü', Uuml: 'Ü', ndash: '–', mdash: '—', hellip: '…', laquo: '«', raquo: '»',
    ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’',
};

function decodificar(texto) {
    return texto
        .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
        .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
        .replace(/&([a-zA-Z]+);/g, (m, nome) => ENTIDADES[nome] ?? m);
}

function semHtml(html) {
    return decodificar(
        (html || '')
            .replace(/<br\s*\/?>/gi, ' ')
            .replace(/<[^>]+>/g, ' ')
    )
        .replace(/\s+/g, ' ')
        .trim();
}

function truncar(texto, limite) {
    if (texto.length <= limite) return texto;
    const corte = texto.slice(0, limite);
    const ultimoEspaco = corte.lastIndexOf(' ');
    const base = ultimoEspaco > limite * 0.6 ? corte.slice(0, ultimoEspaco) : corte;
    return `${base.replace(/[\s,;:.]+$/, '')}...`;
}

export function resumoDoPost(pagina, limite = LIMITE) {
    const primeiroTexto = (pagina.Conteudo || []).find(
        (b) => b.__component === 'pagina.texto' || b.__component === 'pagina.midia'
    );
    return truncar(semHtml(primeiroTexto?.Texto), limite);
}
