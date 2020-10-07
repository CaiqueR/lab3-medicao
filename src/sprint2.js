/* eslint-disable no-restricted-syntax */
/* eslint-disable no-inner-declarations */
/* eslint-disable guard-for-in */
/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable comma-dangle */
/* eslint-disable no-await-in-loop */
const converter = require("json-2-csv");
const fs = require("fs");
const axios = require("axios").default;
const { DateTime } = require("luxon");
const path = require("path");
const sloc = require("node-sloc");

const absPath = path.resolve("./repos");
const shell = require("async-shelljs");

require("dotenv").config();

process.setMaxListeners(22);
const repositoriosParaBuscar = ["java", "python"];

async function resposta1() {
  console.log("Limpando a pasta repos");
  shell.exec("rm -rf ./repos/*");

  console.log("Buscando repositórios");
  repositoriosParaBuscar.forEach(async (repoParaBuscar) => {
    const { data: result } = await axios.post(
      "https://api.github.com/graphql",
      {
        query: `
          query {
            search(type: REPOSITORY query: "stars:>1000 language:${repoParaBuscar}" first: 100) {
                nodes {
                  ... on Repository {
                    name
                    nameWithOwner
                    createdAt
                    stargazers {
                      totalCount
                    }
                    url
                    releases {
                      totalCount
                    }
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

    const newNodes = nodes.map((node) => {
      const {
        createdAt,
        releases: { totalCount },
      } = node;

      const date = DateTime.fromISO(createdAt)
        .setZone("America/Sao_Paulo")
        .setLocale("pt-BR");

      const currentDate = DateTime.local()
        .setZone("America/Sao_Paulo")
        .setLocale("pt-BR");

      const { days: dateOfCreationInDays } = currentDate
        .diff(date, ["days"])
        .toObject();

      const newNo = {
        ...node,
        totalReleases: totalCount,
        mediaReleaseDays: totalCount / dateOfCreationInDays,
      };

      delete newNo.releases;
      return newNo;
    });

    console.log(
      `Mineração ${repoParaBuscar} terminada. Começando a clonagem dos repositórios...`
    );
    if (repoParaBuscar === "java") {
      converter.json2csv(newNodes, (err, csv) => {
        if (err) {
          throw err;
        }

        fs.writeFileSync("../csv/javaSprint2.csv", csv);
      });
      shell.cd(absPath);

      const promises = newNodes.map((repositorio) =>
        shell.asyncExec(
          `git clone https://github.com/${
            repositorio.nameWithOwner
          } ${repositorio.nameWithOwner.replace("/", "-")} --depth 1`
        )
      );

      await Promise.all(promises);

      await shell.asyncExec("find -type l -exec unlink {} \\;");

      const promises2 = newNodes.map(async (repositorio) => {
        const { sloc: repoInfos } = await sloc({
          path: `../repos/${repositorio.nameWithOwner.replace("/", "-")}`,
          ignorePaths: ["node_modules", "localhost"],
          ignoreDefault: false,
        });
        return {
          repoName: repositorio.nameWithOwner,
          loc: repoInfos.loc,
          sloc: repoInfos.sloc,
          comments: repoInfos.comments,
        };
      });

      const reposWithSLOC = await Promise.all(promises2);
      converter.json2csv(reposWithSLOC, (err, csv) => {
        if (err) {
          throw err;
        }

        fs.writeFileSync("../csv/javaSLOC.csv", csv);
      });

      console.log("Java SLOC Gerado");
    } else {
      converter.json2csv(newNodes, (err, csv) => {
        if (err) {
          throw err;
        }

        fs.writeFileSync("../csv/pythonSprint2.csv", csv);
      });

      shell.cd(absPath);

      const promises = newNodes.map((repositorio) =>
        shell.asyncExec(
          `git clone https://github.com/${
            repositorio.nameWithOwner
          } ${repositorio.nameWithOwner.replace("/", "-")} --depth 1`
        )
      );

      await Promise.all(promises);

      await shell.asyncExec("find -type l -exec unlink {} \\;");

      const promises2 = newNodes.map(async (repositorio) => {
        const { sloc: repoInfos } = await sloc({
          path: `../repos/${repositorio.nameWithOwner.replace("/", "-")}`,
          ignorePaths: ["node_modules", "localhost"],
          ignoreDefault: false,
        });
        return {
          repoName: repositorio.nameWithOwner,
          loc: repoInfos.loc,
          sloc: repoInfos.sloc,
          comments: repoInfos.comments,
        };
      });

      const reposWithSLOC = await Promise.all(promises2);
      converter.json2csv(reposWithSLOC, (err, csv) => {
        if (err) {
          throw err;
        }

        fs.writeFileSync("../csv/pythonSLOC.csv", csv);
      });

      console.log("Python SLOC Gerado");
    }
  });
}

resposta1();
