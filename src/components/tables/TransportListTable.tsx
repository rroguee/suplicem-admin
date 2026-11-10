'use client';

import React from 'react';
import TripsListContainer from './transports/TripsListContainer';

/**
 * TransportListTable (Refactorizado)
 * Delega en TripsListContainer con paridad de filtros con la app móvil (suplicem-go)
 * y cumplimiento de la Regla de Oro #1 (<250 líneas) y SRP.
 */
export default function TransportListTable() {
  return <TripsListContainer />;
}
