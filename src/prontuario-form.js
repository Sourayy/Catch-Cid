let cidsGlobal = [];
const cidInput = document.getElementById("cid");

// Limpa o campo quando o usuário clica nele
cidInput.addEventListener("focus", () => {
    cidInput.value = "";
});

async function carregarCIDs() {
  try {
    const response = await fetch("./../IA/cids_completos.csv");
    const texto = await response.text();

    const linhas = texto.split("\n").map(l => l.trim()).filter(l => l.length > 0);

    linhas.shift();

    cidsGlobal = linhas.map(linha => {
      const partes = linha.split(";");
      return {
        codigo: partes[0],
        descricao: partes[1],
        sintomas: partes[2] || ""
      };
    });

    const datalist = document.getElementById("cids-datalist");

    cidsGlobal.forEach(cid => {
      const option = document.createElement("option");
      option.value = `${cid.codigo} - ${cid.descricao}`;
      datalist.appendChild(option);
    });

  } catch (error) {
    console.error("Erro ao carregar CSV:", error);
  }
}


async function enviarFormulario(event) {
  event.preventDefault();

  const sintomas = document.getElementById("sintomas").value;
  const cidInput = document.getElementById("cid").value;

  const cidEscolhido = cidInput.split(" - ")[0].trim();

  const cidRecomendado = await validarCIDviaModelo(sintomas);
  
  if (cidEscolhido !== cidRecomendado) {
    mostrarFeedback("erro");
    return;
  }

  mostrarFeedback("sucesso");
}

document.addEventListener("DOMContentLoaded", () => {
  carregarCIDs();

  const form = document.getElementById("prontuario");
  form.addEventListener("submit", enviarFormulario);

  const inputFile = document.getElementById("csvFile");
  if (inputFile) {
    inputFile.addEventListener("change", (e) => {
      const arquivo = e.target.files[0];
      if (arquivo) {
        lerCSV(arquivo, (dados) => {
          console.log("Conteúdo do CSV:", dados);
        });
      }
    });
  }
});

function mostrarFeedback(tipo) {
    const balao = document.getElementById("balao-feedback");
    const mensagem = document.getElementById("mensagem-feedback");

    if (tipo === "sucesso") {
        mensagem.textContent = "✅ CID correto!";
        balao.style.backgroundColor = "#c8f7c5";
    } else if (tipo === "erro") {
        mensagem.textContent = `❌ CID incorreto!`;
        balao.style.backgroundColor = "#f7c5c5";
    }

    balao.style.display = "inline-block";

    setTimeout(() => {
        balao.style.display = "none";
    }, 4000);
}


async function validarCIDviaModelo(sintomas) {

  try {
    const resposta = await fetch(
      "http://localhost:5000/inferir?consulta=" + encodeURIComponent(sintomas)
    );

    if (!resposta.ok) {
      console.error("Erro HTTP:", resposta.status);
      return null;
    }

    const dados = await resposta.json();
    return dados["Código CID"];

  } catch (erro) {
    console.error("ERRO NO FETCH:", erro);
    return null;
  }
}

