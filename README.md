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

**Em desenvolvimento.**

- Estrutura do banco de dados criada.
- Relacionamentos e políticas RLS configurados.
- Regras de reserva e expiração implementadas no banco.
- Interface inicial de navegação e formulários criada.
- Integração da autenticação em fase de testes e correção.
- Integração completa das doações e reservas com a interface ainda pendente.
- Publicação final da aplicação ainda pendente.

## Projeto acadêmico

Desenvolvido como parte do **Tema Integrador II**, do curso de Análise e Desenvolvimento de Sistemas da Universidade Iguaçu (UNIG).

O projeto busca aplicar conhecimentos de desenvolvimento web, modelagem de banco de dados, autenticação, segurança e integração entre frontend e backend.

### Integrantes

- **Caique Casemiro**
- **Thiele Vitória**
- **Yuri Lima**

### Instituição

**Universidade Iguaçu (UNIG)**  
Curso: Análise e Desenvolvimento de Sistemas  
Disciplina: Tema Integrador II  
Ano: 2026

O projeto foi desenvolvido com o objetivo de contribuir para a redução do desperdício de alimentos e incentivar a solidariedade comunitária por meio da tecnologia.
