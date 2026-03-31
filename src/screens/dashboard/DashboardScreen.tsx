import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCallback } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Badge, Card, Text } from 'react-native-paper';
import { CartesianChart, Bar, Line, useChartPressState } from 'victory-native';
import { Circle } from '@shopify/react-native-skia';

import { isAxiosError } from 'axios';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuthStore } from '../../store/authStore';
import { theme } from '../../theme';
import type { UltimoPedido } from '../../types/dashboard';

const STATUS_COLORS: Record<UltimoPedido['status'], string> = {
  aberto: '#FF9800',
  aprovado: '#2196F3',
  faturado: '#4CAF50',
  cancelado: '#F44336',
};

const STATUS_LABELS: Record<UltimoPedido['status'], string> = {
  aberto: 'Aberto',
  aprovado: 'Aprovado',
  faturado: 'Faturado',
  cancelado: 'Cancelado',
};

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <Card style={styles.kpiCard} mode="elevated">
      <Card.Content style={styles.kpiContent}>
        <Text variant="labelMedium" style={styles.kpiLabel}>
          {label}
        </Text>
        <Text variant="titleLarge" style={styles.kpiValue}>
          {value}
        </Text>
      </Card.Content>
    </Card>
  );
}

function MetaCard({ meta, realizado, percentual }: { meta: number; realizado: number; percentual: number }) {
  const cor = percentual >= 100 ? '#4CAF50' : percentual >= 70 ? '#FF9800' : '#F44336';
  return (
    <Card style={styles.metaCard} mode="elevated">
      <Card.Content>
        <Text variant="labelMedium" style={styles.kpiLabel}>
          Meta vs Realizado
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text variant="bodySmall" style={styles.kpiLabel}>
              Meta
            </Text>
            <Text variant="titleMedium">{formatCurrency(meta)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text variant="bodySmall" style={styles.kpiLabel}>
              Realizado
            </Text>
            <Text variant="titleMedium">{formatCurrency(realizado)}</Text>
          </View>
          <View style={[styles.percentualBadge, { backgroundColor: cor }]}>
            <Text variant="titleMedium" style={{ color: '#fff', fontWeight: 'bold' }}>
              {percentual.toFixed(0)}%
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError, error, refetch, isFetching, fetchStatus } = useDashboard();
  const { state: _pressState } = useChartPressState({ x: 0, y: { valor: 0 } });

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando dashboard...</Text>
      </View>
    );
  }

  // Query desabilitada: user.code está vazio (JWT sem claim sub/userId)
  if (fetchStatus === 'idle' && !data) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.errorText}>
          Código do vendedor não identificado.
        </Text>
        <Text variant="bodySmall" style={styles.kpiLabel}>
          Usuário logado: {user?.name ?? '—'} | Código: "{user?.code ?? ''}"
        </Text>
        <Text variant="bodySmall" style={[styles.kpiLabel, { marginTop: 8 }]}>
          Verifique os claims do JWT retornados pelo Protheus.
        </Text>
      </View>
    );
  }

  if (isError || !data) {
    let errorMsg = 'Não foi possível carregar os dados.';
    let errorDetail = '';
    if (isAxiosError(error)) {
      const status = error.response?.status;
      errorDetail = status
        ? `HTTP ${status} — ${error.response?.statusText ?? ''}`
        : `Rede: ${error.code ?? error.message}`;
    } else if (error instanceof Error) {
      errorDetail = error.message;
    }
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.errorText}>
          {errorMsg}
        </Text>
        {!!errorDetail && (
          <Text variant="bodySmall" style={[styles.kpiLabel, { marginTop: 4 }]}>
            {errorDetail}
          </Text>
        )}
        <Text variant="bodySmall" style={[styles.kpiLabel, { marginTop: 4 }]}>
          Endpoint: /vendedores/{user?.code ?? '?'}/dashboard
        </Text>
        <Text variant="bodySmall" style={[styles.kpiLabel, styles.retryLink]} onPress={() => refetch()}>
          Toque para tentar novamente
        </Text>
      </View>
    );
  }

  const { kpis, evolucaoVendas, topProdutos, ultimosPedidos } = data;

  // Formatar dados para o gráfico de linha (últimos 30 dias)
  const lineData = evolucaoVendas.map((d, i) => ({ x: i, valor: d.valor }));

  // Formatar dados para o gráfico de barras (top 5 produtos)
  const barData = topProdutos.map((p, i) => ({ x: i, valor: p.valor }));
  const barLabels = topProdutos.map((p) =>
    p.descricao.length > 12 ? p.descricao.substring(0, 12) + '…' : p.descricao,
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isFetching && !isLoading}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerName}>
          Olá, {user?.name ?? 'Vendedor'}
        </Text>
        <Text variant="bodySmall" style={styles.headerDate}>
          {today}
        </Text>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        <KpiCard label="Vendas no mês" value={formatCurrency(kpis.totalVendasMes)} />
        <KpiCard label="Pedidos no mês" value={String(kpis.totalPedidosMes)} />
        <KpiCard label="Ticket médio" value={formatCurrency(kpis.ticketMedio)} />
      </View>

      {/* Meta vs Realizado */}
      <MetaCard
        meta={kpis.metaMes}
        realizado={kpis.realizadoMes}
        percentual={kpis.percentualMeta}
      />

      {/* Gráfico de Linha — Evolução de Vendas */}
      <Card style={styles.chartCard} mode="elevated">
        <Card.Content>
          <Text variant="titleSmall" style={styles.chartTitle}>
            Evolução de Vendas (30 dias)
          </Text>
          {lineData.length > 0 ? (
            <View style={styles.chartContainer}>
              <CartesianChart
                data={lineData}
                xKey="x"
                yKeys={['valor']}
                domainPadding={{ left: 10, right: 10, top: 20 }}
              >
                {({ points }) => (
                  <>
                    <Line
                      points={points.valor}
                      color={theme.colors.primary}
                      strokeWidth={2}
                    />
                    {_pressState.isActive && (
                      <Circle
                        cx={_pressState.x.position}
                        cy={_pressState.y.valor.position}
                        r={6}
                        color={theme.colors.primary}
                      />
                    )}
                  </>
                )}
              </CartesianChart>
            </View>
          ) : (
            <Text style={styles.emptyChart}>Sem dados de vendas no período.</Text>
          )}
        </Card.Content>
      </Card>

      {/* Gráfico de Barras — Top 5 Produtos */}
      <Card style={styles.chartCard} mode="elevated">
        <Card.Content>
          <Text variant="titleSmall" style={styles.chartTitle}>
            Top 5 Produtos
          </Text>
          {barData.length > 0 ? (
            <View style={styles.chartContainer}>
              <CartesianChart
                data={barData}
                xKey="x"
                yKeys={['valor']}
                domainPadding={{ left: 20, right: 20, top: 20 }}
              >
                {({ points, chartBounds }) =>
                  points.valor.map((point, i) => (
                    <Bar
                      key={i}
                      points={[point]}
                      chartBounds={chartBounds}
                      color={theme.colors.primary}
                      roundedCorners={{ topLeft: 4, topRight: 4 }}
                    />
                  ))
                }
              </CartesianChart>
              {/* Legenda dos produtos */}
              <View style={styles.barLegend}>
                {barLabels.map((label, i) => (
                  <Text key={i} variant="labelSmall" style={styles.barLegendItem}>
                    {i + 1}. {label}
                  </Text>
                ))}
              </View>
            </View>
          ) : (
            <Text style={styles.emptyChart}>Sem dados de produtos no período.</Text>
          )}
        </Card.Content>
      </Card>

      {/* Últimos Pedidos */}
      <Card style={styles.chartCard} mode="elevated">
        <Card.Content>
          <Text variant="titleSmall" style={styles.chartTitle}>
            Últimos Pedidos
          </Text>
          {ultimosPedidos.length === 0 ? (
            <Text style={styles.emptyChart}>Nenhum pedido encontrado.</Text>
          ) : (
            ultimosPedidos.map((pedido) => (
              <View key={pedido.numero} style={styles.pedidoRow}>
                <View style={styles.pedidoInfo}>
                  <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                    #{pedido.numero}
                  </Text>
                  <Text variant="bodySmall" style={styles.kpiLabel} numberOfLines={1}>
                    {pedido.cliente}
                  </Text>
                  <Text variant="labelSmall" style={styles.kpiLabel}>
                    {format(new Date(pedido.data), 'dd/MM/yyyy')}
                  </Text>
                </View>
                <View style={styles.pedidoRight}>
                  <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                    {formatCurrency(pedido.valorTotal)}
                  </Text>
                  <Badge style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[pedido.status] }]}>
                    {STATUS_LABELS[pedido.status]}
                  </Badge>
                </View>
              </View>
            ))
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    gap: 8,
  },
  loadingText: {
    color: theme.colors.onSurface,
    marginTop: 8,
  },
  errorText: {
    color: theme.colors.error,
  },
  header: {
    marginBottom: 16,
  },
  headerName: {
    color: theme.colors.onBackground,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  headerDate: {
    color: theme.colors.secondary,
    textTransform: 'capitalize',
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  kpiContent: {
    padding: 8,
  },
  kpiLabel: {
    color: theme.colors.secondary,
  },
  kpiValue: {
    color: theme.colors.onSurface,
    fontWeight: '700',
    marginTop: 2,
  },
  metaCard: {
    marginBottom: 8,
    backgroundColor: theme.colors.surface,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  metaItem: {
    flex: 1,
  },
  percentualBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  chartCard: {
    marginBottom: 8,
    backgroundColor: theme.colors.surface,
  },
  chartTitle: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: 12,
  },
  chartContainer: {
    height: 200,
  },
  emptyChart: {
    color: theme.colors.secondary,
    textAlign: 'center',
    paddingVertical: 24,
  },
  barLegend: {
    marginTop: 8,
    gap: 2,
  },
  barLegendItem: {
    color: theme.colors.secondary,
  },
  pedidoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.primaryContainer,
  },
  pedidoInfo: {
    flex: 1,
    gap: 2,
  },
  pedidoRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    color: '#fff',
    fontSize: 10,
  },
  retryLink: {
    color: theme.colors.primary,
    marginTop: 12,
    textDecorationLine: 'underline',
  },
});
