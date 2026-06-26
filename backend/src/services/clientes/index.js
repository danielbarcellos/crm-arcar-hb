const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// BANCO DE DADOS EM MEMÓRIA
// ============================================

let clientes = [];

// Dados iniciais para teste
const dadosIniciais = [
  {
    id: '1',
    nome: 'João Silva',
    email: 'joao@email.com',
    telefone: '(11) 99999-9999',
    endereco: {
      rua: 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    nome: 'Maria Santos',
    email: 'maria@email.com',
    telefone: '(11) 88888-8888',
    endereco: {
      rua: 'Avenida Brasil',
      numero: '456',
      bairro: 'Jardim',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '98765-432'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

clientes = [...dadosIniciais];

// ============================================
// VALIDAÇÃO (Endereço Opcional)
// ============================================

const clienteSchema = Joi.object({
  nome: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  telefone: Joi.string().min(8).max(20).required(),
  endereco: Joi.object({
    rua: Joi.string().allow('', null).default('').optional(),
    numero: Joi.string().allow('', null).default('').optional(),
    bairro: Joi.string().allow('', null).default('').optional(),
    cidade: Joi.string().allow('', null).default('').optional(),
    estado: Joi.string().allow('', null).default('').optional(),
    cep: Joi.string().allow('', null).default('').optional()
  }).optional().default({})
});

// ============================================
// ROTAS
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'ARCAR HB - Clientes (Memória)',
    timestamp: new Date().toISOString(),
    totalClientes: clientes.length
  });
});

// Listar todos os clientes
app.get('/clientes', (req, res) => {
  res.json(clientes);
});

// Buscar cliente por ID
app.get('/clientes/:id', (req, res) => {
  const cliente = clientes.find(c => c.id === req.params.id);
  if (!cliente) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }
  res.json(cliente);
});

// Buscar clientes por termo (pesquisa)
app.get('/clientes/buscar/:termo', (req, res) => {
  const { termo } = req.params;
  const resultados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(termo.toLowerCase()) ||
    cliente.email.toLowerCase().includes(termo.toLowerCase()) ||
    cliente.telefone.includes(termo)
  );
  res.json(resultados);
});

// Criar novo cliente
app.post('/clientes', (req, res) => {
  console.log('📥 Serviço recebeu dados:', JSON.stringify(req.body, null, 2));
  
  // Garantir que o endereço existe
  if (!req.body.endereco) {
    req.body.endereco = {};
  }
  
  // Garantir que todos os campos de endereço existam
  const camposEndereco = ['rua', 'numero', 'bairro', 'cidade', 'estado', 'cep'];
  camposEndereco.forEach(campo => {
    if (req.body.endereco[campo] === undefined || req.body.endereco[campo] === null) {
      req.body.endereco[campo] = '';
    }
  });
  
  // Validar dados
  const { error, value } = clienteSchema.validate(req.body);
  if (error) {
    console.log('❌ Erro de validação:', error.details[0].message);
    return res.status(400).json({ 
      error: error.details[0].message,
      camposRecebidos: Object.keys(req.body)
    });
  }

  const cliente = {
    id: uuidv4(),
    nome: value.nome,
    email: value.email,
    telefone: value.telefone,
    endereco: {
      rua: value.endereco?.rua || '',
      numero: value.endereco?.numero || '',
      bairro: value.endereco?.bairro || '',
      cidade: value.endereco?.cidade || '',
      estado: value.endereco?.estado || '',
      cep: value.endereco?.cep || ''
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  clientes.push(cliente);
  console.log('✅ Cliente criado com sucesso! ID:', cliente.id);
  res.status(201).json(cliente);
});

// Atualizar cliente
app.put('/clientes/:id', (req, res) => {
  console.log('📥 Serviço recebeu atualização:', JSON.stringify(req.body, null, 2));
  
  // Garantir que o endereço existe
  if (!req.body.endereco) {
    req.body.endereco = {};
  }
  
  // Garantir que todos os campos de endereço existam
  const camposEndereco = ['rua', 'numero', 'bairro', 'cidade', 'estado', 'cep'];
  camposEndereco.forEach(campo => {
    if (req.body.endereco[campo] === undefined || req.body.endereco[campo] === null) {
      req.body.endereco[campo] = '';
    }
  });
  
  // Validar dados
  const { error, value } = clienteSchema.validate(req.body);
  if (error) {
    console.log('❌ Erro de validação:', error.details[0].message);
    return res.status(400).json({ 
      error: error.details[0].message,
      camposRecebidos: Object.keys(req.body)
    });
  }

  const index = clientes.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }

  const cliente = {
    id: req.params.id,
    nome: value.nome,
    email: value.email,
    telefone: value.telefone,
    endereco: {
      rua: value.endereco?.rua || '',
      numero: value.endereco?.numero || '',
      bairro: value.endereco?.bairro || '',
      cidade: value.endereco?.cidade || '',
      estado: value.endereco?.estado || '',
      cep: value.endereco?.cep || ''
    },
    createdAt: clientes[index].createdAt,
    updatedAt: new Date().toISOString()
  };

  clientes[index] = cliente;
  console.log('✅ Cliente atualizado com sucesso! ID:', cliente.id);
  res.json(cliente);
});

// Excluir cliente
app.delete('/clientes/:id', (req, res) => {
  const index = clientes.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }

  clientes.splice(index, 1);
  res.status(204).send();
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log(`🚗 ARCAR HB - Serviço de Clientes (Memória) rodando na porta ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Clientes carregados: ${clientes.length}`);
  console.log(`🔧 Modo: DESENVOLVIMENTO (dados em memória)`);
});