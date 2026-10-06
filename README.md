# Eletropel • Central de Convites — V4

## O que mudou
A V4 abandona completamente o método de clipboard/Ctrl+V usado na V3. A extensão baixa uma cópia local do convite e usa o Chrome DevTools Protocol (`DOM.setFileInputFiles`) para preencher o campo de upload do WhatsApp Web. Depois preenche somente a legenda. O envio continua manual.

## Instalação
1. Abra `chrome://extensions`.
2. Ative **Modo do desenvolvedor**.
3. Remova a extensão Eletropel anterior.
4. **Carregar sem compactação** e selecione a pasta `extension`.
5. Recarregue o WhatsApp Web.
6. Teste com apenas um cliente.

A extensão pedirá as permissões `debugger` e `downloads`. Não é necessário procurar nenhuma configuração escondida de “depuração”.
