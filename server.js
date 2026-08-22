const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = 3000;




const pastaProjeto =
    __dirname;


const arquivoLayout =
    path.join(
        pastaProjeto,
        "config",
        "layout.json"
    );




app.use(
    express.json()
);


app.use(
    express.static(pastaProjeto)
);




app.get(
    "/api/layout",
    function(req, res) {

        fs.readFile(
            arquivoLayout,
            "utf8",
            function(erro, dados) {

                if (erro) {

                    console.error(
                        erro
                    );

                    return res
                        .status(500)
                        .json({
                            erro:
                                "Não foi possível ler o layout."
                        });

                }


                try {

                    var layout =
                        JSON.parse(dados);


                    res.json(layout);

                }
                catch (erro) {

                    console.error(
                        erro
                    );

                    res
                        .status(500)
                        .json({
                            erro:
                                "O layout.json é inválido."
                        });

                }

            }
        );

    }
);




app.post(
    "/api/layout",
    function(req, res) {

        var novoLayout =
            req.body;


        if (
            !novoLayout ||
            typeof novoLayout !== "object"
        ) {

            return res
                .status(400)
                .json({
                    erro:
                        "Configuração inválida."
                });

        }


        var texto =
            JSON.stringify(
                novoLayout,
                null,
                4
            );


        fs.writeFile(
            arquivoLayout,
            texto,
            "utf8",
            function(erro) {

                if (erro) {

                    console.error(
                        erro
                    );

                    return res
                        .status(500)
                        .json({
                            erro:
                                "Não foi possível salvar o layout."
                        });

                }


                res.json({
                    sucesso: true
                });

            }
        );

    }
);




app.listen(
    PORT,
    function() {

        console.log(
            "QuestBoard rodando em:"
        );

        console.log(
            "http://localhost:" +
            PORT
        );

    }
);