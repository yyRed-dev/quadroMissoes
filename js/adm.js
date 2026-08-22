

var STORAGE_KEY = "questBoardLayout";
var LAYOUT_API = "/api/layout";

var papelSelecionado = "papel1";
var arrastando = false;
var deslocamentoX = 0;
var deslocamentoY = 0;

var configuracaoPadrao = {
    papel1: { x: 30, y: 30, largura: 150, altura: 190, rotacao: -5 },
    papel2: { x: 60, y: 30, largura: 150, altura: 190, rotacao: 5 },
    papel3: { x: 45, y: 65, largura: 150, altura: 190, rotacao: -2 }
};

var configuracao = null;

function copiarLayout(layout) {
    return JSON.parse(JSON.stringify(layout));
}

function layoutValido(layout) {
    return layout && layout.papel1 && layout.papel2 && layout.papel3;
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

function salvarLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(configuracao));
    } catch (erro) {
        console.error("Erro ao salvar localStorage:", erro);
    }
}

function carregarConfiguracao() {
    var local = lerLocalStorage();

    if (local) {
        configuracao = local;
    } else {
        configuracao = copiarLayout(configuracaoPadrao);
    }

    renderizarPapeis();

    
    return fetch(LAYOUT_API + "?t=" + Date.now(), {
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
                configuracao = layout;
                salvarLocalStorage();
                renderizarPapeis();
            }

            return configuracao;
        })
        .catch(function(erro) {
            console.warn("API indisponível. Usando localStorage.", erro);
            return configuracao;
        });
}

function mostrarMensagem(texto) {
    var mensagem = document.getElementById("mensagem");
    if (mensagem) {
        mensagem.textContent = texto;
    }
}

function salvarConfiguracao() {
    
    salvarLocalStorage();

    
    fetch(LAYOUT_API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(configuracao)
    })
        .then(function(resposta) {
            if (!resposta.ok) {
                throw new Error("API /api/layout respondeu " + resposta.status);
            }
            return resposta.text();
        })
        .then(function() {
            mostrarMensagem("Configurações salvas no servidor!");
        })
        .catch(function(erro) {
            console.warn("Não foi possível salvar na API. localStorage foi salvo.", erro);
            mostrarMensagem("Configurações salvas neste navegador.");
        });
}

function pegarQuadro() {
    return document.getElementById("quadro");
}

function pegarPapel(id) {
    return document.getElementById(id);
}

function renderizarPapeis() {
    var quadro = pegarQuadro();
    if (!quadro || !configuracao) {
        return;
    }

    Object.keys(configuracao).forEach(function(id) {
        var papel = pegarPapel(id);
        var dados = configuracao[id];

        if (!papel || !dados) {
            return;
        }

        
        papel.style.left = dados.x + "%";
        papel.style.top = dados.y + "%";
        papel.style.width = dados.largura + "px";
        papel.style.height = dados.altura + "px";

        papel.style.transform = "rotate(" + dados.rotacao + "deg)";
    });
}

function selecionarPapel(id) {
    if (!configuracao[id]) {
        return;
    }

    papelSelecionado = id;

    document.querySelectorAll(".papel-selecao").forEach(function(botao) {
        botao.classList.toggle("selecionado", botao.dataset.papel === id);
    });

    document.querySelectorAll(".papel").forEach(function(papel) {
        papel.classList.toggle("selecionado", papel.dataset.papel === id);
    });

    atualizarCampos();
}

function atualizarCampos() {
    var dados = configuracao[papelSelecionado];
    if (!dados) {
        return;
    }

    document.getElementById("posicaoX").value = Number(dados.x.toFixed(2));
    document.getElementById("posicaoY").value = Number(dados.y.toFixed(2));
    document.getElementById("largura").value = Math.round(dados.largura);
    document.getElementById("altura").value = Math.round(dados.altura);
    document.getElementById("rotacao").value = Number(dados.rotacao.toFixed(2));
}

function alterarCampo(campo, valor) {
    var numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return;
    }

    configuracao[papelSelecionado][campo] = numero;
    renderizarPapeis();
    avisarAlteracao();
}

function configurarCampos() {
    document.getElementById("posicaoX").addEventListener("input", function() {
        alterarCampo("x", this.value);
    });

    document.getElementById("posicaoY").addEventListener("input", function() {
        alterarCampo("y", this.value);
    });

    document.getElementById("largura").addEventListener("input", function() {
        alterarCampo("largura", this.value);
    });

    document.getElementById("altura").addEventListener("input", function() {
        alterarCampo("altura", this.value);
    });

    document.getElementById("rotacao").addEventListener("input", function() {
        alterarCampo("rotacao", this.value);
    });
}

function avisarAlteracao() {
    mostrarMensagem("Alterações não salvas.");
}

function configurarArraste() {
    var quadro = pegarQuadro();
    var papeis = document.querySelectorAll(".papel");

    papeis.forEach(function(papel) {
        papel.addEventListener("pointerdown", function(event) {
            if (event.button !== 0) {
                return;
            }

            selecionarPapel(papel.dataset.papel);
            arrastando = true;

            var rect = quadro.getBoundingClientRect();
            var dados = configuracao[papelSelecionado];

            
            var papelRect = papel.getBoundingClientRect();

            var papelX = papelRect.left;
            var papelY = papelRect.top;

            deslocamentoX = event.clientX - papelX;
            deslocamentoY = event.clientY - papelY;

            papel.setPointerCapture(event.pointerId);
            event.preventDefault();
        });
    });

    document.addEventListener("pointermove", function(event) {
        if (!arrastando) {
            return;
        }

        var rect = quadro.getBoundingClientRect();
        var papel = pegarPapel(papelSelecionado);
        if (!papel) {
            return;
        }

        var novoX = event.clientX - rect.left - deslocamentoX;
        var novoY = event.clientY - rect.top - deslocamentoY;

        configuracao[papelSelecionado].x = (novoX / rect.width) * 100;
        configuracao[papelSelecionado].y = (novoY / rect.height) * 100;

        renderizarPapeis();
        atualizarCampos();
        avisarAlteracao();
    });

    document.addEventListener("pointerup", function() {
        arrastando = false;
    });
}

function restaurarPadrao() {
    configuracao = copiarLayout(configuracaoPadrao);
    renderizarPapeis();
    selecionarPapel(papelSelecionado);
    avisarAlteracao();
}

function iniciar() {
    carregarConfiguracao().then(function() {
        selecionarPapel("papel1");
        configurarCampos();
        configurarArraste();

        document.querySelectorAll(".papel-selecao").forEach(function(botao) {
            botao.addEventListener("click", function() {
                selecionarPapel(botao.dataset.papel);
            });
        });

        document.getElementById("salvar").addEventListener("click", salvarConfiguracao);
        document.getElementById("resetar").addEventListener("click", restaurarPadrao);

        window.addEventListener("resize", renderizarPapeis);
    });
}

iniciar();
