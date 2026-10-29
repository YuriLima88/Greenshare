# GreenShare

**Rede de Doação e Reaproveitamento de Alimentos Excedentes**

O GreenShare é uma plataforma web que busca conectar pessoas interessadas em doar alimentos excedentes a pessoas que possam aproveitá-los, contribuindo para a redução do desperdício e incentivando a solidariedade na comunidade.

## Objetivo

Facilitar a divulgação e a reserva de alimentos disponíveis para doação, permitindo que doadores e receptores se conectem e combinem a retirada dos itens.

## Tecnologias

- **Frontend:** React e TypeScript, desenvolvido com auxílio do Lovable.
- **Backend e banco de dados:** Supabase.
- **Banco relacional:** PostgreSQL.
- **Autenticação:** Supabase Auth.
- **Armazenamento de imagens:** Supabase Storage.
- **Versionamento:** Git e GitHub.

## Funcionalidades previstas

- Cadastro e autenticação de usuários.
- Perfis de doador, receptor ou ambos.
- Cadastro, edição e exclusão de doações.
- Inclusão de fotos e informações sobre os alimentos.
- Consulta e filtragem das doações disponíveis.
- Reserva de alimentos para retirada.
- Controle dos estados das doações e reservas.
- Histórico das doações e reservas.
- Expiração automática de reservas não concluídas.

## Estrutura do banco de dados

O banco de dados PostgreSQL possui três tabelas principais:

### USUARIO
Armazena informações dos usuários cadastrados, incluindo nome, e-mail, telefone, bairro, tipo de pessoa e perfil. O campo `auth_id` estabelece a ligação com o Supabase Auth.

### DOACAO
Armazena as informações dos alimentos oferecidos, incluindo título, descrição, categoria, quantidade, unidade de medida, validade, local e janela de retirada, foto e status.

### RESERVA
Registra as reservas realizadas pelos receptores, vinculando cada reserva a uma doação e a um usuário, com informações sobre status, prazo de expiração e retirada.

**Relacionamentos:**
- Um usuário pode cadastrar várias doações.
- Um usuário pode realizar várias reservas.
- Uma doação pode possuir um histórico de reservas, mas apenas uma reserva ativa por vez.

## Segurança e regras de negócio

O projeto utiliza políticas de segurança em nível de linha (RLS) no Supabase, relacionamentos por chaves estrangeiras e mecanismos no banco para controlar reservas e seus prazos de expiração.

## Situação do desenvolvimento

**Aplicação desenvolvida e publicada.**

- Banco de dados PostgreSQL estruturado no Supabase, com três tabelas relacionadas.
- Políticas de segurança RLS e regras de negócio configuradas.
- Cadastro, autenticação e gerenciamento de sessões integrados ao Supabase Auth.
- Cadastro, consulta, edição, inativação e exclusão de doações implementados.
- Upload e exibição de imagens das doações integrados ao Supabase Storage.
- Reserva e cancelamento de alimentos implementados.
- Controle de disponibilidade e expiração automática das reservas.
- Interface responsiva com navegação pública e área autenticada.
- Código-fonte disponibilizado em repositório público no GitHub.

**Aplicação publicada:** https://greensharecomunidade.lovable.app

## Projeto acadêmico

Desenvolvido como parte do **Tema Integrador II**, do curso de Análise e Desenvolvimento de Sistemas da Universidade Iguaçu (UNIG).

O projeto busca aplicar conhecimentos de desenvolvimento web, modelagem de banco de dados, autenticação, segurança e integração entre frontend e backend.

### Integrantes

- **[Intergante 1]**
- **[Integrante 2]**
- **Yuri Lima**

### Instituição

**Universidade Iguaçu (UNIG)**  
Curso: Análise e Desenvolvimento de Sistemas  
Disciplina: Tema Integrador II  
Ano: 2026
