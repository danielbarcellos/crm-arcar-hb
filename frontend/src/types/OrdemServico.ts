export type StatusOS = "Aberta" | "Em Andamento" | "Finalizada" | "Cancelada";

export interface ItemOS {
  id: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface OrdemServico {
  id: string;
  numero: string;
  clienteId: string;
  clienteNome: string;
  veiculoId: string;
  veiculoInfo: string; // placa + modelo
  dataAbertura: string;
  dataPrevisao?: string;
  dataConclusao?: string;
  status: StatusOS;
  itens: ItemOS[];
  subtotal: number;
  desconto: number;
  total: number;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrdemServicoInput {
  clienteId: string;
  veiculoId: string;
  dataPrevisao?: string;
  itens: Omit<ItemOS, "id" | "valorTotal">[];
  desconto: number;
  observacoes?: string;
}
