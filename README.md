# Ateliê Doce Sonho

Site mobile first de catálogo e pedidos feito com Vite, React, TypeScript e
Tailwind CSS. A navegação usa `HashRouter`, compatível com GitHub Pages.

## Desenvolvimento

```sh
npm install
npm run dev
```

## Catálogo e pedidos

- A página inicial é configurada em `src/data/links.json`.
- O catálogo atual fica em `src/data/catalogs/encomendas.json`.
- Fotos ficam em `public/`. O JSON aceita uma ou várias fotos por produto.
- Use `"soldOut": true` em um produto para mostrar o selo de esgotado e impedir
  novas encomendas daquele item.
- Em produtos com `flavors`, `"flavorSelection": "multiple"` permite marcar
  vários sabores; use `"single"` para permitir apenas um.
- Contatos e condições comerciais são editáveis em `src/data/store.json`.
- Os pedidos são montados em etapas e enviados ao WhatsApp para confirmação; o
  site não processa pagamentos.
- Para catálogos sazonais, adicione outro JSON em `src/data/catalogs/` e um botão
  para `#/catalogos/<slug>` em `src/data/links.json`.

Consulte [docs/GUIA_IA.md](docs/GUIA_IA.md) para instruções de manutenção,
formato completo dos dados, identidade visual e criação de catálogos sazonais.

## Formatação e build

```sh
npm run format
npm run build
```

## GitHub Pages

Envie o repositório ao GitHub, habilite **Settings → Pages → GitHub Actions** e
faça push para `main`. O workflow `.github/workflows/deploy.yml` compila e
publica o site. Também é possível executar `npm run deploy` para publicar a
pasta `dist` na branch `gh-pages`, com um remoto Git configurado.

As fotos atuais do catálogo são imagens de apresentação geradas para o site.
Substitua-as pelas fotos reais e ajuste os caminhos em `images` no JSON para
representar as encomendas com fidelidade.
