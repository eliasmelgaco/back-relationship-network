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
      const palavraChave = $('#mainContent > header > h1').text().trim().toLowerCase();

      if (!palavraChave) {
        return null;
      }
      const listaSignificados = $('#significado li');
      const listaSinonimos = $('#sinant li .contentListData a');
      const listaRelacionadas = $('#analogico li');
      const listaExpressoes = $('#expressoes li h3');
      const listaCitacoes = $('#citacoes li .contentListData');

      const listaSignificadosTratados = [];
      const listNode = [];
      const listEdge = [];
      const listaRelacionadasTratados = [];
      const listaExpressoesTratados = [];
      const listaCitacoesTratados = [];

      for(i = 0; i < listaSignificados.length; i++) {
        $(listaSignificados[i]).children('span').remove()
        listaSignificadosTratados.push($(listaSignificados[i]).text().trim());
      }

      for(i = 0; i < listaSinonimos.length; i++) {
        const palavraAtual = $(listaSinonimos[i]).text().trim();
        if(palavraChave != palavraAtual) {
          listNode.push({ data: { id: palavraAtual, weight: i + 2 }});
          listEdge.push({ data: { id: `${palavraChave}${palavraAtual}`, source: palavraChave, target: palavraAtual }});
        }
      }

      for(i = 0; i < listaRelacionadas.length; i++) {
        const palavraAtual = $(listaRelacionadas[i]).text().trim();
        if(palavraChave != palavraAtual) {
          listaRelacionadasTratados.push(palavraAtual);
        }
      }

      for(i = 0; i < listaExpressoes.length; i++) {
        listaExpressoesTratados.push($(listaExpressoes[i]).text());
      }

      for(i = 0; i < listaCitacoes.length; i++) {
        const texto = $(listaCitacoes[i].children[0]).text();
        const autor = $(listaCitacoes[i].children[1]).text();

        listaCitacoesTratados.push({ texto, autor });
      }

      return {
        palavra: palavraChave,
        chart: [
          { data: { id: palavraChave, weight: 1 }},
          ...listNode,
          ...listEdge
        ],
        significados: listaSignificadosTratados,
        relacionados: listaRelacionadasTratados,
        expressoes: listaExpressoesTratados,
        citacoes: listaCitacoesTratados
      }
    });
};

app.use(cors());

app.get('/words', async({ query }, res) => {
  const palavra = await _buscarPalavra(query.nome);

  if (palavra) {
    res.json(palavra);
  } else {
    return res.status(422).json({ status: 422, message: "Não encontrado. Certifique-se de que a palavra está em português." });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}`));
