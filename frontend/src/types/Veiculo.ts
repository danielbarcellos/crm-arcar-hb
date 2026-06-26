export interface Veiculo {
  id: string;
  clienteId: string;
  clienteNome?: string; // Para exibição na lista
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
