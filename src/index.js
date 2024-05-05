const express = require("express");
const server = express();
const axios = require("axios");

const BASE_URL =
  "https://tv5hn2gvyijpl76yxlmsy66jwa0nlmxn.lambda-url.us-east-1.on.aws";
const PORT = 3000;

server.get("/filmes", async (_req, res) => {
  try {
    const response = await axios.get(BASE_URL);

    const filmesParseados = response.data.filmes.map((filme) => ({
      titulo: filme.titulo,
      ano: filme.ano,
      diretor: filme.diretor,
      genero: filme.genero,
      duracaoSegundos: filme.duracao * 60,
      notaIMDb: filme.ratings.find((rating) => rating.fonte === "IMDb").valor,
      lucro: calcularLucro(filme.orcamento, filme.bilheteria),
      maiorPremiacao: identificarMaiorPremiacao(filme.premios),
      sinopse: obterSinopse(filme.sinopse),
    }));
    console.log(filmesParseados);

    return res.status(200).json(filmesParseados);
  } catch (error) {
    console.error("Ocorreu um erro:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor." });
  }
});

function calcularLucro(orcamento, bilheteria) {
  let orcamentoValor = parseFloat(
    orcamento.replace(/\$| milhões| bilhões?/g, "")
  );
  let bilheteriaValor = parseFloat(
    bilheteria.replace(/\$| milhões| bilhões?/g, "")
  );

  if (orcamento.includes("bilhão") || orcamento.includes("bilhões"))
    orcamentoValor *= 1e9;
  else orcamentoValor *= 1e6;

  if (bilheteria.includes("bilhão") || bilheteria.includes("bilhões"))
    bilheteriaValor *= 1e9;
  else bilheteriaValor *= 1e6;

  const lucro = bilheteriaValor - orcamentoValor;

  if (Math.abs(lucro) >= 1e9) return `$${(lucro / 1e9).toFixed(1)} bilhões`;
  else return `$${(lucro / 1e6).toFixed(1)} milhões`;
}

function identificarMaiorPremiacao(premios) {
  return premios.reduce(
    (maior, premio) => (premio.relevancia > maior.relevancia ? premio : maior),
    { relevancia: -Infinity }
  ).nome;
}

function obterSinopse(sinopses) {
  const sinopsePT = sinopses.find((sinopse) => sinopse.idioma === "pt-br");
  const sinopseEN = sinopses.find((sinopse) => sinopse.idioma === "en");
  return sinopsePT
    ? sinopsePT.texto
    : sinopseEN
    ? sinopseEN.texto
    : sinopses[0].texto;
}

server.listen(PORT, () => {
  console.log(`Servidor está funcionando na porta ${PORT}.`);
});
