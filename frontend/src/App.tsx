import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import ClienteForm from "./pages/ClienteForm";
import Veiculos from "./pages/Veiculos";
import VeiculoForm from "./pages/VeiculoForm";
import OrdensServico from "./pages/OrdensServico";
import OSForm from "./pages/OSForm";
import OSSVisualizar from "./pages/OSVisualizar";
import Estoque from "./pages/Estoque";
import Agendamentos from "./pages/Agendamentos";
import Relatorios from "./pages/Relatorios";
import OSVisualizar from "./pages/OSVisualizar";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/clientes/novo" element={<ClienteForm />} />
            <Route path="/clientes/editar/:id" element={<ClienteForm />} />
            <Route path="/veiculos" element={<Veiculos />} />
            <Route path="/veiculos/novo" element={<VeiculoForm />} />
            <Route path="/veiculos/editar/:id" element={<VeiculoForm />} />
            <Route path="/ordens" element={<OrdensServico />} />
            <Route path="/ordens/novo" element={<OSForm />} />
            <Route path="/ordens/editar/:id" element={<OSForm />} />
            <Route path="/ordens/visualizar/:id" element={<OSVisualizar />} />
            <Route path="/estoque" element={<Estoque />} />
            <Route path="/agendamentos" element={<Agendamentos />} />
            <Route path="/relatorios" element={<Relatorios />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
