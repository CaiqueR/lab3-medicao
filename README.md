# Laboratório de Experimentação e Medição de Software

### Nome: Caique Ribeiro de Oliveira

### Professor: Humberto Torres Marques Neto

<br />

## Sprint 1

Entregar arquivo .csv com a lista dos top-100 repositórios Java e os
top-100 repositórios Python, bem como os scripts de coleta utilizados para mineração e análise dos repositórios.

<br />

## Execução

Para executar o projeto é necessário ter o NodeJS instalado.
É necessário criar um arquivo na raiz do projeto com nome `.env` e colocar `GITHUB_TOKEN=Seu token`

Após ter feito isso é só executar:

```bash
npm install
```

E logo após:

```bash
node src/sprint1.js
```

Com isso será gerado o csv na raíz do projeto.

O código fonte pode ser encontrado em `src/sprint1.js` e o CSV pode ser encontrado em nas pasta `csv`
