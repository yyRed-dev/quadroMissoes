# QuestBoard

Quadro interativo para disponibilizar missões a um grupo de aventureiros em uma campanha de RPG. O projeto usa HTML, CSS, JavaScript no navegador e um servidor Express pequeno para servir a aplicação e persistir a posição dos papéis.

## Funcionalidades

- Visualização do quadro com três papéis de missão sobre uma parede ilustrada.
- Abertura de cada papel em uma visualização ampliada na tela do usuário.
- Fechamento da visualização ampliada clicando fora da imagem ou pressionando `Esc`.
- Tela de administração para selecionar e editar cada papel.
- Posicionamento por arraste com o mouse ou toque.
- Ajuste manual de posição, tamanho e rotação.
- Salvamento no servidor, em `config/layout.json`.
- Cópia local automática no `localStorage` do navegador.
- Funcionamento com fallback local quando a API não está disponível.

## Requisitos

- Node.js instalado.
- npm, incluído na instalação do Node.js.
- Navegador moderno com suporte a `fetch`, `localStorage` e Pointer Events.

O projeto atualmente não possui `package.json`. Por isso, instale a única dependência diretamente na pasta do projeto:

```bash
npm init -y
npm install express
```

## Execução

Na raiz do projeto, execute:

```bash
node server.js
```

O servidor será iniciado na porta `3000`. Abra no navegador:

- [Página inicial](http://localhost:3000/)
- [Administração](http://localhost:3000/adm.html)
- [Quadro do usuário](http://localhost:3000/usuario.html)

Para encerrar o servidor, pressione `Ctrl+C` no terminal.

## Como usar

### Administração

1. Abra `http://localhost:3000/adm.html`.
2. Selecione `Papel 1`, `Papel 2` ou `Papel 3` no painel lateral.
3. Arraste o papel diretamente no quadro ou altere os campos de posição, tamanho e rotação.
4. Clique em **Salvar configurações** para persistir as alterações no servidor.
5. Use **Restaurar padrão** para voltar ao layout inicial. Essa ação só é persistida depois de clicar em **Salvar configurações**.

As posições `X` e `Y` são percentuais em relação ao quadro. Largura e altura são medidas em pixels, e a rotação é informada em graus.

### Quadro do usuário

Abra `http://localhost:3000/usuario.html` para exibir o quadro. Clique em qualquer papel para vê-lo ampliado. O layout é carregado da API e armazenado localmente para permitir a exibição mesmo quando a API fica indisponível.

## API

### `GET /api/layout`

Lê e retorna o conteúdo de `config/layout.json` em JSON.

Resposta de exemplo:

```json
{
	"papel1": {
		"x": 30,
		"y": 30,
		"largura": 150,
		"altura": 190,
		"rotacao": -5
	},
	"papel2": {
		"x": 60,
		"y": 30,
		"largura": 150,
		"altura": 190,
		"rotacao": 5
	},
	"papel3": {
		"x": 45,
		"y": 65,
		"largura": 150,
		"altura": 190,
		"rotacao": -2
	}
}
```

### `POST /api/layout`

Recebe um objeto JSON e sobrescreve `config/layout.json`.

Exemplo:

```bash
curl -X POST http://localhost:3000/api/layout \
  -H "Content-Type: application/json" \
  --data-binary @config/layout.json
```

O servidor retorna `{ "sucesso": true }` quando o arquivo é salvo. Um corpo que não seja um objeto JSON retorna `400`; falhas de leitura ou gravação retornam `500`.

## Formato do layout

O arquivo persistido deve conter os três papéis: `papel1`, `papel2` e `papel3`. Cada papel possui:

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `x` | número | Posição horizontal em percentual |
| `y` | número | Posição vertical em percentual |
| `largura` | número | Largura do papel em pixels |
| `altura` | número | Altura do papel em pixels |
| `rotacao` | número | Rotação em graus |

O arquivo `layout.json` na raiz contém o layout padrão usado como referência pelo código. O arquivo `config/layout.json` é o estado lido pela API e alterado pela administração.

## Estrutura do projeto

```text
.
├── index.html              # Página inicial e links para as duas interfaces
├── adm.html                # Interface de administração
├── usuario.html            # Quadro exibido aos usuários
├── server.js               # Servidor Express e API de layout
├── layout.json             # Configuração padrão
├── config/
│   └── layout.json         # Configuração persistida pelo servidor
├── css/
│   ├── adm.css             # Estilos da administração
│   └── usuario.css         # Estilos do quadro do usuário
├── js/
│   ├── adm.js              # Edição, arraste e salvamento do layout
│   └── usuario.js          # Carregamento e zoom dos papéis
├── usuario.js              # Script usado pela página usuario.html
└── assets/                 # Imagens, textura e música do quadro
```

## Persistência e comportamento offline

O navegador mantém o layout na chave `questBoardLayout` do `localStorage`. Na administração, cada alteração é refletida imediatamente na tela, mas só é enviada ao servidor ao clicar em **Salvar configurações**. Se o `POST` falhar, a cópia local continua salva.

Ao abrir o quadro do usuário, o navegador usa primeiro o último layout local disponível e depois tenta atualizar os dados pela API. Se a API falhar, o layout local ou o layout padrão permanece em uso.

## Limitações atuais

- Não há autenticação ou controle de acesso na tela de administração.
- O arquivo de configuração é compartilhado por todos os usuários do servidor.
- O servidor usa a porta `3000` fixa; altere `PORT` em `server.js` para usar outra porta.
- O conteúdo dos papéis é representado pelas imagens em `assets/`; não há cadastro de missões em banco de dados.

## Tecnologias

- HTML5
- CSS3
- JavaScript puro
- Node.js
- Express

## Licença

Este projeto não define uma licença no repositório. Consulte o responsável pelo projeto antes de redistribuir ou reutilizar os arquivos e assets.
