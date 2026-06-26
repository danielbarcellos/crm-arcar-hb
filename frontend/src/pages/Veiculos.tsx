import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  Alert,
  TablePagination,
  TableFooter,
  Card,
  CardContent,
  Grid,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  TableChart as TableIcon,
  ViewModule as ViewModuleIcon,
  DirectionsCar as CarIcon,
} from "@mui/icons-material";
import { Veiculo, veiculoService } from "../services/veiculoService";

type Order = "asc" | "desc";
type OrderableColumns = "placa" | "marca" | "modelo" | "ano" | "cor";
type ViewMode = "table" | "cards";

export default function Veiculos() {
  const navigate = useNavigate();

  // Estados principais
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados da paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Estados da busca
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);

  // Estados da ordenação
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<OrderableColumns>("placa");
  const [filteredVeiculos, setFilteredVeiculos] = useState<Veiculo[]>([]);

  // Estados da visualização
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Carregar veículos
  useEffect(() => {
    carregarVeiculos();
  }, []);

  useEffect(() => {
    setFilteredVeiculos(veiculos);
  }, [veiculos]);

  const carregarVeiculos = async () => {
    try {
      setLoading(true);
      const dados = await veiculoService.listar();
      setVeiculos(dados);
      setFilteredVeiculos(dados);
      setError(null);
    } catch (err) {
      setError("Erro ao carregar veículos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // ORDENAÇÃO
  // ============================================

  const handleSort = (property: OrderableColumns) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortData = (
    data: Veiculo[],
    orderBy: OrderableColumns,
    order: Order,
  ) => {
    return [...data].sort((a, b) => {
      let aValue: any = a[orderBy];
      let bValue: any = b[orderBy];

      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return order === "asc" ? -1 : 1;
      if (aValue > bValue) return order === "asc" ? 1 : -1;
      return 0;
    });
  };

  // ============================================
  // BUSCA
  // ============================================

  const handleSearch = async (termo: string) => {
    setSearchTerm(termo);

    if (termo.trim() === "") {
      setFilteredVeiculos(veiculos);
      setPage(0);
      return;
    }

    try {
      setSearching(true);
      const resultados = await veiculoService.buscar(termo);
      setFilteredVeiculos(resultados);
      setPage(0);
    } catch (err) {
      setError("Erro ao buscar veículos");
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredVeiculos(veiculos);
    setPage(0);
  };

  // ============================================
  // EXCLUSÃO
  // ============================================

  const handleDelete = async (id: string, placa: string) => {
    if (
      window.confirm(`Tem certeza que deseja excluir o veículo "${placa}"?`)
    ) {
      try {
        await veiculoService.excluir(id);
        await carregarVeiculos();
        if (searchTerm) {
          handleSearch(searchTerm);
        }
      } catch (err) {
        setError("Erro ao excluir veículo");
      }
    }
  };

  // ============================================
  // PAGINAÇÃO
  // ============================================

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const sortedData = sortData(filteredVeiculos, orderBy, order);
  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  // ============================================
  // RENDER
  // ============================================

  return (
    <Box>
      {/* Cabeçalho */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">
          🚗 Veículos
          <Chip
            label={filteredVeiculos.length}
            size="small"
            sx={{ ml: 2, bgcolor: "#1a237e", color: "#fff" }}
          />
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/veiculos/novo")}
          sx={{
            bgcolor: "#ff6f00",
            "&:hover": { bgcolor: "#e65100" },
          }}
        >
          Novo Veículo
        </Button>
      </Box>

      {/* Barra de ferramentas */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Pesquisar veículo por placa, marca ou modelo..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={clearSearch}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, value) => value && setViewMode(value)}
                size="small"
              >
                <ToggleButton value="table">
                  <Tooltip title="Visualização em Tabela">
                    <TableIcon />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="cards">
                  <Tooltip title="Visualização em Cards">
                    <ViewModuleIcon />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Mensagem de erro */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Conteúdo principal */}
      {loading || searching ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : viewMode === "table" ? (
        // ===== VISUALIZAÇÃO EM TABELA =====
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: "#1a237e" }}>
              <TableRow>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  <TableSortLabel
                    active={orderBy === "placa"}
                    direction={orderBy === "placa" ? order : "asc"}
                    onClick={() => handleSort("placa")}
                    sx={{ color: "#fff !important" }}
                  >
                    Placa
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  <TableSortLabel
                    active={orderBy === "marca"}
                    direction={orderBy === "marca" ? order : "asc"}
                    onClick={() => handleSort("marca")}
                    sx={{ color: "#fff !important" }}
                  >
                    Marca
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  <TableSortLabel
                    active={orderBy === "modelo"}
                    direction={orderBy === "modelo" ? order : "asc"}
                    onClick={() => handleSort("modelo")}
                    sx={{ color: "#fff !important" }}
                  >
                    Modelo
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  <TableSortLabel
                    active={orderBy === "ano"}
                    direction={orderBy === "ano" ? order : "asc"}
                    onClick={() => handleSort("ano")}
                    sx={{ color: "#fff !important" }}
                  >
                    Ano
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  <TableSortLabel
                    active={orderBy === "cor"}
                    direction={orderBy === "cor" ? order : "asc"}
                    onClick={() => handleSort("cor")}
                    sx={{ color: "#fff !important" }}
                  >
                    Cor
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Cliente
                </TableCell>
                <TableCell
                  sx={{
                    color: "#fff",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      {searchTerm
                        ? "Nenhum veículo encontrado para esta busca"
                        : "Nenhum veículo cadastrado"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((veiculo) => (
                  <TableRow key={veiculo.id} hover>
                    <TableCell>
                      <Chip
                        label={veiculo.placa}
                        size="small"
                        sx={{
                          bgcolor: "#e3f2fd",
                          color: "#1a237e",
                          fontWeight: "bold",
                          fontFamily: "monospace",
                        }}
                      />
                    </TableCell>
                    <TableCell>{veiculo.marca}</TableCell>
                    <TableCell>{veiculo.modelo}</TableCell>
                    <TableCell>{veiculo.ano}</TableCell>
                    <TableCell>
                      <Chip
                        label={veiculo.cor}
                        size="small"
                        sx={{
                          bgcolor: "#f5f5f5",
                          color: "#333",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={veiculo.clienteNome || "Não vinculado"}
                        size="small"
                        sx={{
                          bgcolor: veiculo.clienteNome ? "#e8f5e9" : "#f5f5f5",
                          color: veiculo.clienteNome ? "#2e7d32" : "#999",
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        sx={{ color: "#ff6f00" }}
                        onClick={() =>
                          navigate(`/veiculos/editar/${veiculo.id}`)
                        }
                        title="Editar"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{ color: "#d32f2f" }}
                        onClick={() => handleDelete(veiculo.id, veiculo.placa)}
                        title="Excluir"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  count={filteredVeiculos.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Registros por página:"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} de ${count}`
                  }
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      ) : (
        // ===== VISUALIZAÇÃO EM CARDS =====
        <Grid container spacing={2}>
          {paginatedData.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: "center" }}>
                <Typography color="textSecondary">
                  {searchTerm
                    ? "Nenhum veículo encontrado para esta busca"
                    : "Nenhum veículo cadastrado"}
                </Typography>
              </Paper>
            </Grid>
          ) : (
            paginatedData.map((veiculo) => (
              <Grid item xs={12} sm={6} md={4} key={veiculo.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "scale(1.02)", boxShadow: 6 },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="h6" color="primary">
                        {veiculo.placa}
                      </Typography>
                      <CarIcon sx={{ color: "#ff6f00" }} />
                    </Box>
                    <Typography variant="subtitle1" gutterBottom>
                      {veiculo.marca} {veiculo.modelo}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Ano: {veiculo.ano} | Cor: {veiculo.cor}
                    </Typography>
                    <Chip
                      label={veiculo.clienteNome || "Sem cliente"}
                      size="small"
                      sx={{ mt: 1, bgcolor: "#e3f2fd", color: "#1a237e" }}
                    />
                    {veiculo.observacoes && (
                      <Typography
                        variant="body2"
                        sx={{ mt: 1, fontStyle: "italic", color: "#666" }}
                      >
                        {veiculo.observacoes}
                      </Typography>
                    )}
                  </CardContent>
                  <Box
                    sx={{
                      p: 1,
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 1,
                    }}
                  >
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/veiculos/editar/${veiculo.id}`)}
                      sx={{ color: "#ff6f00" }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(veiculo.id, veiculo.placa)}
                      sx={{ color: "#d32f2f" }}
                    >
                      Excluir
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Resumo */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="textSecondary">
          Total: {filteredVeiculos.length} veículo(s)
          {searchTerm && ` (filtrado de ${veiculos.length} total)`}
        </Typography>
      </Box>
    </Box>
  );
}
