const cors = require('cors');
const express = require('express');
const rp = require('request-promise');
const cheerio = require('cheerio');
const app = express();

const _buscarPalavra = async(nome) => {
  var options = {
    uri: encodeURI(`https://dicionariocriativo.com.br/${nome}`),
    transform: function (body) {
      return cheerio.load(body);
    }
  };
  
  return rp(options)
    .then(async function ($) {
      const palavra = $('#mainContent > header > h1').text().trim().toLowerCase();
      const listaSignificados = $('#significado li');
      const listaSinonimos = $('#sinant li .contentListData a');
      const listaRelacionadas = $('#analogico li');
      const listaExpressoes = $('#expressoes li h3');
      const listaCitacoes = $('#citacoes li .contentListData');

      const listaSignificadosTratados = [];
      const listaSinonimosTratados = [];
      const listaRelacionadasTratados = [];
      const listaExpressoesTratados = [];
      const listaCitacoesTratados = [];

      for(i = 0; i < listaSignificados.length; i++) {
        listaSignificadosTratados.push($(listaSignificados[i]).text());
      }

      for(i = 0; i < listaSinonimos.length; i++) {
        const palavraAtual = $(listaSinonimos[i]).text().trim();
        if(palavra != palavraAtual) {
          listaSinonimosTratados.push(palavraAtual);
        }
      }

      for(i = 0; i < listaRelacionadas.length; i++) {
        const palavraAtual = $(listaRelacionadas[i]).text().trim();
        if(palavra != palavraAtual) {
          listaRelacionadasTratados.push(palavraAtual);
        }
      }

      for(i = 0; i < listaExpressoes.length; i++) {
        listaExpressoesTratados.push($(listaExpressoes[i]).text());
      }

      for(i = 0; i < listaCitacoes.length; i++) {
        listaCitacoesTratados.push($(listaCitacoes[i]).text());
      }

      return {
        palavra,
        listaSignificadosTratados,
        listaSinonimosTratados,
        listaRelacionadasTratados,
        listaExpressoesTratados,
        listaCitacoesTratados
      }
    });
};

app.use(cors());

app.get('/words', async({ query }, expressResponse) => {
  const palavra = await _buscarPalavra(query.nome);

  expressResponse.json({
    id: palavra.palavra,
    nome: palavra.palavra,
    dicionario_significados: palavra.listaSignificadosTratados,
    dicionario_sinonimos: palavra.listaSinonimosTratados,
    palavras_relacionadas: palavra.listaRelacionadasTratados,
    dicionario_expressoes: palavra.listaExpressoesTratados,
    dicionario_citacoes: palavra.listaCitacoesTratados
  });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}`)); 