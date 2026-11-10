'use client';

import React from 'react';
import OrdersListContainer from '../orders/list/OrdersListContainer';

/**
 * OrderListTable (Refactorizado)
 * Delega en el contenedor atómico OrdersListContainer cumpliendo con la Regla de Oro #1 (<250 líneas)
 * y el Principio de Responsabilidad Única (SRP).
 */
export default function OrderListTable() {
  return <OrdersListContainer />;
}
