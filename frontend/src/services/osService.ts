import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

// ============================================
// TIPOS (exportados para uso em outros arquivos)
// ============================================

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
  veiculoInfo: string;
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

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function converterItensParaCompletos(
  itens: Omit<ItemOS, "id" | "valorTotal">[],
): ItemOS[] {
  return itens.map((item, index) => ({
    id: String(index + 1),
    descricao: item.descricao,
    quantidade: item.quantidade,
    valorUnitario: item.valorUnitario,
    valorTotal: item.quantidade * item.valorUnitario,
  }));
}

function calcularTotais(itens: ItemOS[], desconto: number) {
  const subtotal = itens.reduce((sum, item) => sum + item.valorTotal, 0);
  return {
    subtotal,
    total: subtotal - desconto,
  };
}

// ============================================
// DADOS MOCKADOS
// ============================================

let ordensMock: OrdemServico[] = [
  {
    id: "1",
    numero: "OS-001",
    clienteId: "1",
    clienteNome: "João Silva",
    veiculoId: "1",
    veiculoInfo: "ABC-1234 - Honda Civic",
    dataAbertura: new Date(2026, 5, 20).toISOString(),
    dataPrevisao: new Date(2026, 5, 25).toISOString(),
    dataConclusao: undefined,
    status: "Aberta",
    itens: [
      {
        id: "1",
        descricao: "Recarga de Gás Refrigerante",
        quantidade: 1,
        valorUnitario: 150,
        valorTotal: 150,
      },
      {
        id: "2",
        descricao: "Troca de Filtro Secador",
        quantidade: 1,
        valorUnitario: 85,
        valorTotal: 85,
      },
    ],
    subtotal: 235,
    desconto: 0,
    total: 235,
    observacoes: "Cliente relatou ar condicionado com baixa performance",
    createdAt: new Date(2026, 5, 20).toISOString(),
    updatedAt: new Date(2026, 5, 20).toISOString(),
  },
  {
    id: "2",
    numero: "OS-002",
    clienteId: "2",
    clienteNome: "Maria Santos",
    veiculoId: "2",
    veiculoInfo: "XYZ-5678 - Toyota Corolla",
    dataAbertura: new Date(2026, 5, 18).toISOString(),
    dataPrevisao: new Date(2026, 5, 22).toISOString(),
    dataConclusao: new Date(2026, 5, 21).toISOString(),
    status: "Finalizada",
    itens: [
      {
        id: "3",
        descricao: "Troca de Compressor",
        quantidade: 1,
        valorUnitario: 450,
        valorTotal: 450,
      },
      {
        id: "4",
        descricao: "Óleo PAG 46",
        quantidade: 1,
        valorUnitario: 35,
        valorTotal: 35,
      },
    ],
    subtotal: 485,
    desconto: 20,
    total: 465,
    observacoes: "Compressor queimado",
    createdAt: new Date(2026, 5, 18).toISOString(),
    updatedAt: new Date(2026, 5, 21).toISOString(),
  },
];

let contadorOS = 3;

// ============================================
// SERVIÇO
// ============================================

export const osService = {
  // Gerar número da OS
  gerarNumero(): string {
    const ano = new Date().getFullYear();
    const numero = String(contadorOS).padStart(4, "0");
    return `OS-${ano}-${numero}`;
  },

  // Buscar todas as OS
  async listar(): Promise<OrdemServico[]> {
    return ordensMock;
  },

  // Buscar OS por ID
  async buscarPorId(id: string): Promise<OrdemServico | null> {
    return ordensMock.find((os) => os.id === id) || null;
  },

  // Buscar OS por cliente
  async listarPorCliente(clienteId: string): Promise<OrdemServico[]> {
    return ordensMock.filter((os) => os.clienteId === clienteId);
  },

  // Buscar OS por veículo
  async listarPorVeiculo(veiculoId: string): Promise<OrdemServico[]> {
    return ordensMock.filter((os) => os.veiculoId === veiculoId);
  },

  // Criar nova OS
  async criar(os: OrdemServicoInput): Promise<OrdemServico> {
    const cliente = { nome: "Cliente Teste" };
    const veiculo = { placa: "XXX-0000", modelo: "Modelo Teste" };

    // Converter itens
    const itensCompletos = converterItensParaCompletos(os.itens);
    const { subtotal, total } = calcularTotais(
      itensCompletos,
      os.desconto || 0,
    );

    const nova: OrdemServico = {
      id: String(Date.now()),
      numero: this.gerarNumero(),
      clienteId: os.clienteId,
      clienteNome: cliente?.nome || "Cliente Teste",
      veiculoId: os.veiculoId,
      veiculoInfo: `${veiculo?.placa || "XXX-0000"} - ${
        veiculo?.modelo || "Modelo Teste"
      }`,
      dataAbertura: new Date().toISOString(),
      dataPrevisao: os.dataPrevisao,
      dataConclusao: undefined,
      status: "Aberta",
      itens: itensCompletos,
      subtotal,
      desconto: os.desconto || 0,
      total,
      observacoes: os.observacoes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    ordensMock.push(nova);
    contadorOS++;
    return nova;
  },

  // Atualizar OS
  async atualizar(
    id: string,
    dados: Partial<OrdemServicoInput>,
  ): Promise<OrdemServico> {
    const index = ordensMock.findIndex((os) => os.id === id);
    if (index === -1) throw new Error("Ordem de serviço não encontrada");

    const osAtual = ordensMock[index];

    // Começar com os dados atuais
    let osAtualizada: OrdemServico = { ...osAtual };

    // Atualizar campos simples
    if (dados.clienteId !== undefined) osAtualizada.clienteId = dados.clienteId;
    if (dados.veiculoId !== undefined) osAtualizada.veiculoId = dados.veiculoId;
    if (dados.dataPrevisao !== undefined)
      osAtualizada.dataPrevisao = dados.dataPrevisao;
    if (dados.desconto !== undefined) osAtualizada.desconto = dados.desconto;
    if (dados.observacoes !== undefined)
      osAtualizada.observacoes = dados.observacoes;

    // Atualizar itens se fornecidos
    if (dados.itens) {
      const itensCompletos = converterItensParaCompletos(dados.itens);
      const { subtotal, total } = calcularTotais(
        itensCompletos,
        osAtualizada.desconto,
      );
      osAtualizada.itens = itensCompletos;
      osAtualizada.subtotal = subtotal;
      osAtualizada.total = total;
    }

    osAtualizada.updatedAt = new Date().toISOString();

    ordensMock[index] = osAtualizada;
    return osAtualizada;
  },

  // Atualizar status da OS
  async atualizarStatus(id: string, status: StatusOS): Promise<OrdemServico> {
    const index = ordensMock.findIndex((os) => os.id === id);
    if (index === -1) throw new Error("Ordem de serviço não encontrada");

    const osAtualizada = {
      ...ordensMock[index],
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === "Finalizada") {
      osAtualizada.dataConclusao = new Date().toISOString();
    }

    ordensMock[index] = osAtualizada;
    return osAtualizada;
  },

  // Excluir OS
  async excluir(id: string): Promise<void> {
    ordensMock = ordensMock.filter((os) => os.id !== id);
  },

  // Buscar OS (pesquisa)
  async buscar(termo: string): Promise<OrdemServico[]> {
    return ordensMock.filter(
      (os) =>
        os.numero.toLowerCase().includes(termo.toLowerCase()) ||
        os.clienteNome.toLowerCase().includes(termo.toLowerCase()) ||
        os.veiculoInfo.toLowerCase().includes(termo.toLowerCase()),
    );
  },
};
