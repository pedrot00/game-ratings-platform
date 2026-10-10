# 🎮 GameAval.io

> **Descubra, avalie e organize sua aventura gamer.**

O GameAval.io é uma plataforma web voltada para o universo dos jogos eletrônicos, inspirada em redes sociais de avaliação como o Letterboxd. O objetivo é centralizar informações, avaliações e opiniões de jogadores sobre títulos de todas as plataformas, permitindo que os usuários descubram novos jogos, registrem suas experiências e compartilhem opiniões com uma comunidade apaixonada.

---

## 🎯 Objetivo

Desenvolver uma plataforma voltada para jogos eletrônicos, inspirada no conceito de **redes sociais de avaliação** (como o Letterboxd), que permita:

- Descobrir novos jogos.
- Avaliar títulos já jogados.
- Organizar listas pessoais.
- Compartilhar experiências com outros jogadores.

---

## 👥 Público-Alvo

Pessoas que possuem **interesse em jogos eletrônicos** e que buscam:

- Descobrir novos títulos.
- Avaliar os jogos que já jogaram.
- Compartilhar suas experiências com outros jogadores.

---

## ⚙️ Funcionalidades

1. **Cadastro e Login de Usuários** — Criação de perfis e autenticação.
2. **Perfil do Usuário** — Página com informações básicas, avaliações, jogos registrados e atividades.
3. **Pesquisa de Jogos** — Busca por nome e filtragem por gênero, plataforma, data de lançamento e avaliação.
4. **Página de Detalhes do Jogo** — Nome, descrição, gênero, desenvolvedora, publicadora, data de lançamento e plataformas.
5. **Avaliação de Jogos** — Atribuição de notas e criação de média da comunidade.
6. **Publicação de Avaliações e Opiniões** — Comentários e avaliações escritas por usuários.
7. **Registro de Jogos** — Marcar jogos como *já jogou*, *está jogando* ou *pretende jogar*.
8. **Sistema de Seguir Usuários** — Acompanhar atividades de outros jogadores.
9. **Feed de Atividades** — Atividades recentes de quem o usuário segue.
10. **Interação entre Usuários** — Curtidas e comentários em avaliações.
11. **Sistema de Administração** — Gerenciamento de usuários, jogos, avaliações e conteúdos.

---

## 🖥️ Telas do Sistema

| # | Tela | Descrição |
|---|------|-----------|
| 1 | **Login e Cadastro** | Criar conta e/ou fazer login. |
| 2 | **Página Inicial (Feed)** | Jogos recentes/populares e atividades de usuários seguidos. |
| 3 | **Busca de Jogos** | Pesquisa com filtros por gênero, plataforma, data e avaliação. |
| 4 | **Detalhes do Jogo** | Informações completas + média de avaliações e opiniões. |
| 5 | **Avaliar Jogo** | Atribuir nota e escrever avaliação. |
| 6 | **Perfil do Usuário** | Descrição, avaliações, jogos registrados, listas e atividades. |
| 7 | **Painel Administrativo** | Gerenciamento de usuários, jogos, avaliações e conteúdos. |

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) |
| **Backend** | Elixir |
| **Framework** | Phoenix |
| **Banco de Dados** | PostgreSQL |
| **API Externa** | API da Steam (para obter informações dos jogos) |

---

## 🏗️ Arquitetura do Projeto

A estrutura de pastas foi organizada para separar claramente as responsabilidades do **backend** (Elixir/Phoenix) e do **frontend** (HTML/CSS/JS).

```text
GameAval.io/
│
├── backend/                          # Aplicação Elixir/Phoenix
│   ├── echo/                         # Configurações e arquivos de ambiente
│   └── src/
│       ├── controllers/              # Controladores (recebem requisições)
│       ├── services/                 # Regras de negócio
│       ├── routers/                  # Definição de rotas
│       ├── config/                   # Configurações da aplicação
│       └── middlewares/              # Middlewares (autenticação, logs, etc.)
│
├── frontend/                         # Interface do usuário
│   ├── Pages/                        # Páginas HTML
│   │   ├── login.html                # Tela de Login e Cadastro
│   │   ├── feed.html                 # Página Inicial (Feed)
│   │   ├── search.html               # Busca de Jogos
│   │   ├── game-details.html         # Detalhes do Jogo
│   │   ├── review.html               # Avaliar Jogo
│   │   ├── profile.html              # Perfil do Usuário
│   │   └── admin.html                # Painel Administrativo
│   │
│   ├── Style/                        # Estilos CSS
│   │   └── style.css
│   │
│   ├── Scripts/                      # JavaScript de cada página
│   │   ├── login.js
│   │   ├── feed.js
│   │   ├── search.js
│   │   ├── game-details.js
│   │   ├── review.js
│   │   ├── profile.js
│   │   └── admin.js
│   │
│   └── assets/                       # Imagens, ícones e fontes
│       └── images/
│
└── README.md
```

## 👨‍💻 Equipe

| Nome | Matrícula |
|------|-----------|
| Paulo Claudio Jácome | 115849 |
| Pedro Santos Teixeira | 116224 |
| Carlos Eduardo Pereira Oliveira | 116233 |
| Nathan da Silva Lopes | 89384 |

---

## 📄 Licença

Este projeto é desenvolvido para fins acadêmicos. Todos os direitos reservados aos autores.
