'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ServiceOrder } from '../types';
import { FilterStatus } from '../../logistics/OrderFilterChips';
import { getOrders } from '@/services/ordersService';

const ITEMS_PER_PAGE = 7;

export function useOrderFilters() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilterState] = useState<FilterStatus>('Todos');

  const [orderCounts, setOrderCounts] = useState<Record<string, number>>({
    Todos: 0,
    pending: 0,
    'Alertas IA': 0,
    approved: 0,
    on_the_way: 0,
    completed: 0,
    rejected: 0,
  });

  const [kpis, setKpis] = useState({
    pendingCount: 0,
    pendingAmount: 0,
    inRouteCount: 0,
    approvedCount: 0,
    aiRiskCount: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const setStatusFilter = (status: FilterStatus) => {
    setStatusFilterState(status);
    setCurrentPage(1);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getOrders({
        status: statusFilter,
        search: debouncedSearch.trim() || undefined,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      });

      if (response.success) {
        setOrders(response.orders || []);
        setTotalPages(response.pagination?.totalPages || 1);
        if (response.orderCounts) setOrderCounts(response.orderCounts);
        if (response.kpis) setKpis(response.kpis);
      } else {
        setError('Error al cargar órdenes.');
      }
    } catch {
      setError('No se pudieron cargar las órdenes.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch, currentPage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    setLoading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    orderCounts,
    kpis,
    fetchOrders,
  };
}
