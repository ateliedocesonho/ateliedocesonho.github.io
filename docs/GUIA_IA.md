# Guia para agentes de IA — Ateliê Doce Sonho

Leia este guia antes de alterar o projeto. O catálogo e os pedidos são usados por
clientes; preços, sabores, prazos e políticas precisam permanecer fiéis às fontes
fornecidas pela loja.

## Instruções para futuras IAs

- Leia este guia antes de começar qualquer alteração.
- Ao receber do usuário uma nova instrução ou preferência relevante para o
  projeto, atualize este guia na mesma tarefa. Registre orientações duradouras de
  UX, arquitetura e manutenção para que as próximas IAs as encontrem.
- Projete para pessoas leigas, principalmente em celulares: use rótulos simples,
  ações óbvias e poucos elementos visíveis de cada vez. Revele calendários,
  opções e detalhes apenas quando a pessoa tocar no respectivo controle.
- Prefira o caminho mais simples que resolve a tarefa. Não transforme uma
  escolha direta em várias etapas sem necessidade.

## Projeto em poucas palavras

- Site estático mobile first para a confeitaria Ateliê Doce Sonho.
- React 18, TypeScript, Vite, Tailwind CSS e React Router com `HashRouter`.
- O catálogo principal e os futuros catálogos especiais vêm de JSON.
- O pedido é preparado no navegador e enviado como texto para o WhatsApp. Não há
  backend, estoque central, cálculo de frete nem processamento de pagamento.
- A hospedagem prevista é GitHub Pages. Preserve rotas hash e o `base: './'` do
  Vite.
- Existe um painel em React/Tailwind na rota `#/admin` para editar
  `encomendas.json` sem backend: ele usa a API do GitHub com um token guardado no
  navegador e escreve apenas na branch de dados `database`, criada como órfã
  (sem copiar a `main`) e contendo só `catalogs/encomendas.json` e `products/*`.
  O site lê o catálogo e as fotos dessa branch em runtime, com fallback para os
  arquivos publicados. `main` (código) e `gh-pages` (deploy) não são tocados pelo
  painel. Nunca coloque o token no repositório.

## Estrutura

```text
src/
  components/
    admin/         Formulários do painel (produto, fotos, token, estilos)
    catalog/       Galeria, cartões de produto, slideshow e orientação de rolagem
    order/         Modal de pedido, seletores, sabores e quantidade
  data/
    catalogs/      Um arquivo JSON por catálogo
    links.json     Botões da página inicial
    store.json     WhatsApp, Instagram e condições gerais da loja
  lib/             API do GitHub, validação e carregamento de catálogos JSON
  pages/           Home, catálogo, painel admin e estado de catálogo não encontrado
  router/          Rotas centralizadas em AppRouter.tsx
  types/           Modelos TypeScript compartilhados
  main.tsx         HashRouter e ponto de entrada do React
```

Não reúna componentes de páginas e fluxos diferentes em `App.tsx`. Coloque
componentes reutilizáveis em `components/` e cada tela em `pages/`.

## Rotas e novos catálogos

`src/router/AppRouter.tsx` declara `#/` para a página inicial, `#/encomendas`
para o catálogo regular, `#/catalogos/:catalogId` para os catálogos especiais e
`#/admin` para o painel. O carregador em `src/lib/catalogs.ts` tenta primeiro a
versão publicada na branch `database` e usa o JSON importado de
`src/data/catalogs/` como reserva.

Para criar um catálogo sazonal:

1. Duplique `src/data/catalogs/encomendas.json` para um novo arquivo com um slug,
   por exemplo `pascoa-2027.json`.
2. Ajuste `id`, `title`, `subtitle` e `products`. Use ids de produto
   únicos dentro desse catálogo.
3. Em `src/data/links.json`, adicione um botão com `href` igual a
   `#/catalogos/pascoa-2027`, ou crie outro link para esse caminho em local
   apropriado.
4. Rode `npm run format` e `npm run build`.

O carregador já descobre o arquivo; em geral não é preciso criar outra página ou
rota TypeScript. O caminho tem de usar o mesmo slug do nome do arquivo.

## Formato de produto

Cada catálogo é um objeto com `id`, `title`, `subtitle` e uma lista
`products`. Exemplo de produto:

```json
{
  "id": "ovo-recheado",
  "category": "Especial de Páscoa",
  "title": "Ovo de colher",
  "description": "Descrição curta e fiel ao produto.",
  "tag": "Edição limitada",
  "soldOut": false,
  "flavorSelection": "single",
  "images": [
    {
      "src": "inspiration/ovo-recheado-01.jpg",
      "alt": "Ovo de colher aberto, com recheio de brigadeiro"
    },
    {
      "src": "inspiration/ovo-recheado-02.jpg",
      "alt": "Detalhe do recheio de brigadeiro"
    }
  ],
  "options": [
    { "name": "250 g", "price": 65 },
    { "name": "500 g", "price": 110 }
  ],
  "flavors": ["Brigadeiro", "Ninho com Nutella"]
}
```

- `images` aceita uma ou mais fotos na ordem desejada. Coloque os arquivos em
  `public/` e informe o caminho relativo a `public/`, sem barra inicial. Cada
  foto precisa de texto `alt` útil. Com mais de uma imagem o componente oferece
  deslize lateral, bolinhas de paginação e slideshow ao tocar na foto.
- `soldOut` é booleano. `true` exibe o selo de esgotado na foto, desabilita a
  encomenda e bloqueia a seleção no pedido. Use `false` quando disponível.
- `options` define a apresentação e o preço. O preço é número em reais, sem
  símbolo (ex.: `65`). Use `null` para “sob consulta”.
- `flavors` é opcional. Informe-o quando o cliente precisa escolher um sabor.
  Sabores ganham botões destacados e a seleção acompanha o item no pedido.
- Configure `flavorSelection` nos produtos que têm `flavors`: use `"single"`
  para bolos com um recheio escolhido ou `"multiple"` para caixas de docinhos
  que aceitam vários sabores. O padrão de segurança se o campo faltar é `single`.
  Na seleção múltipla o site lista todos os sabores na mensagem do WhatsApp e
  avisa que a divisão de quantidades será combinada com o ateliê.
- Não repita sabores como `options` só para dar preço igual. Use uma opção de
  apresentação com preço e uma lista `flavors` separada.
- Mantenha ids únicos. A ordem no JSON é a ordem vertical em que os produtos
  aparecem.

## Página inicial e dados da loja

- `src/data/links.json` cria os botões da home. Cada item deve ter `id`, `label`,
  `description`, `href`, `icon` e `style`. Para rotas internas, use
  `#/encomendas` ou `#/catalogos/<slug>`; para links externos, use URL completa.
- `src/data/store.json` é a fonte dos contatos e regras gerais: WhatsApp em
  formato internacional só com números, Instagram, antecedência, sinal, cartão,
  retirada, entrega e cancelamento. Evite duplicar esses dados nos componentes.
- Atualize preços e regras só com uma fonte da confeitaria. Nunca deduza preço,
  prazo, ingrediente ou política ausente do conteúdo confirmado.

## Fluxo de pedido

`components/order/OrderModal.tsx` contém as três etapas: itens, data e horário,
e confirmação. `ChoicePicker.tsx` substitui os selects nativos por uma lista de
botões utilizável em telas touch. `DateTimePicker.tsx` usa o date picker do
shadcn/ui (`Popover` + `Calendar` em `components/ui/`) para a data e o `Select`
do shadcn/ui para o horário. A data abre em popover e o horário em lista
suspensa; ambos fecham após a seleção. Mantenha essa interação direta e sem
telas intermediárias. `FlavorPicker.tsx` mantém os sabores fáceis de comparar.
Preserve validação, resumo, quantidade, estado de esgotado e mensagem
estruturada para WhatsApp ao alterar o fluxo.
Na etapa final, mostre apenas a revisão do pedido e o botão de envio pelo
WhatsApp; não solicite nome nem observações adicionais.
Os horários disponíveis vão de 07:00 a 22:00, em intervalos de 30 minutos.
Datas anteriores ao dia atual ficam desabilitadas no calendário.

O site apenas abre o WhatsApp com o pedido preenchido. O cliente envia a
mensagem e o ateliê confirma disponibilidade, retirada e pagamento.

## Identidade visual e usabilidade

- Preserve a paleta de creme e vinho e as fontes já declaradas em `index.html`.
- Use componentes e tokens/classe Tailwind compartilhados antes de criar estilos
  isolados.
- O catálogo usa rolagem vertical com snap; a galeria usa deslize horizontal.
  Evite interações que conflitem entre os dois gestos.
- Mantenha alvos touch confortáveis, foco visível, rótulos acessíveis, estado
  claro para esgotado e suporte a movimento reduzido.
- Se substituir as fotos ilustrativas geradas, preserve os caminhos JSON ou
  atualize `images` junto com os arquivos.
- Prefira os componentes shadcn/ui já instalados em `components/ui/` ao criar
  controles de data e seleção; não adicione bibliotecas sem necessidade real.

## Painel de administração

`docs/PAINEL_ADMIN.md` é o guia da pessoa que edita o catálogo. O painel roda
dentro do app React em `#/admin` e usa as seguintes regras duradouras:

- Formulários em português simples, com um cartão por produto e ações óbvias
  (editar, subir/descer, duplicar, excluir); a pessoa leiga nunca precisa ler
  ou escrever JSON.
- O token do GitHub (fine-grained, apenas `Contents: read and write` neste
  repositório) vive somente no `localStorage` do navegador. Nunca grave token
  em arquivo, log ou mensagem de commit.
- A edição é um rascunho local: só o botão **Publicar alterações** faz commit via
  Contents API na branch `database` (`catalogs/encomendas.json` e fotos em
  `products/`). O site lê esses arquivos em runtime (`fetchCatalog` e
  `CatalogImage`), sem rebuild. Fotos escolhidas no formulário **não** são
  enviadas antes do publish, e o nome do arquivo é editável pela pessoa.
- `main` e `gh-pages` nunca são tocados pelo painel: alterações estruturais e
  deploy não apagam as edições. Se precisar replicar algo manualmente no catálogo
  editável, faça isso direto na branch `database`.
- `ensureDataBranch()` cria a `database` com um único commit sem pais, cuja
  árvore contém só `catalogs/encomendas.json` (a API rejeita uma árvore vazia).
  Não espelhe a `main` nessa branch: fotos antigas e código já vêm do site
  publicado.
- Preserve os campos aceitos por `src/types/catalog.ts` e as validações do
  painel (ids únicos em slug, preço `null` para sob consulta, `alt` nas fotos,
  ordem dos produtos). Mantenha `soldOut` e `flavorSelection` nos produtos que
  precisam deles.

## Formatação, build e deploy

- `npm run format` aplica Prettier; `npm run format:check` confere a formatação.
- `npm run build` roda TypeScript e cria `dist/` para publicação.
- `.github/workflows/deploy.yml` publica no GitHub Pages ao receber push na
  branch `main` (Pages deve usar GitHub Actions).
- `npm run deploy` publica `dist` na branch `gh-pages` com `gh-pages -d dist`.
  Isso não afeta a branch `database`, onde estão as edições do painel.
- Mantenha `base: './'`, `HashRouter` e os caminhos de imagens relativos para
  que o app funcione em repositórios de projeto no GitHub Pages.
