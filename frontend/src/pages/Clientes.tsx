import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Menu,
  MenuItem,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  CardActions,
  Grid,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Select,
  FormControl,
  InputLabel,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  FileDownload as FileDownloadIcon,
  TableChart as TableIcon,
  ViewModule as ViewModuleIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { Cliente, clienteService } from '../services/clienteService';
import { exportService } from '../services/exportService';

// Tipos
type Order = 'asc' | 'desc';
type OrderableColumns = 'nome' | 'email' | 'telefone';
type ViewMode = 'table' | 'cards';

export default function Clientes() {
  const navigate = useNavigate();

  // Estados principais
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados da paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Estados da busca
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);

  // Estados da ordenação
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<OrderableColumns>('nome');
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);

  // Estados da visualização
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Estados de seleção
  const [selected, setSelected] = useState<string[]>([]);

  // Estados de filtros
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    cidade: '',
    estado: '',
  });
  const [cidades, setCidades] = useState<string[]>([]);
  const [estados, setEstados] = useState<string[]>([]);

  // Menu de exportação
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const exportOpen = Boolean(exportAnchorEl);

  // Menu de ações em lote
  const [batchAnchorEl, setBatchAnchorEl] = useState<null | HTMLElement>(null);
  const batchOpen = Boolean(batchAnchorEl);

  // ============================================
  // CARREGAR DADOS
  // ============================================

  useEffect(() => {
    carregarClientes();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [clientes, filters]);

  const carregarClientes = async () => {
    try {
      setLoading(true);
      const dados = await clienteService.listar();
      setClientes(dados);

      // Extrair cidades e estados únicos para filtros
      const cidadesUnicas = Array.from(
        new Set(dados.map(c => c.endereco.cidade).filter(Boolean))
      );
      const estadosUnicos = Array.from(
        new Set(dados.map(c => c.endereco.estado).filter(Boolean))
      );
      setCidades(cidadesUnicas.sort());
      setEstados(estadosUnicos.sort());

      setError(null);
    } catch (err) {
      setError('Erro ao carregar clientes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let dados = clientes;

    if (filters.cidade) {
      dados = dados.filter(c => c.endereco.cidade === filters.cidade);
    }

    if (filters.estado) {
      dados = dados.filter(c => c.endereco.estado === filters.estado);
    }

    setFilteredClientes(dados);
    setPage(0);
  };

  // ============================================
  // ORDENAÇÃO
  // ============================================

  const handleSort = (property: OrderableColumns) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortData = (data: Cliente[], orderBy: OrderableColumns, order: Order) => {
    return [...data].sort((a, b) => {
      let aValue: any = a[orderBy];
      let bValue: any = b[orderBy];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // ============================================
  // BUSCA
  // ============================================

  const handleSearch = async (termo: string) => {
    setSearchTerm(termo);

    if (termo.trim() === '') {
      aplicarFiltros();
      return;
    }

    try {
      setSearching(true);
      const resultados = await clienteService.buscar(termo);
      setFilteredClientes(resultados);
      setPage(0);
    } catch (err) {
      setError('Erro ao buscar clientes');
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    aplicarFiltros();
  };

  // ============================================
  // SELEÇÃO
  // ============================================

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = paginatedData.map(n => n.id);
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  // ============================================
  // AÇÕES EM LOTE
  // ============================================

  const handleBatchDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir ${selected.length} cliente(s)?`)) {
      try {
        for (const id of selected) {
          await clienteService.excluir(id);
        }
        setSelected([]);
        await carregarClientes();
        setBatchAnchorEl(null);
      } catch (err) {
        setError('Erro ao excluir clientes em lote');
      }
    }
  };

  const handleBatchExport = () => {
    const selectedClientes = clientes.filter(c => selected.includes(c.id));
    exportService.toExcel(selectedClientes, 'clientes-selecionados');
    setBatchAnchorEl(null);
  };

  // ============================================
  // EXCLUSÃO INDIVIDUAL
  // ============================================

  const handleDelete = async (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente "${nome}"?`)) {
      try {
        await clienteService.excluir(id);
        await carregarClientes();
        if (searchTerm) {
          handleSearch(searchTerm);
        }
      } catch (err) {
        setError('Erro ao excluir cliente');
      }
    }
  };

  // ============================================
  // EXPORTAÇÃO
  // ============================================

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const handleExport = (tipo: 'excel' | 'pdf' | 'csv') => {
    const dadosParaExportar = searchTerm ? filteredClientes : clientes;

    switch (tipo) {
      case 'excel':
        exportService.toExcel(dadosParaExportar);
        break;
      case 'pdf':
        exportService.toPDF(dadosParaExportar);
        break;
      case 'csv':
        exportService.toCSV(dadosParaExportar);
        break;
    }
    handleExportClose();
  };

  // ============================================
  // FILTROS
  // ============================================

  const handleFilterApply = () => {
    aplicarFiltros();
    setFilterDialogOpen(false);
  };

  const handleFilterClear = () => {
    setFilters({ cidade: '', estado: '' });
    setFilterDialogOpen(false);
  };

  // ============================================
  // PAGINAÇÃO
  // ============================================

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const sortedData = sortData(filteredClientes, orderBy, order);
  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  // ============================================
  // RENDER
  // ============================================

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          👤 Clientes
          <Badge badgeContent={filteredClientes.length} color="primary" sx={{ ml: 2 }} />
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/clientes/novo')}
            sx={{
              bgcolor: '#ff6f00',
              '&:hover': { bgcolor: '#e65100' },
            }}
          >
            Novo Cliente
          </Button>
        </Box>
      </Box>

      {/* Barra de ferramentas */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Pesquisar cliente por nome, email ou telefone..."
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
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              {/* Botão de Filtros */}
              <Tooltip title="Filtros avançados">
                <Button
                  variant={filters.cidade || filters.estado ? 'contained' : 'outlined'}
                  startIcon={<FilterIcon />}
                  onClick={() => setFilterDialogOpen(true)}
                  size="small"
                  sx={{
                    bgcolor: (filters.cidade || filters.estado) ? '#1a237e' : undefined,
                    '&:hover': {
                      bgcolor: (filters.cidade || filters.estado) ? '#000051' : undefined,
                    },
                  }}
                >
                  Filtros
                  {(filters.cidade || filters.estado) && (
                    <Chip
                      label="Ativo"
                      size="small"
                      sx={{ ml: 1, bgcolor: '#ff6f00', color: '#fff' }}
                    />
                  )}
                </Button>
              </Tooltip>

              {/* Visualização */}
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

              {/* Exportar */}
              <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                onClick={handleExportClick}
                size="small"
              >
                Exportar
              </Button>
              <Menu anchorEl={exportAnchorEl} open={exportOpen} onClose={handleExportClose}>
                <MenuItem onClick={() => handleExport('excel')}>📊 Excel (.xlsx)</MenuItem>
                <MenuItem onClick={() => handleExport('pdf')}>📄 PDF (.pdf)</MenuItem>
                <MenuItem onClick={() => handleExport('csv')}>📋 CSV (.csv)</MenuItem>
              </Menu>

              {/* Ações em Lote */}
              {selected.length > 0 && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<MoreVertIcon />}
                  onClick={(e) => setBatchAnchorEl(e.currentTarget)}
                  size="small"
                >
                  {selected.length} selecionado(s)
                </Button>
              )}
              <Menu anchorEl={batchAnchorEl} open={batchOpen} onClose={() => setBatchAnchorEl(null)}>
                <MenuItem onClick={handleBatchExport}>📥 Exportar selecionados</MenuItem>
                <MenuItem onClick={handleBatchDelete} sx={{ color: '#d32f2f' }}>
                  🗑️ Excluir selecionados
                </MenuItem>
              </Menu>
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
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : viewMode === 'table' ? (
        // ===== VISUALIZAÇÃO EM TABELA =====
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#1a237e' }}>
              <TableRow>
                <TableCell padding="checkbox" sx={{ color: '#fff' }}>
                  <Checkbox
                    color="default"
                    indeterminate={selected.length > 0 && selected.length < paginatedData.length}
                    checked={paginatedData.length > 0 && selected.length === paginatedData.length}
                    onChange={handleSelectAll}
                    sx={{ color: '#fff' }}
                  />
                </TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                  <TableSortLabel
                    active={orderBy === 'nome'}
                    direction={orderBy === 'nome' ? order : 'asc'}
                    onClick={() => handleSort('nome')}
                    sx={{ color: '#fff !important' }}
                  >
                    Nome
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                  <TableSortLabel
                    active={orderBy === 'email'}
                    direction={orderBy === 'email' ? order : 'asc'}
                    onClick={() => handleSort('email')}
                    sx={{ color: '#fff !important' }}
                  >
                    Email
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                  <TableSortLabel
                    active={orderBy === 'telefone'}
                    direction={orderBy === 'telefone' ? order : 'asc'}
                    onClick={() => handleSort('telefone')}
                    sx={{ color: '#fff !important' }}
                  >
                    Telefone
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Cidade</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      {searchTerm
                        ? 'Nenhum cliente encontrado para esta busca'
                        : 'Nenhum cliente cadastrado'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((cliente) => {
                  const isItemSelected = isSelected(cliente.id);
                  return (
                    <TableRow key={cliente.id} hover selected={isItemSelected}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          onChange={() => handleSelectOne(cliente.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={500}>{cliente.nome}</Typography>
                      </TableCell>
                      <TableCell>{cliente.email}</TableCell>
                      <TableCell>{cliente.telefone}</TableCell>
                      <TableCell>
                        <Chip
                          label={cliente.endereco.cidade || 'Não informado'}
                          size="small"
                          sx={{
                            bgcolor: cliente.endereco.cidade ? '#e3f2fd' : '#f5f5f5',
                            color: cliente.endereco.cidade ? '#1a237e' : '#999',
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          sx={{ color: '#ff6f00' }}
                          onClick={() => navigate(`/clientes/editar/${cliente.id}`)}
                          title="Editar"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{ color: '#d32f2f' }}
                          onClick={() => handleDelete(cliente.id, cliente.nome)}
                          title="Excluir"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  count={filteredClientes.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Registros por página:"
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
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
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="textSecondary">
                  {searchTerm
                    ? 'Nenhum cliente encontrado para esta busca'
                    : 'Nenhum cliente cadastrado'}
                </Typography>
              </Paper>
            </Grid>
          ) : (
            paginatedData.map((cliente) => (
              <Grid item xs={12} sm={6} md={4} key={cliente.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.02)', boxShadow: 6 },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {cliente.nome}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {cliente.email}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {cliente.telefone}
                    </Typography>
                    {cliente.endereco.cidade && (
                      <Chip
                        label={`📍 ${cliente.endereco.cidade}${cliente.endereco.estado ? ` - ${cliente.endereco.estado}` : ''}`}
                        size="small"
                        sx={{ mt: 1, bgcolor: '#e3f2fd', color: '#1a237e' }}
                      />
                    )}
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/clientes/editar/${cliente.id}`)}
                      sx={{ color: '#ff6f00' }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(cliente.id, cliente.nome)}
                      sx={{ color: '#d32f2f' }}
                    >
                      Excluir
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Resumo */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          Total: {filteredClientes.length} cliente(s)
          {searchTerm && ` (filtrado de ${clientes.length} total)`}
          {selected.length > 0 && ` | ${selected.length} selecionado(s)`}
        </Typography>
        {searchTerm && (
          <Button size="small" onClick={clearSearch}>
            Limpar filtro
          </Button>
        )}
      </Box>

      {/* Dialog de Filtros Avançados */}
      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Filtros Avançados</Typography>
            <IconButton onClick={() => setFilterDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Cidade</InputLabel>
              <Select
                value={filters.cidade}
                onChange={(e) => setFilters({ ...filters, cidade: e.target.value })}
                label="Cidade"
              >
                <MenuItem value="">Todas</MenuItem>
                {cidades.map((cidade) => (
                  <MenuItem key={cidade} value={cidade}>
                    {cidade}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filters.estado}
                onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                label="Estado"
              >
                <MenuItem value="">Todos</MenuItem>
                {estados.map((estado) => (
                  <MenuItem key={estado} value={estado}>
                    {estado}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFilterClear}>Limpar Filtros</Button>
          <Button onClick={handleFilterApply} variant="contained" sx={{ bgcolor: '#1a237e' }}>
            Aplicar Filtros
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}