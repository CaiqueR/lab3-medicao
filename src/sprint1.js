/* eslint-disable comma-dangle */
/* eslint-disable no-await-in-loop */
const { Headers } = require("node-fetch");
const converter = require("json-2-csv");
const fs = require("fs");
const axios = require("axios").default;

require("dotenv").config();

global.Headers = global.Headers || Headers;

const repositoriosParaBuscar = ["java", "python"];

async function resposta1() {
  let repos = [];

  repositoriosParaBuscar.forEach(async (repoParaBuscar) => {
    const { data: result } = await axios.post(
      "https://api.github.com/graphql",
      {
        query: `
          query {
            search(type: REPOSITORY query: "stars:>500 language:${repoParaBuscar}" first: 100) {
                nodes {
                  ... on Repository {
                    nameWithOwner
                    createdAt
                    stargazers {
                      totalCount
                    }
                    url
                  }
                }
                pageInfo {
                  startCursor
                  endCursor
                  hasNextPage
                  hasPreviousPage
                }
              }
            
          }
      `,
        variables: {},
      },
      {
        headers: { Authorization: `bearer ${process.env.GITHUB_TOKEN}` },
      }
    );

    const {
      search: { nodes },
    } = result.data;

    repos = [...repos, ...nodes];

    converter.json2csv(repos, (err, csv) => {
      if (err) {
        throw err;
      }

      fs.writeFileSync(`./csv/${repoParaBuscar}.csv`, csv);
    });

    repos = [];

    console.log(`${repoParaBuscar} gerado na pasta csv com sucesso!`);
  });
}

resposta1();
