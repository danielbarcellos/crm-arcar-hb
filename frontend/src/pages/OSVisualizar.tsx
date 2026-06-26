import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { osService, OrdemServico, StatusOS } from "../services/osService";

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

export default function OSSVisualizar() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [os, setOs] = useState<OrdemServico | null>(null);

  useEffect(() => {
    carregarOS();
  }, [id]);

  const carregarOS = async () => {
    try {
      setLoading(true);
      const dados = await osService.buscarPorId(id!);
      if (dados) {
        setOs(dados);
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

  const handleBack = () => {
    navigate("/ordens");
  };

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

  if (!os) {
    return (
      <Box>
        <Alert severity="error">OS não encontrada</Alert>
        <Button onClick={handleBack} sx={{ mt: 2 }}>
          Voltar
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
        <Typography variant="h4">👁️ Visualizar OS - {os.numero}</Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h6" gutterBottom>
              {os.clienteNome}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {os.veiculoInfo}
            </Typography>
          </Box>
          <Chip
            label={statusLabels[os.status]}
            sx={{
              bgcolor: statusColors[os.status].bg,
              color: statusColors[os.status].color,
              fontWeight: "bold",
              fontSize: "1rem",
              py: 2,
            }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" color="textSecondary">
              Data Abertura
            </Typography>
            <Typography>
              {new Date(os.dataAbertura).toLocaleDateString("pt-BR")}
            </Typography>
          </Grid>
          {os.dataPrevisao && (
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="textSecondary">
                Data Previsão
              </Typography>
              <Typography>
                {new Date(os.dataPrevisao).toLocaleDateString("pt-BR")}
              </Typography>
            </Grid>
          )}
          {os.dataConclusao && (
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="textSecondary">
                Data Conclusão
              </Typography>
              <Typography>
                {new Date(os.dataConclusao).toLocaleDateString("pt-BR")}
              </Typography>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom sx={{ color: "#1a237e" }}>
          Itens da OS
        </Typography>
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
              </TableRow>
            </TableHead>
            <TableBody>
              {os.itens.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.descricao}</TableCell>
                  <TableCell align="center">{item.quantidade}</TableCell>
                  <TableCell align="right">
                    R$ {item.valorUnitario.toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    R$ {item.valorTotal.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell colSpan={3} align="right">
                  <Typography variant="subtitle1" fontWeight={600}>
                    Subtotal:
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1" fontWeight={600}>
                    R$ {os.subtotal.toFixed(2)}
                  </Typography>
                </TableCell>
              </TableRow>
              {os.desconto > 0 && (
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  <TableCell colSpan={3} align="right">
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      color="#d32f2f"
                    >
                      Desconto:
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      color="#d32f2f"
                    >
                      - R$ {os.desconto.toFixed(2)}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              <TableRow sx={{ bgcolor: "#e3f2fd" }}>
                <TableCell colSpan={3} align="right">
                  <Typography variant="h6" fontWeight={700} color="#1a237e">
                    TOTAL:
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="h6" fontWeight={700} color="#1a237e">
                    R$ {os.total.toFixed(2)}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {os.observacoes && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="caption" color="textSecondary">
              Observações
            </Typography>
            <Typography variant="body2">{os.observacoes}</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
