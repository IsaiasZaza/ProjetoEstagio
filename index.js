const express = require('express');
const server = express();
const axios = require('axios');

server.get('/filmes', async (req, res) => {
    try {
        const response = await axios.get('https://tv5hn2gvyijpl76yxlmsy66jwa0nlmxn.lambda-url.us-east-1.on.aws');
        const filmesParseados = response.data.filmes.map(filme => ({
            titulo: filme.titulo,
            ano: filme.ano,
            diretor: filme.diretor,
            genero: filme.genero,
            duracaoSegundos: filme.duracao * 60,
            notaIMDb: filme.ratings.find(rating => rating.fonte === 'IMDb').valor,
            lucro: calcularLucro(filme.orcamento, filme.bilheteria), 
            maiorPremiacao: identificarMaiorPremiacao(filme.premios),
            sinopse: obterSinopse(filme.sinopse)
        }));
        
        console.log(filmesParseados)
    } catch (error) {
        console.error('Ocorreu um erro:', error);
    }
});

function calcularLucro(orcamento, bilheteria) {
    console.log(orcamento)
    let orcamentoValor = parseFloat(orcamento.replace(/\$| milhões| bilhões/g, ''));

    // Verifica se o orçamento está em milhões ou bilhões
    if (orcamento.includes('bilhões')) {
        orcamentoValor *= 1e9; // Se estiver em bilhões, multiplica por 1 bilhão
    } else {
        orcamentoValor *= 1e6; // Caso contrário, multiplica por 1 milhão
    }

    let bilheteriaValor = parseFloat(bilheteria.replace(/\$| milhões| bilhões/g, ''));

    // Verifica se a bilheteria está em milhões ou bilhões
    if (bilheteria.includes('bilhões')) {
        bilheteriaValor *= 1e9; // Se estiver em bilhões, multiplica por 1 bilhão
    } else {
        bilheteriaValor *= 1e6; 
    }


    let lucro = (bilheteriaValor) - orcamentoValor  ;

    // Formata o resultado em milhões ou bilhões de dólares, conforme necessário
    if (Math.abs(lucro) >= 1e9) {
        return `${(lucro / 1e9).toFixed(1)} bilhões`;
    } else {
        return `${(lucro / 1e6).toFixed(1)} milhões`;
    }
}


function identificarMaiorPremiacao(premios) {
    const maiorPremiacao = premios.reduce((maior, premio) => (premio.relevancia > maior.relevancia ? premio : maior), { relevancia: -Infinity });
    return maiorPremiacao.nome;
}

function obterSinopse(sinopses) {
    const sinopsePT = sinopses.find(sinopse => sinopse.idioma === 'pt-br');
    const sinopseEN = sinopses.find(sinopse => sinopse.idioma === 'en');
    return sinopsePT ? sinopsePT.texto : (sinopseEN ? sinopseEN.texto : sinopses[0].texto);
}

server.listen(3000, () => {
    console.log('Servidor está funcionando.');
});
