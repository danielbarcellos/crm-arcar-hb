import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ClienteInput {
  nome: string;
  email: string;
  telefone: string;
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
}

export const clienteService = {
  // Buscar todos os clientes
  async listar(): Promise<Cliente[]> {
    const response = await axios.get(`${API_URL}/clientes`);
    return response.data;
  },

  // Buscar cliente por ID
  async buscarPorId(id: string): Promise<Cliente | null> {
    try {
      const response = await axios.get(`${API_URL}/clientes/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Criar novo cliente
  async criar(cliente: ClienteInput): Promise<Cliente> {
    const response = await axios.post(`${API_URL}/clientes`, cliente);
    return response.data;
  },

  // Atualizar cliente
  async atualizar(id: string, dados: Partial<ClienteInput>): Promise<Cliente> {
    const response = await axios.put(`${API_URL}/clientes/${id}`, dados);
    return response.data;
  },

  // Excluir cliente
  async excluir(id: string): Promise<void> {
    await axios.delete(`${API_URL}/clientes/${id}`);
  },

  // Buscar clientes (pesquisa)
  async buscar(termo: string): Promise<Cliente[]> {
    const response = await axios.get(`${API_URL}/clientes/buscar/${termo}`);
    return response.data;
  },
};