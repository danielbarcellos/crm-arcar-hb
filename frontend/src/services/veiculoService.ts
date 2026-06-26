import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

// ============================================
// TIPOS (exportados para uso em outros arquivos)
// ============================================

export interface Veiculo {
  id: string;
  clienteId: string;
  clienteNome?: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VeiculoInput {
  clienteId: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  observacoes?: string;
}

// ============================================
// DADOS MOCKADOS
// ============================================

let veiculosMock: Veiculo[] = [
  {
    id: "1",
    clienteId: "1",
    clienteNome: "João Silva",
    placa: "ABC-1234",
    marca: "Honda",
    modelo: "Civic",
    ano: 2020,
    cor: "Prata",
    observacoes: "Ar condicionado com problema",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    clienteId: "2",
    clienteNome: "Maria Santos",
    placa: "XYZ-5678",
    marca: "Toyota",
    modelo: "Corolla",
    ano: 2022,
    cor: "Branco",
    observacoes: "Manutenção em dia",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ============================================
// SERVIÇO
// ============================================

export const veiculoService = {
  // Buscar todos os veículos
  async listar(): Promise<Veiculo[]> {
    // TODO: Substituir por chamada real
    // const response = await axios.get(`${API_URL}/veiculos`);
    // return response.data;
    return veiculosMock;
  },

  // Buscar veículos por cliente
  async listarPorCliente(clienteId: string): Promise<Veiculo[]> {
    // TODO: Substituir por chamada real
    // const response = await axios.get(`${API_URL}/veiculos/cliente/${clienteId}`);
    // return response.data;
    return veiculosMock.filter((v) => v.clienteId === clienteId);
  },

  // Buscar veículo por ID
  async buscarPorId(id: string): Promise<Veiculo | null> {
    // TODO: Substituir por chamada real
    // const response = await axios.get(`${API_URL}/veiculos/${id}`);
    // return response.data;
    return veiculosMock.find((v) => v.id === id) || null;
  },

  // Criar novo veículo
  async criar(veiculo: VeiculoInput): Promise<Veiculo> {
    // TODO: Substituir por chamada real
    // const response = await axios.post(`${API_URL}/veiculos`, veiculo);
    // return response.data;
    const novo = {
      ...veiculo,
      id: String(Date.now()),
      clienteNome: "Cliente Teste",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    veiculosMock.push(novo);
    return novo;
  },

  // Atualizar veículo
  async atualizar(id: string, dados: Partial<VeiculoInput>): Promise<Veiculo> {
    // TODO: Substituir por chamada real
    // const response = await axios.put(`${API_URL}/veiculos/${id}`, dados);
    // return response.data;
    const index = veiculosMock.findIndex((v) => v.id === id);
    if (index === -1) throw new Error("Veículo não encontrado");
    veiculosMock[index] = {
      ...veiculosMock[index],
      ...dados,
      updatedAt: new Date().toISOString(),
    };
    return veiculosMock[index];
  },

  // Excluir veículo
  async excluir(id: string): Promise<void> {
    // TODO: Substituir por chamada real
    // await axios.delete(`${API_URL}/veiculos/${id}`);
    veiculosMock = veiculosMock.filter((v) => v.id !== id);
  },

  // Buscar veículos (pesquisa)
  async buscar(termo: string): Promise<Veiculo[]> {
    // TODO: Substituir por chamada real
    // const response = await axios.get(`${API_URL}/veiculos/buscar/${termo}`);
    // return response.data;
    return veiculosMock.filter(
      (v) =>
        v.placa.toLowerCase().includes(termo.toLowerCase()) ||
        v.modelo.toLowerCase().includes(termo.toLowerCase()) ||
        v.marca.toLowerCase().includes(termo.toLowerCase()),
    );
  },
};
