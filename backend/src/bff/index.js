const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Logging simples
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'ARCAR HB BFF',
    timestamp: new Date().toISOString() 
  });
});

// ============================================
// ROTAS DE CLIENTES (via proxy para microsserviço)
// ============================================

// Importar as rotas de clientes
const clientesRoutes = require('./routes/clientes');

// Usar as rotas
app.use('/api/clientes', clientesRoutes);

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log(`🚗 ARCAR HB BFF rodando na porta ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
});