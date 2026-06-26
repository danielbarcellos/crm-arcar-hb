import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import InputMask from 'react-input-mask';
import { clienteService } from '../services/clienteService';

export default function ClienteForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  // Estados
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado dos campos com validação
  const [fieldErrors, setFieldErrors] = useState({
    nome: '',
    email: '',
    telefone: '',
  });

  // Dados do formulário
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: {
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
    },
  });

  // Carregar dados se for edição
  useEffect(() => {
    if (isEdit) {
      carregarCliente();
    }
  }, [id]);

  const carregarCliente = async () => {
    try {
      setLoading(true);
      const cliente = await clienteService.buscarPorId(id!);
      if (cliente) {
        setFormData({
          nome: cliente.nome,
          email: cliente.email,
          telefone: cliente.telefone,
          endereco: {
            rua: cliente.endereco.rua,
            numero: cliente.endereco.numero,
            bairro: cliente.endereco.bairro,
            cidade: cliente.endereco.cidade,
            estado: cliente.endereco.estado,
            cep: cliente.endereco.cep,
          },
        });
      } else {
        setError('Cliente não encontrado');
      }
    } catch (err) {
      setError('Erro ao carregar cliente');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // VALIDAÇÕES
  // ============================================

  const validarNome = (nome: string): string => {
    if (!nome.trim()) return 'Nome é obrigatório';
    if (nome.trim().length < 3) return 'Nome deve ter pelo menos 3 caracteres';
    return '';
  };

  const validarEmail = (email: string): string => {
    if (!email.trim()) return 'Email é obrigatório';
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) return 'Email inválido (ex: email@dominio.com)';
    return '';
  };

  const validarTelefone = (telefone: string): string => {
    if (!telefone.trim()) return 'Telefone é obrigatório';
    const numeros = telefone.replace(/\D/g, '');
    if (numeros.length < 10) return 'Telefone deve ter DDD + número (ex: 5199999999)';
    if (numeros.length > 11) return 'Telefone deve ter no máximo 11 dígitos';
    return '';
  };

  // ============================================
  // HANDLERS
  // ============================================

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Atualizar campo
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Validar campo em tempo real
    if (name === 'nome') {
      setFieldErrors(prev => ({ ...prev, nome: validarNome(value) }));
    }
    if (name === 'email') {
      setFieldErrors(prev => ({ ...prev, email: validarEmail(value) }));
    }
    if (name === 'telefone') {
      setFieldErrors(prev => ({ ...prev, telefone: validarTelefone(value) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validar todos os campos antes de enviar
    const erroNome = validarNome(formData.nome);
    const erroEmail = validarEmail(formData.email);
    const erroTelefone = validarTelefone(formData.telefone);

    setFieldErrors({
      nome: erroNome,
      email: erroEmail,
      telefone: erroTelefone,
    });

    if (erroNome || erroEmail || erroTelefone) {
      setError('Por favor, corrija os campos destacados');
      return;
    }

    try {
      setSaving(true);

      // Limpar formatação do telefone antes de enviar
      const dadosParaEnviar = {
        ...formData,
        telefone: formData.telefone.replace(/\D/g, ''),
      };

      if (isEdit) {
        await clienteService.atualizar(id!, dadosParaEnviar);
      } else {
        await clienteService.criar(dadosParaEnviar);
      }

      navigate('/clientes');
    } catch (err: any) {
      console.error('❌ Erro detalhado:', err.response?.data);
      setError(err.response?.data?.error || 'Erro ao salvar cliente');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/clientes');
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mr: 2 }}>
          Voltar
        </Button>
        <Typography variant="h4">
          {isEdit ? '✏️ Editar Cliente' : '➕ Novo Cliente'}
        </Typography>
      </Box>

      {/* Formulário */}
      <Paper sx={{ p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom sx={{ color: '#1a237e' }}>
            Dados Pessoais
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {/* Nome */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome Completo"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                placeholder="Digite o nome completo"
                error={!!fieldErrors.nome}
                helperText={fieldErrors.nome}
                onBlur={() => {
                  const erro = validarNome(formData.nome);
                  setFieldErrors(prev => ({ ...prev, nome: erro }));
                }}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="email@dominio.com"
                error={!!fieldErrors.email}
                helperText={fieldErrors.email}
                onBlur={() => {
                  const erro = validarEmail(formData.email);
                  setFieldErrors(prev => ({ ...prev, email: erro }));
                }}
              />
            </Grid>

            {/* Telefone com Máscara */}
            <Grid item xs={12} md={6}>
              <InputMask
                mask="(99) 99999-9999"
                value={formData.telefone}
                onChange={handleChange}
                onBlur={() => {
                  const erro = validarTelefone(formData.telefone);
                  setFieldErrors(prev => ({ ...prev, telefone: erro }));
                }}
              >
                {(inputProps: any) => (
                  <TextField
                    {...inputProps}
                    fullWidth
                    label="Telefone"
                    name="telefone"
                    required
                    placeholder="(11) 99999-9999"
                    error={!!fieldErrors.telefone}
                    helperText={fieldErrors.telefone}
                  />
                )}
              </InputMask>
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ color: '#1a237e', mt: 4 }}>
            Endereço
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {/* Rua */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Rua"
                name="endereco.rua"
                value={formData.endereco.rua}
                onChange={handleChange}
                placeholder="Nome da rua"
              />
            </Grid>

            {/* Número */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Número"
                name="endereco.numero"
                value={formData.endereco.numero}
                onChange={handleChange}
                placeholder="123"
              />
            </Grid>

            {/* Bairro */}
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Bairro"
                name="endereco.bairro"
                value={formData.endereco.bairro}
                onChange={handleChange}
                placeholder="Nome do bairro"
              />
            </Grid>

            {/* Cidade */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cidade"
                name="endereco.cidade"
                value={formData.endereco.cidade}
                onChange={handleChange}
                placeholder="Nome da cidade"
              />
            </Grid>

            {/* Estado */}
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Estado"
                name="endereco.estado"
                value={formData.endereco.estado}
                onChange={handleChange}
                placeholder="SP"
                inputProps={{ maxLength: 2 }}
              />
            </Grid>

            {/* CEP com Máscara */}
            <Grid item xs={12} sm={3}>
              <InputMask
                mask="99999-999"
                value={formData.endereco.cep}
                onChange={handleChange}
              >
                {(inputProps: any) => (
                  <TextField
                    {...inputProps}
                    fullWidth
                    label="CEP"
                    name="endereco.cep"
                    placeholder="12345-678"
                  />
                )}
              </InputMask>
            </Grid>
          </Grid>

          {/* Botões */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={handleBack} disabled={saving}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              disabled={saving}
              sx={{
                bgcolor: '#ff6f00',
                '&:hover': { bgcolor: '#e65100' },
              }}
            >
              {saving ? 'Salvando...' : isEdit ? 'Atualizar' : 'Salvar'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}