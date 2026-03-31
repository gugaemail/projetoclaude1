import { useQuery } from '@tanstack/react-query';
import { fetchDashboard } from '../api/endpoints/dashboard';
import { useAuthStore } from '../store/authStore';

export function useDashboard(vendedorId?: string) {
  const user = useAuthStore((s) => s.user);
  const id = vendedorId ?? user?.code ?? '';

  return useQuery({
    queryKey: ['dashboard', id],
    queryFn: () => fetchDashboard(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 min
  });
}
