import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import BuildIcon from "@mui/icons-material/Build";
import InventoryIcon from "@mui/icons-material/Inventory";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AssessmentIcon from "@mui/icons-material/Assessment";

const drawerWidth = 220; // Largura reduzida

const menuItems = [
  { texto: "Dashboard", icone: <DashboardIcon />, rota: "/" },
  { texto: "Clientes", icone: <PeopleIcon />, rota: "/clientes" },
  { texto: "Veículos", icone: <DirectionsCarIcon />, rota: "/veiculos" },
  { texto: "Ordens de Serviço", icone: <BuildIcon />, rota: "/ordens" },
  { texto: "Estoque", icone: <InventoryIcon />, rota: "/estoque" },
  {
    texto: "Agendamentos",
    icone: <CalendarTodayIcon />,
    rota: "/agendamentos",
  },
  { texto: "Relatórios", icone: <AssessmentIcon />, rota: "/relatorios" },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: "#1a237e" }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ fontSize: "1.1rem" }}>
            🚗 ARCAR HB
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "#1a237e",
            color: "#ffffff",
            overflowX: "hidden",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto", mt: 1, px: 0.5 }}>
          <List sx={{ width: "100%", p: 0 }}>
            {menuItems.map((item) => {
              const isSelected = location.pathname === item.rota;
              return (
                <ListItem
                  button
                  key={item.texto}
                  onClick={() => navigate(item.rota)}
                  sx={{
                    borderRadius: 1.5,
                    mb: 0.3,
                    py: 0.8,
                    px: 1.2,
                    bgcolor: isSelected
                      ? "rgba(255, 255, 255, 0.15)"
                      : "transparent",
                    "&:hover": {
                      bgcolor: "rgba(255, 255, 255, 0.08)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isSelected ? "#ff6f00" : "#ffffff",
                      minWidth: 32,
                      fontSize: "1.2rem",
                    }}
                  >
                    {item.icone}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.texto}
                    primaryTypographyProps={{
                      fontSize: "0.82rem",
                      noWrap: true,
                    }}
                    sx={{
                      "& .MuiTypography-root": {
                        fontWeight: isSelected ? 600 : 400,
                      },
                    }}
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
