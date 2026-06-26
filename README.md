# ARCAR HB - Sistema de Gestão para Oficina de Ar Condicionado Automotivo

Sistema completo de gestão para a oficina ARCAR HB, especializada em manutenção de ar condicionado automotivo.

---

## Sobre o Projeto

O ARCAR HB é um CRM desenvolvido sob medida para oficinas de ar condicionado automotivo. Com ele você pode gerenciar clientes, veículos e ordens de serviço de forma integrada e eficiente.

### Funcionalidades

#### Clientes
- Cadastro completo com validacao
- Mascaras para telefone e CEP
- Busca por nome, email ou telefone
- Paginacao e ordenacao
- Visualizacao em tabela ou cards
- Exportacao para Excel, PDF e CSV
- Filtros avancados por cidade e estado
- Selecao multipla e acoes em lote

#### Veiculos
- Cadastro vinculado a clientes
- Mascara para placa
- Busca por placa, marca ou modelo
- Paginacao e ordenacao
- Visualizacao em tabela ou cards

#### Ordens de Servico
- Status: Aberta, Em Andamento, Finalizada, Cancelada
- Itens dinamicos com calculo automatico
- Alteracao de status com dialogo interativo
- Busca por numero, cliente ou veiculo
- Edicao bloqueada para OS finalizadas ou canceladas
- Visualizacao detalhada

---

## Tecnologias Utilizadas

### Frontend
- React 18.x
- TypeScript 5.x
- Material-UI 5.x
- React Router DOM 6.x
- React Query 4.x
- Axios 1.x
- Recharts 2.x
- xlsx (Exportacao Excel)
- jspdf (Exportacao PDF)

### Backend (em desenvolvimento)
- Node.js
- Express
- AWS DynamoDB (via LocalStack)

---

## Estrutura do Projeto

```
crm-arcar-hb/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Clientes.tsx
│   │   │   ├── ClienteForm.tsx
│   │   │   ├── Veiculos.tsx
│   │   │   ├── VeiculoForm.tsx
│   │   │   ├── OrdensServico.tsx
│   │   │   ├── OSForm.tsx
│   │   │   └── OSSVisualizar.tsx
│   │   ├── services/
│   │   │   ├── clienteService.ts
│   │   │   ├── veiculoService.ts
│   │   │   ├── osService.ts
│   │   │   └── exportService.ts
│   │   ├── types/
│   │   │   ├── Cliente.ts
│   │   │   ├── Veiculo.ts
│   │   │   └── OrdemServico.ts
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── theme.ts
│   ├── package.json
│   └── tsconfig.json
├── backend/
│   └── src/
│       ├── bff/
│       │   ├── index.js
│       │   ├── routes/
│       │   └── package.json
│       └── services/
│           └── clientes/
│               ├── index.js
│               └── package.json
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Como Rodar o Projeto

### Pre-requisitos
- Node.js 18+
- NPM ou Yarn
- Git

### Passo a Passo

1. Clone o repositorio
git clone https://github.com/danielbarcellos/crm-arcar-hb.git
cd crm-arcar-hb

2. Instale as dependencias do frontend
cd frontend
npm install

3. Instale as dependencias do backend
cd ../backend/src/bff
npm install
cd ../services/clientes
npm install

4. Inicie o backend (3 terminais diferentes)

Terminal 1 - Servico de Clientes
cd backend/src/services/clientes
npm run dev

Terminal 2 - BFF
cd backend/src/bff
npm run dev

Terminal 3 - Frontend
cd frontend
npm start

5. Acesse o sistema
Frontend: http://localhost:3000
BFF: http://localhost:3000/api
Servico Clientes: http://localhost:3001

---

## Scripts Disponiveis

### Frontend
npm start          - Inicia o servidor de desenvolvimento
npm run build      - Gera a build de producao
npm test           - Executa os testes

### Backend
npm run dev        - Inicia o servidor com hot-reload
npm start          - Inicia o servidor em producao

---

## Deploy

### Deploy manual com Docker
docker build -t arcar-frontend -f frontend/Dockerfile .
docker build -t arcar-bff -f backend/Dockerfile.bff .
docker build -t arcar-clientes -f backend/services/clientes/Dockerfile .
docker-compose up -d

### CI/CD com GitHub Actions
O projeto inclui workflows configurados para testes automaticos, build de imagens Docker e deploy em cloud.

---

## Licenca

Este projeto e propriedade da ARCAR HB - Todos os direitos reservados.

---

## Creditos

### DeepSeek - Inteligencia Artificial

Este sistema foi desenvolvido com o suporte e orientacao do DeepSeek, que ajudou a construir este sistema do zero com paciencia, codigo limpo e muita dedicacao.

---

## Contato

Email: suporte@arcar.com.br
Website: www.arcar.com.br

---

Ultima atualizacao: 26 de Junho de 2026

Desenvolvido com ❤️ pela equipe ARCAR HB

Made with ❤️ by ARCAR HB Team
