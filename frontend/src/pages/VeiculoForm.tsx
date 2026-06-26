import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import InputMask from "react-input-mask";
import { veiculoService } from "../services/veiculoService";
import { clienteService } from "../services/clienteService";
import { Cliente } from "../types/Cliente";

export default function VeiculoForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  // Estados
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(true);

  // Estado dos campos com validação
  const [fieldErrors, setFieldErrors] = useState({
    placa: "",
    marca: "",
    modelo: "",
    ano: "",
    cor: "",
    clienteId: "",
  });

  // Dados do formulário
  const [formData, setFormData] = useState({
    clienteId: "",
    placa: "",
    marca: "",
    modelo: "",
    ano: new Date().getFullYear(),
    cor: "",
    observacoes: "",
  });

  // Carregar clientes para o select
  useEffect(() => {
    carregarClientes();
  }, []);

  // Carregar dados se for edição
  useEffect(() => {
    if (isEdit) {
      carregarVeiculo();
    }
  }, [id]);

  const carregarClientes = async () => {
    try {
      setLoadingClientes(true);
      const dados = await clienteService.listar();
      setClientes(dados);
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
    } finally {
      setLoadingClientes(false);
    }
  };

  const carregarVeiculo = async () => {
    try {
      setLoading(true);
      const veiculo = await veiculoService.buscarPorId(id!);
      if (veiculo) {
        setFormData({
          clienteId: veiculo.clienteId || "",
          placa: veiculo.placa,
          marca: veiculo.marca,
          modelo: veiculo.modelo,
          ano: veiculo.ano,
          cor: veiculo.cor,
          observacoes: veiculo.observacoes || "",
        });
      } else {
        setError("Veículo não encontrado");
      }
    } catch (err) {
      setError("Erro ao carregar veículo");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // VALIDAÇÕES
  // ============================================

  const validarPlaca = (placa: string): string => {
    if (!placa.trim()) return "Placa é obrigatória";
    const regex = /^[A-Z]{3}-\d{1}[A-Z]\d{2}$|^[A-Z]{3}-\d{4}$/;
    if (!regex.test(placa.toUpperCase())) {
      return "Placa inválida (ex: ABC-1234 ou ABC-1D23)";
    }
    return "";
  };

  const validarMarca = (marca: string): string => {
    if (!marca.trim()) return "Marca é obrigatória";
    if (marca.trim().length < 2)
      return "Marca deve ter pelo menos 2 caracteres";
    return "";
  };

  const validarModelo = (modelo: string): string => {
    if (!modelo.trim()) return "Modelo é obrigatório";
    if (modelo.trim().length < 2)
      return "Modelo deve ter pelo menos 2 caracteres";
    return "";
  };

  const validarAno = (ano: number): string => {
    const anoAtual = new Date().getFullYear();
    if (!ano || ano < 1900) return "Ano inválido";
    if (ano > anoAtual + 1) return `Ano não pode ser maior que ${anoAtual + 1}`;
    return "";
  };

  const validarCor = (cor: string): string => {
    if (!cor.trim()) return "Cor é obrigatória";
    return "";
  };

  // ============================================
  // HANDLER CORRIGIDO
  // ============================================

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (!name) return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validar campo em tempo real
    if (name === "placa") {
      setFieldErrors((prev) => ({
        ...prev,
        placa: validarPlaca(value as string),
      }));
    }
    if (name === "marca") {
      setFieldErrors((prev) => ({
        ...prev,
        marca: validarMarca(value as string),
      }));
    }
    if (name === "modelo") {
      setFieldErrors((prev) => ({
        ...prev,
        modelo: validarModelo(value as string),
      }));
    }
    if (name === "ano") {
      setFieldErrors((prev) => ({ ...prev, ano: validarAno(Number(value)) }));
    }
    if (name === "cor") {
      setFieldErrors((prev) => ({ ...prev, cor: validarCor(value as string) }));
    }
    if (name === "clienteId") {
      setFieldErrors((prev) => ({
        ...prev,
        clienteId: value ? "" : "Selecione um cliente",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validar todos os campos antes de enviar
    const erroPlaca = validarPlaca(formData.placa);
    const erroMarca = validarMarca(formData.marca);
    const erroModelo = validarModelo(formData.modelo);
    const erroAno = validarAno(formData.ano);
    const erroCor = validarCor(formData.cor);

    setFieldErrors({
      placa: erroPlaca,
      marca: erroMarca,
      modelo: erroModelo,
      ano: erroAno,
      cor: erroCor,
      clienteId: formData.clienteId ? "" : "Selecione um cliente",
    });

    if (
      erroPlaca ||
      erroMarca ||
      erroModelo ||
      erroAno ||
      erroCor ||
      !formData.clienteId
    ) {
      setError("Por favor, corrija os campos destacados");
      return;
    }

    try {
      setSaving(true);

      const dadosParaEnviar = {
        ...formData,
        placa: formData.placa.toUpperCase(),
        ano: Number(formData.ano),
      };

      if (isEdit) {
        await veiculoService.atualizar(id!, dadosParaEnviar);
      } else {
        await veiculoService.criar(dadosParaEnviar);
      }

      navigate("/veiculos");
    } catch (err: any) {
      console.error("❌ Erro detalhado:", err.response?.data);
      setError(err.response?.data?.error || "Erro ao salvar veículo");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate("/veiculos");
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
        <Typography variant="h4">
          {isEdit ? "✏️ Editar Veículo" : "➕ Novo Veículo"}
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
          <Typography variant="h6" gutterBottom sx={{ color: "#1a237e" }}>
            Dados do Veículo
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {/* Cliente */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!fieldErrors.clienteId}>
                <InputLabel>Cliente *</InputLabel>
                <Select
                  name="clienteId"
                  value={formData.clienteId}
                  onChange={handleChange}
                  label="Cliente *"
                  disabled={loadingClientes}
                >
                  <MenuItem value="">Selecione um cliente</MenuItem>
                  {clientes.map((cliente) => (
                    <MenuItem key={cliente.id} value={cliente.id}>
                      {cliente.nome} - {cliente.telefone}
                    </MenuItem>
                  ))}
                </Select>
                {fieldErrors.clienteId && (
                  <Typography variant="caption" color="error">
                    {fieldErrors.clienteId}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Placa com Máscara */}
            <Grid item xs={12} md={6}>
              <InputMask
                mask="aaa-9999"
                maskChar=""
                value={formData.placa}
                onChange={handleChange}
                onBlur={() => {
                  const erro = validarPlaca(formData.placa);
                  setFieldErrors((prev) => ({ ...prev, placa: erro }));
                }}
              >
                {(inputProps: any) => (
                  <TextField
                    {...inputProps}
                    fullWidth
                    label="Placa *"
                    name="placa"
                    required
                    placeholder="ABC-1234"
                    error={!!fieldErrors.placa}
                    helperText={
                      fieldErrors.placa || "Formato: ABC-1234 ou ABC-1D23"
                    }
                    inputProps={{ style: { textTransform: "uppercase" } }}
                  />
                )}
              </InputMask>
            </Grid>

            {/* Marca */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Marca *"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                required
                placeholder="Ex: Honda, Toyota, Fiat"
                error={!!fieldErrors.marca}
                helperText={fieldErrors.marca}
                onBlur={() => {
                  const erro = validarMarca(formData.marca);
                  setFieldErrors((prev) => ({ ...prev, marca: erro }));
                }}
              />
            </Grid>

            {/* Modelo */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Modelo *"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                required
                placeholder="Ex: Civic, Corolla, Palio"
                error={!!fieldErrors.modelo}
                helperText={fieldErrors.modelo}
                onBlur={() => {
                  const erro = validarModelo(formData.modelo);
                  setFieldErrors((prev) => ({ ...prev, modelo: erro }));
                }}
              />
            </Grid>

            {/* Ano */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ano *"
                name="ano"
                type="number"
                value={formData.ano}
                onChange={handleChange}
                required
                placeholder={String(new Date().getFullYear())}
                error={!!fieldErrors.ano}
                helperText={fieldErrors.ano}
                onBlur={() => {
                  const erro = validarAno(formData.ano);
                  setFieldErrors((prev) => ({ ...prev, ano: erro }));
                }}
                inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
              />
            </Grid>

            {/* Cor */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cor *"
                name="cor"
                value={formData.cor}
                onChange={handleChange}
                required
                placeholder="Ex: Prata, Preto, Branco"
                error={!!fieldErrors.cor}
                helperText={fieldErrors.cor}
                onBlur={() => {
                  const erro = validarCor(formData.cor);
                  setFieldErrors((prev) => ({ ...prev, cor: erro }));
                }}
              />
            </Grid>

            {/* Observações */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="Informações adicionais sobre o veículo"
              />
            </Grid>
          </Grid>

          {/* Botões */}
          <Box
            sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "flex-end" }}
          >
            <Button variant="outlined" onClick={handleBack} disabled={saving}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={
                saving ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SaveIcon />
                )
              }
              disabled={saving}
              sx={{
                bgcolor: "#ff6f00",
                "&:hover": { bgcolor: "#e65100" },
              }}
            >
              {saving ? "Salvando..." : isEdit ? "Atualizar" : "Salvar"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
