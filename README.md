# Eletropel — Central WhatsApp

Painel local/GitHub Pages para organizar uma fila de convites e abrir o WhatsApp Web com a mensagem personalizada. A extensão é opcional e serve para preparar a interface do WhatsApp.

## Importante
A versão inicial mantém o envio final manual. O site não contém números de clientes. Importe Excel/CSV localmente; a lista fica no `localStorage` do navegador.

## Publicar no GitHub Pages
1. Crie um repositório, por exemplo `eletropel-central-whatsapp`.
2. Envie `index.html`, `style.css`, `script.js` e a pasta `assets`.
3. Ative GitHub Pages em Settings → Pages → Deploy from branch → main/root.
4. A biblioteca SheetJS está referenciada por CDN no `index.html`; para uma versão totalmente offline, baixe-a e coloque no projeto.

## Extensão
Chrome → `chrome://extensions` → Modo do desenvolvedor → Carregar sem compactação → selecione a pasta `extension`.

Observação: o WhatsApp Web altera o DOM com frequência. A automação de anexar arquivo e manter legenda na mesma composição exige ajustes conforme a versão do WhatsApp. O projeto deliberadamente não clica em Enviar automaticamente.
