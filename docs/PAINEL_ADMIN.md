# Painel de administração (para quem não mexe com código)

O painel fica em **`https://ateliedocesonho.github.io/#/admin`**. Ele permite
editar produtos, preços, sabores e fotos do catálogo de encomendas pelo
navegador, sem abrir o repositório e sem mexer no código do site.

No computador, com `npm run dev`, a URL é **`http://localhost:5173/#/admin`**.

## Como funciona (sem backend)

O GitHub Pages só serve arquivos, mas a **API do GitHub** aceita escrita. O
"backend" é o próprio repositório, usando uma branch separada só para conteúdo:

| Branch     | Para que serve                                         |
| ---------- | ------------------------------------------------------ |
| `main`     | Seu código. O painel nunca escreve aqui.               |
| `gh-pages` | Site publicado (`dist/`). O painel nunca escreve aqui. |
| `database` | Só `catalogs/encomendas.json` e fotos do painel.       |

1. O painel lê `catalogs/encomendas.json` da branch `database` pela API.
2. A pessoa edita em formulários; nada é salvo no GitHub até clicar em Publicar.
3. **Publicar alterações** envia as fotos escolhidas e o JSON atualizado para a
   branch `database`.
4. O site lê o JSON e as fotos direto da branch `database`, sem reconstruir o
   React. A atualização aparece na hora.

Se a branch `database` ainda não existir, o painel cria um commit órfão (sem
copiar a `main`) contendo apenas o catálogo que já vem no site como ponto de
partida. Só entram nessa branch os arquivos que o painel publica.

> Mudanças no `main` (código, textos em `store.json`, fotos antigas) não sobrescrevem
> o que foi editado no painel. Se quiser que uma alteração manual apareça no
> catálogo editável, faça essa alteração também no JSON da branch `database`.

## Configuração única: criar o token

Na primeira vez, a pessoa dona do repositório precisa criar um token:

1. Entre no GitHub e abra **Foto do perfil → Settings → Developer settings**.
2. Vá em **Personal access tokens → Tokens (fine-grained)** →
   **Generate new token**.
3. Nome sugerido: `Painel Ateliê`. Validade: por exemplo, 90 dias.
4. Em **Repository access**, marque **Only select repositories** e escolha
   `ateliedocesonho.github.io`.
5. Em **Repository permissions**, defina **Contents = Read and write**.
6. Clique em **Generate token** e copie o valor (`github_pat_...`).
7. Abra o painel, cole o token e clique em **Entrar no painel**.

O mesmo passo a passo aparece dentro da tela de login do painel. O token fica
apenas no `localStorage` daquele navegador, nunca no repositório. O botão
**Sair** apaga o token salvo.

## Uso no dia a dia

- **Adicionar produto:** cria um produto com valores de exemplo; preencha os
  campos e ao menos uma foto antes de publicar.
- **Editar:** toque em **Editar** no cartão do produto. Os campos aparecem dentro
  do próprio cartão.
- **Apresentações e preços:** uma linha por opção. Marque **Sob consulta**
  quando não houver preço fixo. **Máx. sabores** é opcional e só faz sentido
  quando há sabores.
- **Sabores:** deixe a lista vazia para produtos sem escolha de sabor. Escolha
  **Um sabor** ou **Vários sabores**.
- **Fotos:** use **Escolher foto** para selecionar um arquivo do celular ou
  **Usar foto que já existe...** para reaproveitar uma da branch `database`.
  Sempre preencha o nome do arquivo e o texto da foto (descrição para leitores
  de tela).
- **Esgotado:** marque **Produto esgotado** para mostrar o selo e bloquear o
  pedido daquele item.
- **Ordem:** use as setas ↑/↓; a ordem no painel é a ordem no catálogo.
- **Duplicar / excluir:** botões no cartão do produto. Exclusão pede confirmação.

Nada é publicado até clicar em **Publicar alterações**. A barra no rodapé avisa
quando há alterações pendentes. O botão **Recarregar** descarta o rascunho e
busca a versão atual do GitHub (útil se outra pessoa editou o JSON).

Se aparecer aviso de conflito ao publicar, clique em **Recarregar** e refaça as
alterações sobre a versão mais recente.

## Fotos

O arquivo **não é enviado** quando você escolhe. Ele fica só no aparelho e sobe
para `products/` da branch `database` **junto com o botão Publicar**. Assim você
pode trocar de ideia e cancelar sem deixar arquivos perdidos no repositório.
As fotos antigas, que estão na `main`, continuam sendo exibidas pelo site; a
branch `database` só guarda fotos novas enviadas pelo painel.

O campo **Nome da foto no repositório** define como o arquivo vai se chamar na
branch e no menu de fotos existentes (ex.: `brownie-de-aniversario.jpg`). Use
letras sem acento e termine com a extensão da imagem. Limite: 5 MB por foto.

## Segurança

- O token tem permissão de escrita no repositório. Trate-o como senha.
- Não commite, não mande por WhatsApp/e-mail e não deixe o painel logado em
  computador compartilhado.
- Para revogar: GitHub → Settings → Developer settings → Tokens → selecionar o
  token → Revoke. Depois é só gerar outro e colar no painel.
- A rota do painel é pública, mas quem abrir sem token não consegue ler nem
  escrever nada.

## Código e manutenção

- Tudo é React + Tailwind, integrado ao app:
  - `src/pages/AdminPage.tsx` — tela e fluxo de publicação;
  - `src/components/admin/` — formulários e controles do painel;
  - `src/lib/adminApi.ts` — API do GitHub Contents e token;
  - `src/lib/adminData.ts` — normalização e validação;
  - `src/lib/catalogSource.ts` — branch/caminhos do catálogo e das fotos.
- A rota é `#/admin`, declarada em `src/router/AppRouter.tsx`.
- O token e os caminhos ficam em `src/lib/catalogSource.ts`. Se o repositório ou
  a branch mudar, atualize lá.
- O JSON embutido em `src/data/catalogs/encomendas.json` continua no `main` como
  reserva caso a branch `database` não esteja disponível.
