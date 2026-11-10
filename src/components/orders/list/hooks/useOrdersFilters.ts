'use client';

import { useMemo } from 'react';
import { ServiceOrder } from '../types';
import { FilterStatus } from '../../logistics/OrderFilterChips';

interface UseOrdersFiltersParams {
  orders: ServiceOrder[];
  search: string;
  statusFilter: FilterStatus;
  currentPage: number;
  itemsPerPage: number;
}

export function useOrdersFilters({
  orders,
  search,
  statusFilter,
  currentPage,
  itemsPerPage,
}: UseOrdersFiltersParams) {
  return useMemo(() => {
    let pendingAmt = 0;
    let pendingCnt = 0;
    let inRouteCnt = 0;
    let approvedCnt = 0;
    let aiRiskCnt = 0;

    const counts: Record<string, number> = {
      Todos: orders.length,
      pending: 0,
      'Alertas IA': 0,
      approved: 0,
      on_the_way: 0,
      completed: 0,
      rejected: 0,
    };

    orders.forEach((o) => {
      if (counts[o.status] !== undefined) counts[o.status]++;
      if (o.aiRiskFlag) {
        counts['Alertas IA']++;
        aiRiskCnt++;
      }
      if (o.status === 'pending') {
        pendingCnt++;
        const total = (o.items || []).reduce((s, it) => s + (it.subtotal || 0), 0);
        pendingAmt += total;
      }
      if (o.status === 'on_the_way') inRouteCnt++;
      if (o.status === 'approved') approvedCnt++;
    });

    const filtered = orders.filter((order) => {
      const matchesSearch =
        search.trim() === '' ||
        String(order.orderNumber).includes(search) ||
        `${order.userNames} ${order.userLastNames}`.toLowerCase().includes(search.toLowerCase()) ||
        (order.userPhone && order.userPhone.includes(search));

      let matchesStatus = true;
      if (statusFilter === 'Alertas IA') {
        matchesStatus = Boolean(order.aiRiskFlag);
      } else if (statusFilter !== 'Todos') {
        matchesStatus = order.status === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = filtered.slice(start, start + itemsPerPage);

    return {
      filteredOrders: filtered,
      paginatedOrders,
      orderCounts: counts,
      totalPages,
      kpis: {
        pendingCount: pendingCnt,
        pendingAmount: pendingAmt,
        inRouteCount: inRouteCnt,
        approvedCount: approvedCnt,
        aiRiskCount: aiRiskCnt,
      },
    };
  }, [orders, search, statusFilter, currentPage, itemsPerPage]);
}
