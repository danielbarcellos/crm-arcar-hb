const express = require('express');
const router = express.Router();
const axios = require('axios');

// URL do microsserviço de clientes
const CLIENTES_SERVICE_URL = process.env.CLIENTES_SERVICE_URL || 'http://localhost:3001';

// ============================================
// ROTAS
// ============================================

// Listar todos os clientes
router.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${CLIENTES_SERVICE_URL}/clientes`);
    res.json(response.data);
  } catch (error) {
    console.error('Erro ao listar clientes:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Erro ao buscar clientes' 
    });
  }
});

// Buscar cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const response = await axios.get(`${CLIENTES_SERVICE_URL}/clientes/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Erro ao buscar cliente' 
    });
  }
});

// Buscar clientes (pesquisa)
router.get('/buscar/:termo', async (req, res) => {
  try {
    const response = await axios.get(`${CLIENTES_SERVICE_URL}/clientes/buscar/${req.params.termo}`);
    res.json(response.data);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Erro ao buscar clientes' 
    });
  }
});

// Criar novo cliente
// Criar novo cliente
router.post('/', async (req, res) => {
  try {
    console.log('📥 BFF recebeu dados:', JSON.stringify(req.body, null, 2));
    
    const response = await axios.post(`${CLIENTES_SERVICE_URL}/clientes`, req.body);
    console.log('✅ Cliente criado com sucesso:', response.data);
    
    res.status(201).json(response.data);
  } catch (error) {
    console.error('❌ Erro ao criar cliente no serviço:');
    console.error('Status:', error.response?.status);
    console.error('Dados do erro:', error.response?.data);
    console.error('Dados enviados:', req.body);
    
    res.status(error.response?.status || 500).json({ 
      error: 'Erro ao criar cliente',
      details: error.response?.data || error.message
    });
  }
});

// Atualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const response = await axios.put(`${CLIENTES_SERVICE_URL}/clientes/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Erro ao atualizar cliente' 
    });
  }
});

// Excluir cliente
router.delete('/:id', async (req, res) => {
  try {
    await axios.delete(`${CLIENTES_SERVICE_URL}/clientes/${req.params.id}`);
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir cliente:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Erro ao excluir cliente' 
    });
  }
});

module.exports = router;