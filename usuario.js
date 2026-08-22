

var STORAGE_KEY = "questBoardLayout";
var LAYOUT_API = "/api/layout";

var quadro = document.getElementById("quadro");
var fundoZoom = document.getElementById("fundoZoom");
var imagemPapelZoom = document.getElementById("imagemPapelZoom");

var papeis = {
    papel1: document.querySelector('[data-papel="papel1"]'),
    papel2: document.querySelector('[data-papel="papel2"]'),
    papel3: document.querySelector('[data-papel="papel3"]')
};

var layoutPadrao = {
    papel1: { x: 30, y: 30, largura: 150, altura: 190, rotacao: -5 },
    papel2: { x: 60, y: 30, largura: 150, altura: 190, rotacao: 5 },
    papel3: { x: 45, y: 65, largura: 150, altura: 190, rotacao: -2 }
};

function copiarLayout(layout) {
    return JSON.parse(JSON.stringify(layout));
}

function layoutValido(layout) {
    return layout &&
        layout.papel1 &&
        layout.papel2 &&
        layout.papel3;
}

function aplicarPapel(elemento, dados) {
    if (!elemento || !dados) {
        return;
    }

    
    elemento.style.left = dados.x + "%";
    elemento.style.top = dados.y + "%";

    
    elemento.style.width = "calc(" + dados.largura + " / 1536 * 100%)";
    elemento.style.height = "calc(" + dados.altura + " / 1024 * 100%)";

    elemento.style.transform = "rotate(" + dados.rotacao + "deg)";
}

function aplicarLayout(layout) {
    layout = layoutValido(layout) ? layout : layoutPadrao;

    aplicarPapel(papeis.papel1, layout.papel1);
    aplicarPapel(papeis.papel2, layout.papel2);
    aplicarPapel(papeis.papel3, layout.papel3);
}

function lerLocalStorage() {
    try {
        var salvo = localStorage.getItem(STORAGE_KEY);
        if (!salvo) {
            return null;
        }

        var layout = JSON.parse(salvo);
        return layoutValido(layout) ? layout : null;
    } catch (erro) {
        console.error("Erro no localStorage:", erro);
        return null;
    }
}

function salvarLocalStorage(layout) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
    } catch (erro) {
        console.error("Erro ao salvar localStorage:", erro);
    }
}

function carregarLayout() {
    
    var local = lerLocalStorage();
    aplicarLayout(local || layoutPadrao);

    
    fetch(LAYOUT_API + "?t=" + Date.now(), {
        cache: "no-store"
    })
        .then(function(resposta) {
            if (!resposta.ok) {
                throw new Error("API /api/layout respondeu " + resposta.status);
            }
            return resposta.json();
        })
        .then(function(layout) {
            if (layoutValido(layout)) {
                aplicarLayout(layout);
                salvarLocalStorage(layout);
            }
        })
        .catch(function(erro) {
            console.warn("API de layout indisponível. Usando localStorage.", erro);
        });
}

function abrirPapel(papel) {
    if (!papel || !imagemPapelZoom) {
        return;
    }

    var imagem = papel.querySelector("img");
    if (!imagem) {
        return;
    }

    imagemPapelZoom.src = imagem.getAttribute("src");
    imagemPapelZoom.alt = imagem.getAttribute("alt") || "Papel";

    fundoZoom.classList.add("ativo");
    fundoZoom.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function fecharPapel() {
    fundoZoom.classList.remove("ativo");
    fundoZoom.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "hidden";

    setTimeout(function() {
        if (!fundoZoom.classList.contains("ativo")) {
            imagemPapelZoom.removeAttribute("src");
        }
    }, 220);
}

Object.keys(papeis).forEach(function(nome) {
    var papel = papeis[nome];

    if (!papel) {
        return;
    }

    papel.addEventListener("click", function(event) {
        event.preventDefault();
        event.stopPropagation();
        abrirPapel(papel);
    });
});


fundoZoom.addEventListener("click", function(event) {
    if (event.target === fundoZoom) {
        fecharPapel();
    }
});

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        fecharPapel();
    }
});

carregarLayout();



var musicaFundo = document.getElementById("musicaFundo");
var musicaLiberada = false;

function iniciarMusica() {
    if (!musicaFundo) {
        return;
    }

    musicaFundo.loop = true;
    musicaFundo.volume = .09;
    musicaFundo.muted = false;

    var promessa = musicaFundo.play();

    if (promessa && typeof promessa.catch === "function") {
        promessa.catch(function() {
            
        });
    }
}

function liberarMusica() {
    if (musicaLiberada) {
        return;
    }

    musicaLiberada = true;
    iniciarMusica();

    document.removeEventListener("pointerdown", liberarMusica);
    document.removeEventListener("keydown", liberarMusica);
}


iniciarMusica();


document.addEventListener("pointerdown", liberarMusica, { once: true });
document.addEventListener("keydown", liberarMusica, { once: true });
