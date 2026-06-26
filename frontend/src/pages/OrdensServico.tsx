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
  Grid,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon, // <-- CORRETO
} from "@mui/icons-material";
import { OrdemServico, StatusOS, osService } from "../services/osService";

type Order = "asc" | "desc";
type OrderableColumns =
  | "numero"
  | "clienteNome"
  | "status"
  | "total"
  | "dataAbertura";

const statusColors: Record<StatusOS, { bg: string; color: string }> = {
  Aberta: { bg: "#fff3e0", color: "#e65100" },
  "Em Andamento": { bg: "#e3f2fd", color: "#0d47a1" },
  Finalizada: { bg: "#e8f5e9", color: "#1b5e20" },
  Cancelada: { bg: "#fce4ec", color: "#b71c1c" },
};

const statusLabels: Record<StatusOS, string> = {
  Aberta: "Aberta",
  "Em Andamento": "Em Andamento",
  Finalizada: "Finalizada",
  Cancelada: "Cancelada",
};

export default function OrdensServico() {
  const navigate = useNavigate();

  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<OrderableColumns>("dataAbertura");
  const [filteredOrdens, setFilteredOrdens] = useState<OrdemServico[]>([]);

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedOS, setSelectedOS] = useState<OrdemServico | null>(null);
  const [newStatus, setNewStatus] = useState<StatusOS>("Aberta");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    carregarOrdens();
  }, []);

  useEffect(() => {
    setFilteredOrdens(ordens);
  }, [ordens]);

  const carregarOrdens = async () => {
    try {
      setLoading(true);
      const dados = await osService.listar();
      setOrdens(dados);
      setFilteredOrdens(dados);
      setError(null);
    } catch (err) {
      setError("Erro ao carregar ordens de serviço");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (property: OrderableColumns) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortData = (
    data: OrdemServico[],
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

  const handleSearch = async (termo: string) => {
    setSearchTerm(termo);

    if (termo.trim() === "") {
      setFilteredOrdens(ordens);
      setPage(0);
      return;
    }

    try {
      setSearching(true);
      const resultados = await osService.buscar(termo);
      setFilteredOrdens(resultados);
      setPage(0);
    } catch (err) {
      setError("Erro ao buscar ordens");
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredOrdens(ordens);
    setPage(0);
  };

  const handleOpenStatusDialog = (os: OrdemServico) => {
    setSelectedOS(os);
    setNewStatus(os.status);
    setStatusDialogOpen(true);
  };

  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false);
    setSelectedOS(null);
  };

  const handleChangeStatus = async () => {
    if (!selectedOS) return;

    try {
      setUpdatingStatus(true);
      await osService.atualizarStatus(selectedOS.id, newStatus);
      await carregarOrdens();
      if (searchTerm) {
        handleSearch(searchTerm);
      }
      handleCloseStatusDialog();
    } catch (err) {
      setError("Erro ao atualizar status");
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async (id: string, numero: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a OS "${numero}"?`)) {
      try {
        await osService.excluir(id);
        await carregarOrdens();
        if (searchTerm) {
          handleSearch(searchTerm);
        }
      } catch (err) {
        setError("Erro ao excluir ordem de serviço");
      }
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const sortedData = sortData(filteredOrdens, orderBy, order);
  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">
          🔧 Ordens de Serviço
          <Chip
            label={filteredOrdens.length}
            size="small"
            sx={{ ml: 2, bgcolor: "#1a237e", color: "#fff" }}
          />
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/ordens/novo")}
          sx={{
            bgcolor: "#ff6f00",
            "&:hover": { bgcolor: "#e65100" },
          }}
        >
          Nova OS
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              placeholder="Pesquisar OS por número, cliente ou veículo..."
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
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading || searching ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: "#1a237e" }}>
              <TableRow>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  <TableSortLabel
                    active={orderBy === "numero"}
                    direction={orderBy === "numero" ? order : "asc"}
                    onClick={() => handleSort("numero")}
                    sx={{ color: "#fff !important" }}
                  >
                    Nº OS
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  <TableSortLabel
                    active={orderBy === "clienteNome"}
                    direction={orderBy === "clienteNome" ? order : "asc"}
                    onClick={() => handleSort("clienteNome")}
                    sx={{ color: "#fff !important" }}
                  >
                    Cliente
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Veículo
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  <TableSortLabel
                    active={orderBy === "dataAbertura"}
                    direction={orderBy === "dataAbertura" ? order : "asc"}
                    onClick={() => handleSort("dataAbertura")}
                    sx={{ color: "#fff !important" }}
                  >
                    Abertura
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  Status
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  <TableSortLabel
                    active={orderBy === "total"}
                    direction={orderBy === "total" ? order : "asc"}
                    onClick={() => handleSort("total")}
                    sx={{ color: "#fff !important" }}
                  >
                    Valor
                  </TableSortLabel>
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
                        ? "Nenhuma OS encontrada para esta busca"
                        : "Nenhuma ordem de serviço cadastrada"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((os) => (
                  <TableRow key={os.id} hover>
                    <TableCell>
                      <Typography fontWeight={500} color="primary">
                        {os.numero}
                      </Typography>
                    </TableCell>
                    <TableCell>{os.clienteNome}</TableCell>
                    <TableCell>
                      <Chip
                        label={os.veiculoInfo}
                        size="small"
                        sx={{ bgcolor: "#e3f2fd", color: "#1a237e" }}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(os.dataAbertura).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => handleOpenStatusDialog(os)}
                        disabled={
                          os.status === "Finalizada" ||
                          os.status === "Cancelada"
                        }
                        sx={{
                          p: 0,
                          minWidth: "auto",
                          "&:hover": { bgcolor: "transparent" },
                        }}
                      >
                        <Chip
                          label={statusLabels[os.status]}
                          size="small"
                          sx={{
                            bgcolor: statusColors[os.status].bg,
                            color: statusColors[os.status].color,
                            fontWeight: "bold",
                            minWidth: 80,
                            cursor:
                              os.status === "Finalizada" ||
                              os.status === "Cancelada"
                                ? "default"
                                : "pointer",
                            "&:hover": {
                              opacity:
                                os.status === "Finalizada" ||
                                os.status === "Cancelada"
                                  ? 1
                                  : 0.8,
                            },
                          }}
                        />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>
                        R$ {os.total.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Visualizar">
                        <IconButton
                          size="small"
                          sx={{ color: "#1a237e" }}
                          onClick={() =>
                            navigate(`/ordens/visualizar/${os.id}`)
                          }
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          sx={{ color: "#ff6f00" }}
                          onClick={() => navigate(`/ordens/editar/${os.id}`)}
                          disabled={
                            os.status === "Finalizada" ||
                            os.status === "Cancelada"
                          }
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small"
                          sx={{ color: "#d32f2f" }}
                          onClick={() => handleDelete(os.id, os.numero)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  count={filteredOrdens.length}
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
      )}

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="textSecondary">
          Total: {filteredOrdens.length} OS(s)
          {searchTerm && ` (filtrado de ${ordens.length} total)`}
        </Typography>
      </Box>

      <Dialog
        open={statusDialogOpen}
        onClose={handleCloseStatusDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Alterar Status da OS</Typography>
            <IconButton onClick={handleCloseStatusDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedOS && (
            <Box sx={{ pt: 2 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>OS:</strong> {selectedOS.numero} -{" "}
                  {selectedOS.clienteNome}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Status atual:</strong>{" "}
                  <Chip
                    label={statusLabels[selectedOS.status]}
                    size="small"
                    sx={{
                      bgcolor: statusColors[selectedOS.status].bg,
                      color: statusColors[selectedOS.status].color,
                      fontWeight: "bold",
                    }}
                  />
                </Typography>
              </Alert>

              <FormControl fullWidth>
                <InputLabel>Novo Status</InputLabel>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as StatusOS)}
                  label="Novo Status"
                >
                  <MenuItem value="Aberta">🟠 Aberta</MenuItem>
                  <MenuItem value="Em Andamento">🔵 Em Andamento</MenuItem>
                  <MenuItem value="Finalizada">🟢 Finalizada</MenuItem>
                  <MenuItem value="Cancelada">🔴 Cancelada</MenuItem>
                </Select>
              </FormControl>

              {newStatus === "Finalizada" && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Ao finalizar a OS, ela não poderá mais ser editada.
                </Alert>
              )}

              {newStatus === "Cancelada" && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Ao cancelar a OS, ela não poderá mais ser editada.
                </Alert>
              )}

              {newStatus === selectedOS.status && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  O status selecionado é o mesmo atual.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog} disabled={updatingStatus}>
            Cancelar
          </Button>
          <Button
            onClick={handleChangeStatus}
            variant="contained"
            disabled={updatingStatus || newStatus === selectedOS?.status}
            sx={{
              bgcolor: "#ff6f00",
              "&:hover": { bgcolor: "#e65100" },
            }}
          >
            {updatingStatus ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                Atualizando...
              </>
            ) : (
              "Atualizar Status"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
