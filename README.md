# Orçamento — Carpintaria São Francisco

Aplicação web para criar, editar e exportar orçamentos em PDF, no formato A4, direto do navegador — sem depender de planilhas ou modelos prontos no Word.

# Funcionalidades

Edição inline: cliente, referência, data, itens (descrição, quantidade, preço) e desconto são editados diretamente no próprio layout do orçamento — o que você vê é o que vai para o PDF.
Paginação automática: conforme itens são adicionados, o conteúdo é distribuído automaticamente em páginas no formato A4. A altura de cada linha é medida em tempo real, então nenhuma linha ou texto é cortado ao meio entre páginas.
Preview fiel ao PDF: cada "folha" exibida na tela tem exatamente a proporção de uma página A4 (210×297mm), com indicação visual de "Página X de Y" entre elas.
Responsivo (desktop e celular): a largura da página se adapta ao tamanho da tela automaticamente, mantendo a proporção do papel. Em telas de toque, tocar em uma linha da tabela revela o botão de remover (✕); em desktop, isso também funciona via hover.
Exportação em PDF: gera um arquivo .pdf com uma imagem por página (sem cortes, sem distorção), nomeado automaticamente como Orcamento\_<nome-do-cliente>.pdf.
Dados salvos no navegador: cliente, referência, desconto e itens ficam salvos automaticamente no localStorage do navegador. Se a página for recarregada ou fechada, os dados continuam lá ao abrir de novo.

# Tecnologias

React + TypeScript
Vite (build/dev server)
Tailwind CSS (estilização)
html2canvas-pro (captura das páginas como imagem)
jsPDF (montagem do arquivo PDF)

⚙️ Detalhes técnicos de implementação
Cálculo de páginas: uma árvore de medição invisível (fora da tela) renderiza os mesmos blocos do orçamento para medir, via useLayoutEffect, a altura real de cabeçalho, tabela e cada linha de item. Com essas medidas, o app decide onde cada página deve terminar, evitando que uma linha fique cortada entre duas páginas.
Exportação: cada página visível é capturada individualmente com html2canvas e adicionada como uma página separada no PDF via jsPDF, garantindo que o corte de página no PDF seja sempre exatamente igual ao que aparece na tela.
Responsividade: a largura da página (pageWidth) é recalculada com base em window.innerWidth e reage a eventos de resize, mantendo sempre a proporção A4. A resolução da imagem exportada é ajustada dinamicamente para não perder nitidez em telas pequenas.
Persistência: cliente, referência, desconto e itens são lidos do localStorage (chave orcamento-carpintaria:v1) ao carregar a página e regravados automaticamente a cada mudança, via useEffect.
