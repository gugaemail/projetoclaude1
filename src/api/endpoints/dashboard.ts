import type { DashboardData } from '../../types/dashboard';
import apiClient from '../client';

const COMPANY = process.env.EXPO_PUBLIC_COMPANY ?? '01';
const BRANCH = process.env.EXPO_PUBLIC_BRANCH ?? '01';

export async function fetchDashboard(vendedorId: string): Promise<DashboardData> {
  const response = await apiClient.get<DashboardData>(
    `/api/faturamento/v1/vendedores/${vendedorId}/dashboard`,
    { params: { company: COMPANY, branch: BRANCH } },
  );
  return response.data;
}
