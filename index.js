import {promises as fs} from 'fs';
import { stdout } from 'process';
import readline from 'readline'

///link: https://github.com/felipefdl/cidades-estados-brasil-json

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

init().then((resp) => {
    createJsonEstados(resp);
    let {ComMaisCidades, ComMenosCidades } = MostCitiesStates(resp,5)
    console.log("\nEstados com maior quantidade de cidades:\n");
    console.log(ComMaisCidades.map(x => { return { Nome: x["Nome"], Cidades: x["Cidades"].length } }));
    console.log("\nEstados com menores quantidade de cidades:\n");
    console.log(ComMenosCidades.map(x => { return { Nome: x["Nome"], Cidades: x["Cidades"].length } }));

    let {MaioresNomes, MenoresNomes} = BiggestCitiesNames(resp,5)
    console.log("\nMaiores nomes de Cidades por Estado:\n");
    console.log(MaioresNomes.map(x => { return { Nome: x.Nome, MaiorNome: x.MaiorNomeCidade.Nome}}));

    console.log("\nMenores nomes de Cidades por Estado:\n");
    console.log(MenoresNomes.map(x => { return { Nome: x.Nome, MenorNome: x.MenorNomeCidade.Nome}}));

    console.log("\nMaior nome de uma cidade de um Estado:\n");
    console.log(MaioresNomes
        .map(x => { 
            return { Nome: x.Nome, MaiorNome: x.MaiorNomeCidade.Nome}})
        .reduce((a,b) => {
            return (a["MaiorNome"].length > b["MaiorNome"].length ? a : b)
    }));

    console.log("\nMenor nome de uma cidade de um Estado:\n");
    console.log(MenoresNomes
        .map(x => { 
            return { Nome: x.Nome, MenorNome: x.MenorNomeCidade.Nome}})
        .reduce((a,b) => {
            return (a["MenorNome"].length < b["MenorNome"].length ? a : b)
    }));

    pergunta();
});

async function init() {
    try {
        const cidades = JSON.parse(await fs.readFile("Cidades.json", "utf-8"));
        const estados = JSON.parse(await fs.readFile("Estados.json", "utf-8"));
        const estadosCidades = estados.map(x => {
            return {
                ID: x["ID"],
                Sigla: x["Sigla"],
                Nome: x["Nome"],
                Cidades: cidades.filter(y => y["Estado"] === x["ID"])
                    .map(z => { 
                        return {
                            ID: z["ID"], 
                            Nome: z["Nome"]
                        }
                    })
                    .sort((a,b) => b["Nome"] - a["Nome"])
                                
            }
        })
        .sort((a,b) => a["Sigla"] - b["Sigla"]);
        
        console.log(estadosCidades.map(x => x["Nome"]));
        
        return estadosCidades;
    } catch(err) {
        console.log(err);
    }
}

async function createJsonEstados(estadosCidades)
{
    try {
        //console.log(estadosCidades);
        estadosCidades.map(x => fs.writeFile(`src/${x["Sigla"]}.json`, 
            JSON.stringify(x["Cidades"])));
    } catch(err) {
        console.log(err);
    }
}

async function pergunta() {
    
    rl.question("Informe a UF: ", uf => {
        if(uf === "exit")
            rl.close();
        else {
            //console.log(uf);
            search(uf);
            pergunta();
        }
    });
}

async function search(uf) {
    try{
        let path = `src/${uf}.json`;
        const file = await fs.readFile(path, 'utf-8');
        //console.log(file.map(x => x["Cidades"].length));
        //console.log(file);
        console.log(JSON.parse(file).length);
    }catch(err) {
        console.error("\nUF incorreta!!!");
    }
}

function MostCitiesStates(estadosCidades, qtde=5) {
    let sortEstados = estadosCidades.sort((a,b) => {return b["Cidades"].length - a["Cidades"].length});
    return { 
        ComMaisCidades: sortEstados.filter((x,i) => i < qtde), 
        ComMenosCidades: sortEstados.filter((x,i) => i >= estadosCidades.length - qtde)
    }
}

function BiggestCitiesNames(estadosCidades) {
    return {
        MaioresNomes: estadosCidades.map(x => { 
            return { 
                Nome: x["Nome"], 
                MaiorNomeCidade: x["Cidades"].reduce((a,b) => {
                    return (a["Nome"].length > b["Nome"].length ? a : b)
                })
            }
        })
        ,
        MenoresNomes: estadosCidades.map(x => { 
            return { 
                Nome: x["Nome"], 
                MenorNomeCidade: x["Cidades"].reduce((a,b) => {
                    return (a["Nome"].length < b["Nome"].length ? a : b)
                })
            }
        })
    }
}