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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { osService } from "../services/osService";
import { clienteService, Cliente } from "../services/clienteService";
import { veiculoService, Veiculo } from "../services/veiculoService";
import { OrdemServicoInput, ItemOS } from "../types/OrdemServico";

export default function OSForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const isView = window.location.pathname.includes("visualizar");

  // Estados
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [loadingVeiculos, setLoadingVeiculos] = useState(true);

  // Dados do formulário
  const [formData, setFormData] = useState<OrdemServicoInput>({
    clienteId: "",
    veiculoId: "",
    dataPrevisao: "",
    itens: [],
    desconto: 0,
    observacoes: "",
  });

  const [itens, setItens] = useState<ItemOS[]>([]);
  const [novoItem, setNovoItem] = useState({
    descricao: "",
    quantidade: 1,
    valorUnitario: 0,
  });

  // Carregar dados
  useEffect(() => {
    carregarClientes();
    if (isEdit || isView) {
      carregarOS();
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

  const carregarVeiculos = async (clienteId?: string) => {
    try {
      setLoadingVeiculos(true);
      if (clienteId) {
        const dados = await veiculoService.listarPorCliente(clienteId);
        setVeiculos(dados);
      } else {
        const dados = await veiculoService.listar();
        setVeiculos(dados);
      }
    } catch (err) {
      console.error("Erro ao carregar veículos:", err);
    } finally {
      setLoadingVeiculos(false);
    }
  };

  const carregarOS = async () => {
    try {
      setLoading(true);
      const os = await osService.buscarPorId(id!);
      if (os) {
        setFormData({
          clienteId: os.clienteId,
          veiculoId: os.veiculoId,
          dataPrevisao: os.dataPrevisao ? os.dataPrevisao.split("T")[0] : "",
          itens: os.itens.map((item) => ({
            descricao: item.descricao,
            quantidade: item.quantidade,
            valorUnitario: item.valorUnitario,
          })),
          desconto: os.desconto,
          observacoes: os.observacoes || "",
        });
        setItens(os.itens);
        await carregarVeiculos(os.clienteId);
      } else {
        setError("OS não encontrada");
      }
    } catch (err) {
      setError("Erro ao carregar OS");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // HANDLERS
  // ============================================

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "clienteId") {
      carregarVeiculos(value);
      setFormData((prev) => ({
        ...prev,
        veiculoId: "",
      }));
    }
  };

  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNovoItem((prev) => ({
      ...prev,
      [name]: name === "descricao" ? value : Number(value) || 0,
    }));
  };

  const handleAddItem = () => {
    if (!novoItem.descricao.trim()) {
      setError("Descrição do item é obrigatória");
      return;
    }
    if (novoItem.quantidade <= 0) {
      setError("Quantidade deve ser maior que zero");
      return;
    }
    if (novoItem.valorUnitario <= 0) {
      setError("Valor unitário deve ser maior que zero");
      return;
    }

    const item: ItemOS = {
      id: String(Date.now()),
      ...novoItem,
      valorTotal: novoItem.quantidade * novoItem.valorUnitario,
    };

    setItens([...itens, item]);
    setNovoItem({ descricao: "", quantidade: 1, valorUnitario: 0 });
  };

  const handleRemoveItem = (id: string) => {
    setItens(itens.filter((item) => item.id !== id));
  };

  const calcularTotal = () => {
    const subtotal = itens.reduce((sum, item) => sum + item.valorTotal, 0);
    return subtotal - (formData.desconto || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.clienteId) {
      setError("Selecione um cliente");
      return;
    }
    if (!formData.veiculoId) {
      setError("Selecione um veículo");
      return;
    }
    if (itens.length === 0) {
      setError("Adicione pelo menos um item");
      return;
    }

    try {
      setSaving(true);
      const dadosParaEnviar = {
        ...formData,
        itens: itens.map(({ id, ...item }) => item),
      };

      if (isEdit) {
        await osService.atualizar(id!, dadosParaEnviar);
      } else {
        await osService.criar(dadosParaEnviar);
      }

      navigate("/ordens");
    } catch (err: any) {
      console.error("❌ Erro detalhado:", err.response?.data);
      setError(err.response?.data?.error || "Erro ao salvar OS");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate("/ordens");
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

  const subtotal = itens.reduce((sum, item) => sum + item.valorTotal, 0);
  const total = subtotal - (formData.desconto || 0);

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
          {isView ? "👁️ Visualizar OS" : isEdit ? "✏️ Editar OS" : "➕ Nova OS"}
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
            Dados da OS
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {/* Cliente */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Cliente *</InputLabel>
                <Select
                  name="clienteId"
                  value={formData.clienteId}
                  onChange={handleChange}
                  label="Cliente *"
                  disabled={loadingClientes || isView}
                  required
                >
                  <MenuItem value="">Selecione um cliente</MenuItem>
                  {clientes.map((cliente) => (
                    <MenuItem key={cliente.id} value={cliente.id}>
                      {cliente.nome} - {cliente.telefone}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Veículo */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Veículo *</InputLabel>
                <Select
                  name="veiculoId"
                  value={formData.veiculoId}
                  onChange={handleChange}
                  label="Veículo *"
                  disabled={loadingVeiculos || isView || !formData.clienteId}
                  required
                >
                  <MenuItem value="">Selecione um veículo</MenuItem>
                  {veiculos.map((veiculo) => (
                    <MenuItem key={veiculo.id} value={veiculo.id}>
                      {veiculo.placa} - {veiculo.marca} {veiculo.modelo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Data Previsão */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data Previsão"
                name="dataPrevisao"
                type="date"
                value={formData.dataPrevisao}
                onChange={handleChange}
                disabled={isView}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Desconto */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Desconto (R$)"
                name="desconto"
                type="number"
                value={formData.desconto || 0}
                onChange={handleChange}
                disabled={isView}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
          </Grid>

          {/* Itens */}
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#1a237e", mt: 4 }}
          >
            Itens da OS
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {!isView && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  label="Descrição *"
                  name="descricao"
                  value={novoItem.descricao}
                  onChange={handleItemChange}
                  placeholder="Ex: Recarga de Gás"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Qtd *"
                  name="quantidade"
                  type="number"
                  value={novoItem.quantidade}
                  onChange={handleItemChange}
                  inputProps={{ min: 1 }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Valor Unit. *"
                  name="valorUnitario"
                  type="number"
                  value={novoItem.valorUnitario}
                  onChange={handleItemChange}
                  inputProps={{ min: 0, step: 0.01 }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddItem}
                  sx={{ height: "100%", bgcolor: "#1a237e" }}
                >
                  Adicionar
                </Button>
              </Grid>
            </Grid>
          )}

          {/* Tabela de Itens */}
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ bgcolor: "#1a237e" }}>
                <TableRow>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                    Descrição
                  </TableCell>
                  <TableCell
                    sx={{ color: "#fff", fontWeight: "bold", align: "center" }}
                  >
                    Qtd
                  </TableCell>
                  <TableCell
                    sx={{ color: "#fff", fontWeight: "bold", align: "right" }}
                  >
                    Valor Unit.
                  </TableCell>
                  <TableCell
                    sx={{ color: "#fff", fontWeight: "bold", align: "right" }}
                  >
                    Valor Total
                  </TableCell>
                  {!isView && (
                    <TableCell
                      sx={{
                        color: "#fff",
                        fontWeight: "bold",
                        align: "center",
                      }}
                    >
                      Ação
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {itens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 2 }}>
                      <Typography color="textSecondary">
                        Nenhum item adicionado
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  itens.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.descricao}</TableCell>
                      <TableCell align="center">{item.quantidade}</TableCell>
                      <TableCell align="right">
                        R$ {item.valorUnitario.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={500}>
                          R$ {item.valorTotal.toFixed(2)}
                        </Typography>
                      </TableCell>
                      {!isView && (
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            sx={{ color: "#d32f2f" }}
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  <TableCell colSpan={3} align="right">
                    <Typography variant="subtitle1" fontWeight={600}>
                      Subtotal:
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle1" fontWeight={600}>
                      R$ {subtotal.toFixed(2)}
                    </Typography>
                  </TableCell>
                  {!isView && <TableCell />}
                </TableRow>
                <TableRow sx={{ bgcolor: "#e3f2fd" }}>
                  <TableCell colSpan={3} align="right">
                    <Typography variant="h6" fontWeight={700} color="#1a237e">
                      TOTAL:
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" fontWeight={700} color="#1a237e">
                      R$ {total.toFixed(2)}
                    </Typography>
                  </TableCell>
                  {!isView && <TableCell />}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Observações */}
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Observações"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              multiline
              rows={3}
              placeholder="Informações adicionais sobre a OS"
              disabled={isView}
            />
          </Box>

          {/* Botões */}
          {!isView && (
            <Box
              sx={{
                mt: 4,
                display: "flex",
                gap: 2,
                justifyContent: "flex-end",
              }}
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
          )}
        </form>
      </Paper>
    </Box>
  );
}
