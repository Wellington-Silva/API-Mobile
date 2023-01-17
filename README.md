# Sobre o App
Neste repositório está o back-end do projeto da disciplina de Programação para Dispositivos Móveis.
O nome do aplicativo é Questions Box, este, é um fórum online onde alunos e professores do IFS interagem entre si,
alguém seja professor ou aluno faz um pergunta e outros usuários respondem, sejam eles professores ou alunos também.
Neste aplicativo é possível criar TAGs para encaixar o assunto das perguntas.

**Tipos de usuário:**  
1 - aluno  
2 - professor  

# Listagem de Rotas e funcionalidades de cada uma delas

- USERS

```js
//  Rota para fazer
GET: "/users/login";

// Detalhes do usuário
GET: "/users/:id";

// Listar usuários
GET: "/users"

// Cadastrar usuário
POST: "/users"

// Editar usuário
PUT: "/users/:id"

// Revogar usuário
DELETE: "/users/:id"

```

- QUESTIONS

```js

// Listar perguntas pelas tag
GET: "/questions/questionbytag/:tagId"

// Buscar uma pergunta específica
GET: "/questions/:id"

// Criar uma pergunta
POST: "/questions/"

```

- RESPONSE

```js

// Listar Respostas de uma pergunta
GET: "/response/:questionId/:pagination"

// Responder uma pergunta
POST: "response/:id"

```

- TAGS

```js

// Listar Tags
GET: "/tags/list"

// Cadastrar uma TAG
POST: "/tags/"

```
