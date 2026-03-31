export interface DashboardKPIs {
  totalVendasMes: number;
  totalPedidosMes: number;
  ticketMedio: number;
  metaMes: number;
  realizadoMes: number;
  percentualMeta: number;
}

export interface VendasDiarias {
  data: string; // ISO date string
  valor: number;
}

export interface TopProduto {
  codigo: string;
  descricao: string;
  quantidade: number;
  valor: number;
}

export interface UltimoPedido {
  numero: string;
  cliente: string;
  data: string; // ISO date string
  valorTotal: number;
  status: 'aberto' | 'aprovado' | 'faturado' | 'cancelado';
}

export interface DashboardData {
  kpis: DashboardKPIs;
  evolucaoVendas: VendasDiarias[]; // últimos 30 dias
  topProdutos: TopProduto[];       // top 5
  ultimosPedidos: UltimoPedido[];  // últimos 5
}
