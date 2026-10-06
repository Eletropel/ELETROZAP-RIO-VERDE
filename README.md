# Eletropel • Central WhatsApp — Inauguração Rio Verde

Ferramenta interna para enviar o convite da inauguração da filial de Rio Verde/GO aos clientes pelo WhatsApp Web, com **imagem + legenda na mesma mensagem**, sem precisar salvar os contatos.

O envio final é **sempre manual**: o sistema prepara tudo e você só confere e aperta **Enter**.

**Painel online:** https://eletropel.github.io/ELETROZAP-RIO-VERDE/

---

## Como funciona

O projeto tem duas partes que trabalham juntas:

| Parte | O que faz | Onde fica |
|---|---|---|
| **Painel** (site) | Importa a planilha, mostra a fila de clientes e abre o WhatsApp de cada um | GitHub Pages (`index.html`, `script.js`, `style.css`) |
| **Extensão do Chrome** | Quando o WhatsApp Web abre, anexa a imagem do convite e preenche a legenda | Pasta `extension/` (instalada no Chrome de quem vai usar) |

O painel abre o link `web.whatsapp.com/send?phone=NÚMERO&eletro_caption=MENSAGEM`. A extensão lê a mensagem desse link, anexa a imagem e coloca a legenda no preview.

---

## Estrutura do repositório

```
/
├── index.html
├── script.js
├── style.css
├── README.md
├── assets/
│   └── convite.png          ← imagem mostrada no painel
└── extension/
    ├── manifest.json
    ├── content.js
    ├── background.js
    └── convite.png          ← imagem que a extensão anexa no WhatsApp
```

> A imagem do convite precisa existir nos **dois** lugares (`assets/` e `extension/`).

---

## Instalação (uma vez por computador)

Requisito: **Google Chrome** (ou Edge/Brave) com o **WhatsApp Web já logado**.

1. Baixe o projeto (botão verde **Code > Download ZIP**) e extraia.
2. Abra `chrome://extensions`.
3. Ative o **Modo do desenvolvedor** (canto superior direito).
4. Clique em **Carregar sem compactação**.
5. Selecione a pasta **`extension`** (a que tem o `manifest.json`).
6. Confira se a extensão aparece ativada e **sem erro vermelho**.

---

## Como usar

1. Abra o painel: https://eletropel.github.io/ELETROZAP-RIO-VERDE/
2. Clique em **Importar Excel/CSV** e escolha a planilha de clientes.
3. Clique em **ABRIR WHATSAPP** (ou escolha um cliente na fila).
4. O WhatsApp Web abre numa nova aba, e a extensão anexa a imagem e escreve a legenda.
5. **Confira** o preview e aperte **Enter** para enviar.
6. Volte ao painel e clique em **✓ ENVIADO** para ir ao próximo cliente. Use **PULAR** se o número não funcionar (ele vai para "Erros").

### Formato da planilha

- Formatos aceitos: `.xlsx`, `.xls`, `.csv`.
- Colunas reconhecidas pelo nome: **Nome / Razão Social / Cliente** e **Telefone / Celular / WhatsApp / Fone**.
- Se não houver essas colunas, o painel usa a 1ª coluna como nome e a 2ª como telefone.
- O DDI **55** é adicionado automaticamente em números com 10 ou 11 dígitos.
- Números repetidos são removidos, e o painel avisa quantos.
- Números com menos de 12 dígitos (já com o 55) são descartados.

### Alterar a mensagem

A mensagem fica no começo do `script.js`, na constante `MSG`. O texto `{NOME}` é substituído pelo nome do cliente. Para uma nova campanha, edite o texto, a data e o endereço ali.

### Trocar a imagem do convite

Substitua **os dois arquivos**: `assets/convite.png` e `extension/convite.png`, mantendo o mesmo nome. Depois recarregue a extensão (veja abaixo).

---

## Como atualizar a extensão

Sempre que mudar qualquer arquivo da pasta `extension`:

1. Abra `chrome://extensions`.
2. Clique no botão de **recarregar** da extensão.
3. **Feche as abas do WhatsApp Web** e abra de novo pelo painel.

Para confirmar a versão carregada: no WhatsApp Web, aperte F12, abra o **Console**, digite `Eletropel` no filtro e procure `extensão carregada vX.X`.

---

## Histórico de atualizações

| Versão | O que mudou |
|---|---|
| V8 | A mensagem deixou de ir no `?text=`. Agora vai em `eletro_caption` e entra só na legenda da imagem. |
| 1.2 | A legenda é guardada assim que a página abre, porque o WhatsApp apaga os parâmetros da URL. |
| 1.5 | A imagem entra uma única vez. Corrigido o bug da imagem duplicada. |
| 1.6 | A legenda é escrita na caixa de mensagem antes da imagem. O WhatsApp a leva para o preview. |
| 1.7 | Quebras de linha preservadas. A legenda era inserida numa linha só. |
| 1.8 | A imagem entra pelo campo de **Fotos e vídeos**. Antes entrava no campo de **figurinha**, e a foto saía como sticker. |
| 1.9 | Esperas reduzidas para o processo ficar mais rápido. |
| 1.10 | Até 3 tentativas quando o preview não abre. Espera de 0,9 s antes de anexar, para não anexar antes de o chat carregar. |

---

## Solução de problemas

Abra o WhatsApp Web, aperte **F12 > Console** e filtre por `Eletropel`. As mensagens aparecem na ordem:

1. `extensão carregada` — a extensão está ativa.
2. `legenda encontrada, aguardando chat...` — recebeu a mensagem do painel.
3. `chat pronto, colando imagem...` — o chat abriu.
4. `legenda escrita na caixa de mensagem`
5. `imagem enviada ao campo de arquivo`
6. `legenda inserida` — pronto, é só conferir e apertar Enter.

| Sintoma | Provável causa e solução |
|---|---|
| Nenhuma mensagem `Eletropel` no console | A extensão não está ativa ou não foi recarregada. Veja `chrome://extensions`. |
| Só aparece "extensão carregada" | A legenda não chegou. Abra o WhatsApp **pelo botão do painel**, e não manualmente. |
| A imagem não aparece | O WhatsApp mudou a estrutura interna. Veja o erro no console e atualize os seletores no `content.js`. |
| Erro "Não consegui abrir o preview da imagem" | O WhatsApp ainda não tinha carregado o chat. Tente de novo. Se persistir, aumente a espera de 900 ms no `content.js`. |
| A foto sai como figurinha | O campo de arquivo errado foi usado. Confirme que está na versão 1.8 ou superior. |
| Legenda numa linha só | Confirme que está na versão 1.7 ou superior. |
| Número inválido | O WhatsApp mostra um aviso. Volte ao painel e use **PULAR**. |

---

## Boas práticas e riscos

- O WhatsApp **não permite** envio em massa automático. Mandar muitas mensagens iguais, em sequência, para quem não tem o número salvo pode levar ao **bloqueio do número da Eletropel**.
- Por isso o projeto não clica em enviar: o Enter manual em cada cliente é a proteção.
- Recomendação: envie em lotes pequenos por dia, por exemplo 50 a 80 clientes, com intervalo entre as mensagens.
- Para disparo realmente em massa, o caminho seguro é a **API oficial do WhatsApp Business**, por um provedor autorizado.

## Privacidade e dados

- A planilha é lida **no próprio navegador**. Nada é enviado a servidor.
- A fila e os status ficam no `localStorage` do navegador. Limpar os dados do site apaga a fila.
- Não suba planilhas de clientes para o repositório.

## Observações técnicas

- O WhatsApp Web muda sua estrutura com frequência. Se algo parar de funcionar, o ajuste normalmente é nos seletores do `content.js`.
- O WhatsApp tem vários campos de arquivo escondidos (documento, fotos e vídeos, figurinha). A extensão usa só o de fotos e vídeos, que aceita imagem e vídeo ao mesmo tempo.
- A legenda é inserida como texto colado, para manter as quebras de linha.
