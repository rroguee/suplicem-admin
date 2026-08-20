'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import Pagination from './Pagination';
import { PlusIcon } from '@/icons';
import { Search, Info, Calendar, Truck, User, MapPin, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import CustomAlert from '../CustomAlert';
import { getAllTrips, getTripDetail, createTrip, getDriverLocation } from '@/services/tripsService';
import { getOrdersWithStatus } from '@/services/ordersService';
import { Modal } from '../ui/modal';
import TripMap from '../TripMap';

// --- Interfaces para los datos del viaje ---
interface OrderItem {
  productId: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface OrderDelivery {
  productId: string;
  address: {
    longitude: number;
    description: string;
    placeId: string;
    latitude: number;
  };
  quantity: number;
  unit: string;
  status: 'delivered' | 'pending' | string;
  imageUrl?: string;
  delivered?: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  deliveryType: string;
  items: OrderItem[];
  comments: string;
  createdAt: string;
  status: 'approved' | 'pending' | 'canceled' | string;
  deliveries?: OrderDelivery[];
  userNames: string;
  userLastNames: string;
  userPhone: string;
}

interface ApprovedOrder extends Order {
  tripId?: string;
}

interface Driver {
  uid: string;
  names: string;
  lastNames: string;
  phone: string;
}

interface Trip {
  id: string;
  tripNumber: string;
  orderIds: string[];
  comments: string;
  totalTons: number;
  status: 'available' | 'accepted' | 'canceled' | 'started' | 'completed' | 'rejected' | null;
  createdAt: string;
  assignedDriverId?: string;
  driver?: Driver;
  orders?: Order[];
}

type StatusInfo = {
  text: string;
  color: 'primary' | 'success' | 'error' | 'warning' | 'info' | 'light' | 'dark';
};

interface AlertConfig {
  isOpen: boolean;
  type: 'success' | 'error' | 'confirm' | 'info';
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}


const ITEMS_PER_PAGE = 5;
const TRACKING_STEPS = ["Pendiente de iniciar", "En camino", "Completado"];
const formatRD = (amount: number): string => {
  return `RD$ ${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
};
const ORDER_PREFIX = { ORD: 'ORD-' };

// --- Función para ordenar los viajes por estado (NUEVO) ---
const sortTripsByStatus = (trips: Trip[]): Trip[] => {
  const statusOrder = {
    started: 1,      // Iniciados primero
    available: 2,    // Luego pendientes (disponibles)
    completed: 3,    // Después finalizados
    canceled: 4,     // Al final cancelados
    rejected: 4,
    default: 5,
  };

  return [...trips].sort((a, b) => {
    const statusA = a.status ?? 'default';
    const statusB = b.status ?? 'default';
    return (statusOrder[statusA as keyof typeof statusOrder] || 5) - (statusOrder[statusB as keyof typeof statusOrder] || 5);
  });
};


const TripListTable = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTripDetail, setSelectedTripDetail] = useState<Trip | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [expandedOrderIndex, setExpandedOrderIndex] = useState<number | null>(null);
  const [isCreateTripModalOpen, setIsCreateTripModalOpen] = useState(false);
  const [numberTrip, setNumberTrip] = useState('');
  const [comment, setComment] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [savedOrders, setSavedOrders] = useState<ApprovedOrder[]>([]);
  const [isOrderSelectionModalVisible, setIsOrderSelectionModalVisible] = useState(false);
  const [approvedOrdersForSelection, setApprovedOrdersForSelection] = useState<ApprovedOrder[]>([]);

  // 🗺️ Estados para el rastreo en el mapa
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationIntervalId, setLocationIntervalId] = useState<NodeJS.Timeout | null>(null);

  const [createTripAlertConfig, setCreateTripAlertConfig] = useState<AlertConfig>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showAlert = (config: Omit<AlertConfig, 'isOpen'>) => {
    setAlertConfig({ ...config, isOpen: true });
  };

  const closeAlert = () => {
    setAlertConfig(prev => ({ ...prev, isOpen: false }));
  };

  const showCreateTripAlert = (config: Omit<AlertConfig, 'isOpen'>) => {
    setCreateTripAlertConfig({ ...config, isOpen: true });
  };

  const closeCreateTripAlert = () => {
    setCreateTripAlertConfig(prev => ({ ...prev, isOpen: false }));
  };

  const statusTranslation: Record<string, StatusInfo> = {
    available: { text: "Pendiente", color: "warning" },
    accepted: { text: "Aceptado", color: "primary" },
    canceled: { text: "Cancelado", color: "error" },
    started: { text: "Iniciado", color: "info" },
    completed: { text: "Finalizado", color: "success" },
    rejected: { text: "Rechazado", color: "error" },
    default: { text: "Desconocido", color: "light" },
  };

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllTrips();
      if (response.success) {
        // Aplica el ordenamiento aquí ANTES de establecer el estado
        const sortedTrips = sortTripsByStatus(response.trips);
        setTrips(sortedTrips);
      } else {
        showAlert({
          type: 'error',
          title: 'Error al cargar',
          message: 'No se pudieron obtener los viajes: ' + (response.message || 'Desconocido'),
        });
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
      showAlert({
        type: 'error',
        title: 'Error de Conexión',
        message: 'Ocurrió un error al obtener los viajes. Inténtalo de nuevo más tarde.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchApprovedOrdersForSelection = useCallback(async () => {
    try {
      const data = await getOrdersWithStatus("approved");
      if (data?.success && data?.orders?.length > 0) {
        const filteredOrders = data.orders?.filter(
          (order: ApprovedOrder) => !order.tripId && order?.deliveryType === "domicilio"
        );
        setApprovedOrdersForSelection(filteredOrders);
      } else {
        showCreateTripAlert({
          message: "No se pudieron cargar las órdenes aprobadas para selección.",
          type: "error",
          title: "Error de Carga"
        });
      }
    } catch (error) {
      console.error("Error al obtener órdenes aprobadas para selección:", error);
      showCreateTripAlert({
        message: "Ocurrió un error al cargar las órdenes aprobadas.",
        type: "error",
        title: "Error de Conexión"
      });
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const filteredTrips = trips.filter((trip) => {
    const statusInfo = statusTranslation[trip.status ?? ''] || statusTranslation.default;
    const matchesSearch =
      trip.tripNumber?.toLowerCase().includes(search.toLowerCase()) ||
      trip.comments?.toLowerCase().includes(search.toLowerCase()) ||
      trip.orderIds.some((id) =>
        id.toLowerCase().includes(search.toLowerCase())
      );
    const matchesStatus = statusFilter === 'Todos' || statusInfo.text === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTrips.length / ITEMS_PER_PAGE);
  const paginatedTrips = filteredTrips.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // 🗺️ Nueva función para obtener la ubicación del conductor
  const fetchDriverLocation = useCallback(async (driverId: string) => {
    try {
      const response = await getDriverLocation(driverId);
      if (response?.success && response?.location) {
        setDriverLocation({
          lat: response.location.lat,
          lng: response.location.lng,
        });
      }
    } catch (error) {
      console.error("Error obteniendo la ubicación del conductor:", error);
    }
  }, []);

  const handleViewTripDetail = async (tripId: string) => {
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    setDetailError(null);
    setSelectedTripDetail(null);
    setExpandedOrderIndex(null);
    setDriverLocation(null); // Limpiar la ubicación anterior

    try {
      const response = await getTripDetail(tripId);
      if (response.success && response.trip) {
        setSelectedTripDetail(response.trip);
      } else {
        setDetailError('No se pudo cargar el detalle del viaje: ' + (response?.message || 'Desconocido'));
      }
    } catch (err) {
      console.error('Error fetching trip detail:', err);
      setDetailError('Ocurrió un error al consultar el detalle del viaje.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTripDetail(null);
    setDetailError(null);
    setExpandedOrderIndex(null);
    // 🗺️ Limpiar el intervalo y la ubicación cuando se cierra el modal
    if (locationIntervalId) {
      clearInterval(locationIntervalId);
      setLocationIntervalId(null);
    }
    setDriverLocation(null);
  };

  // 🗺️ Nuevo useEffect para gestionar el rastreo
  useEffect(() => {
    if (isDetailModalOpen && selectedTripDetail?.assignedDriverId) {
      const { status, assignedDriverId } = selectedTripDetail;
      if (status === "accepted" || status === "started") {
        fetchDriverLocation(assignedDriverId);
        const interval = setInterval(() => {
          fetchDriverLocation(assignedDriverId);
        }, 8000);
        setLocationIntervalId(interval);
      }
    }
    return () => {
      if (locationIntervalId) {
        clearInterval(locationIntervalId);
        setLocationIntervalId(null);
      }
    };
  }, [isDetailModalOpen, selectedTripDetail, fetchDriverLocation]);

  const getStepCompleted = (step: string) => {
    if (!selectedTripDetail) return false;
    const stepIndex = TRACKING_STEPS.indexOf(step);
    let currentIndex = -1;
    if (selectedTripDetail.status === "accepted") {
      currentIndex = TRACKING_STEPS.indexOf("Pendiente de iniciar");
    } else if (selectedTripDetail.status === "started") {
      currentIndex = TRACKING_STEPS.indexOf("En camino");
    } else if (selectedTripDetail.status === "completed") {
      currentIndex = TRACKING_STEPS.indexOf("Completado");
    }
    return stepIndex <= currentIndex;
  };

  const toggleOrder = (index: number) => {
    setExpandedOrderIndex((prev) => (prev === index ? null : index));
  };

  const handleCreateTrip = () => {
    setIsCreateTripModalOpen(true);
    fetchApprovedOrdersForSelection();
  };

  const closeCreateTripModal = () => {
    setIsCreateTripModalOpen(false);
    setNumberTrip('');
    setComment('');
    setSelectedOrders([]);
    setSavedOrders([]);
    setIsOrderSelectionModalVisible(false);
    closeCreateTripAlert();
  };

  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const handleSaveSelectedOrders = () => {
    const newlySelected = approvedOrdersForSelection.filter((order) =>
      selectedOrders.includes(order.id)
    );
    const newUnique = newlySelected.filter(
      (order) => !savedOrders.some((saved) => saved.id === order.id)
    );
    setSavedOrders((prev) => [...prev, ...newUnique]);
    setIsOrderSelectionModalVisible(false);
    setSelectedOrders([]);
  };

  const handleRemoveSavedOrder = (orderId: string) => {
    setSavedOrders((prev) => prev.filter((order) => order.id !== orderId));
  };

  const handleSubmitCreateTrip = async () => {
    if (!numberTrip.trim() || !comment.trim()) {
      showCreateTripAlert({
        message: "Número de viaje y comentario son obligatorios.",
        type: "error",
        title: "Campos Requeridos"
      });
      return;
    }
    if (savedOrders.length === 0) {
      showCreateTripAlert({
        message: "Debe agregar al menos una orden.",
        type: "error",
        title: "Órdenes Requeridas"
      });
      return;
    }
    const orderWithoutDeliveries = savedOrders.find(
      (order) => !order.deliveries || order.deliveries.length === 0
    );
    if (orderWithoutDeliveries) {
      showCreateTripAlert({
        message: `La orden ${ORDER_PREFIX.ORD}${orderWithoutDeliveries.orderNumber} no tiene entregas.`,
        type: "error",
        title: "Error de Órdenes"
      });
      return;
    }
    const totalTons = savedOrders.reduce((sum, order) => {
      const orderTons = order.deliveries?.reduce(
        (acc, delivery) => acc + (delivery.quantity || 0),
        0
      );
      return sum + (orderTons || 0);
    }, 0);

    if (totalTons <= 0) {
      showCreateTripAlert({
        message: "No se puede crear un viaje sin toneladas asignadas a las órdenes seleccionadas.",
        type: "error",
        title: "Error de Toneladas"
      });
      return;
    }

    const orderIds = savedOrders.map((order) => order.id);

    try {
      setLoading(true);
      const response = await createTrip(numberTrip, orderIds, totalTons, comment);
      if (response.success) {
        showCreateTripAlert({
          message: "Viaje creado correctamente.",
          type: "success",
          title: "Éxito",
          onConfirm: () => {
            closeCreateTripModal();
            fetchTrips();
          },
        });
      } else {
        showCreateTripAlert({
          message: "Hubo un problema al crear el viaje: " + (response.message || 'Desconocido'),
          type: "error",
          title: "Error al Crear Viaje"
        });
      }
    } catch (error: any) {
      console.error("Error al crear el viaje:", error);
      showCreateTripAlert({
        message: "Ocurrió un error al crear el viaje. " + (error.response?.data?.message || error.message),
        type: "error",
        title: "Error de Conexión"
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white"></h2>
        <Button
          size="md"
          variant="primary"
          startIcon={<PlusIcon />}
          onClick={handleCreateTrip}
        >
          Nuevo Viaje
        </Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1024px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400 font-medium">
                    Viaje
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400 font-medium">
                    Detalles
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400 font-medium">
                    Estado
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400 font-medium">
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading && (
                  <TableRow>
                    <TableCell className="px-5 py-4 text-center text-gray-500 dark:text-gray-400">
                      Cargando viajes...
                    </TableCell>
                    <TableCell>{""}</TableCell>
                    <TableCell>{""}</TableCell>
                    <TableCell>{""}</TableCell>
                  </TableRow>
                )}
                {error && (
                  <TableRow>
                    <TableCell className="px-5 py-4 text-center text-red-500">
                      {error}
                    </TableCell>
                    <TableCell>{""}</TableCell>
                    <TableCell>{""}</TableCell>
                    <TableCell>{""}</TableCell>
                  </TableRow>
                )}
                {!loading && !error && filteredTrips.length === 0 && (
                  <TableRow>
                    <TableCell className="px-5 py-4 text-center text-gray-500 dark:text-gray-400">
                      No hay viajes disponibles.
                    </TableCell>
                    <TableCell>{""}</TableCell>
                    <TableCell>{""}</TableCell>
                    <TableCell>{""}</TableCell>
                  </TableRow>
                )}
                {!loading && !error && filteredTrips.length > 0 && paginatedTrips.map((trip) => {
                  const statusInfo = statusTranslation[trip.status ?? ''] || statusTranslation.default;
                  return (
                    <TableRow key={trip.id}>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex flex-col">
                          <span className="text-theme-sm font-bold text-gray-800 dark:text-white/90">
                            {trip.tripNumber}
                          </span>
                          {trip.comments && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                              {trip.comments}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-2 mb-1">
                          <Truck size={18} className="text-gray-500 dark:text-gray-400" />
                          <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                            Toneladas: <span className="font-semibold">{trip.totalTons}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar size={18} className="text-gray-500 dark:text-gray-400" />
                          <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                            Fecha: <span className="font-semibold">{new Date(trip.createdAt).toLocaleString()}</span>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge size="sm" color={statusInfo.color}>
                          {statusInfo.text}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleViewTripDetail(trip.id)}
                        >
                          Ver Detalle
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {!isCreateTripModalOpen && (
        <CustomAlert
          isOpen={alertConfig.isOpen}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          onConfirm={alertConfig.onConfirm}
          onCancel={alertConfig.onCancel}
          onClose={closeAlert}
        />
      )}

      <Modal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        className="max-w-3xl p-6 md:p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white text-center">
          Detalle del Viaje: {selectedTripDetail?.tripNumber}
        </h3>

        {detailLoading ? (
          <p className="text-center text-gray-500 dark:text-gray-400">Cargando detalle...</p>
        ) : detailError ? (
          <p className="text-center text-red-500">{detailError}</p>
        ) : selectedTripDetail ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <div className="rounded-xl p-5 bg-gray-50 dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Estado del viaje</h4>
                <Badge
                  size="md"
                  color={statusTranslation[selectedTripDetail.status ?? 'default'].color}
                >
                  {statusTranslation[selectedTripDetail.status ?? 'default'].text}
                </Badge>
              </div>

              {selectedTripDetail.driver && (
                <div className="rounded-xl p-5 bg-gray-50 dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Datos del conductor</h4>
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 mb-2">
                    <User size={18} className="text-green-500" />
                    <span className="font-medium">{selectedTripDetail.driver.names} {selectedTripDetail.driver.lastNames}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <Info size={18} className="text-blue-500" />
                    <span className="font-medium">{selectedTripDetail.driver.phone}</span>
                  </div>
                </div>
              )}

              <div className="rounded-xl p-5 bg-gray-50 dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Seguimiento del pedido</h4>
                {TRACKING_STEPS.map((step, index) => (
                  <div key={index} className="flex items-center mb-2 last:mb-0">
                    <div
                      className={`w-4 h-4 rounded-full mr-3 flex-shrink-0 ${
                        getStepCompleted(step) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                      } transition-all duration-300`}
                    ></div>
                    <span className="text-gray-700 dark:text-gray-300">{step}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-xl p-5 bg-gray-50 dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Órdenes</h4>
                {selectedTripDetail.orders && selectedTripDetail.orders.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {selectedTripDetail.orders.map((order, index) => {
                      const isExpanded = expandedOrderIndex === index;
                      return (
                        <div key={order.id} className="mb-4 last:mb-0 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                          <div
                            className="flex justify-between items-center cursor-pointer py-2"
                            onClick={() => toggleOrder(index)}
                          >
                            <span className="text-base font-semibold text-gray-800 dark:text-white">
                              ORD{order.orderNumber}
                            </span>
                            <span className="text-lg text-gray-500">{isExpanded ? '▲' : '▼'}</span>
                          </div>

                          {isExpanded && (
                            <div className="mt-2 space-y-3 p-3 bg-white dark:bg-gray-900 rounded-md shadow-inner">
                              <div className="border-b border-gray-100 dark:border-gray-800 pb-2">
                                <h5 className="text-sm font-semibold mb-1 text-gray-800 dark:text-white">Datos del cliente</h5>
                                <p className="text-sm text-gray-700 dark:text-gray-300">👤 {order.userNames} {order.userLastNames}</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">📞 {order.userPhone}</p>
                              </div>
                              <div className="border-b border-gray-100 dark:border-gray-800 pb-2">
                                <h5 className="text-sm font-semibold mb-1 text-gray-800 dark:text-white">Productos</h5>
                                {order.items.map((item, itemIndex) => (
                                  <div key={itemIndex} className="text-sm text-gray-700 dark:text-gray-300 mb-1 last:mb-0">
                                    <span className="font-medium">{item.name}:</span> {item.quantity} {item.unit}
                                  </div>
                                ))}
                              </div>
                              <div>
                                <h5 className="text-sm font-semibold mb-1 text-gray-800 dark:text-white">Direcciones de entrega</h5>
                                {order.deliveries && order.deliveries.length > 0 ? (
                                  order.deliveries.map((delivery, deliveryIndex) => (
                                    <>
                                      <div key={deliveryIndex} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 mb-2">
                                        <MapPin size={16} className="flex-shrink-0 mt-1 text-blue-500" />
                                        <div>
                                          <p>{delivery.address?.description}</p>
                                          <p className="text-xs italic text-gray-500">
                                            {delivery.status === 'delivered' ? '✅ Entregado' : 'Pendiente'}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="w-full max-h-80 overflow-hidden rounded-lg">
                                          <img
                                            src={delivery.imageUrl}
                                            alt="Imagen de la entrega"
                                            className="w-full h-full object-contain"
                                          />
                                      </div>
                                    </>
                                  ))
                                ) : (
                                  <p className="text-sm text-gray-500 dark:text-gray-400">No hay direcciones de entrega.</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No hay órdenes para este viaje.</p>
                )}
              </div>

              {selectedTripDetail.assignedDriverId &&
                (selectedTripDetail.status === "accepted" || selectedTripDetail.status === "started") && (
                  <div className="rounded-xl p-5 bg-gray-50 dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Ubicación actual del camión</h4>
                    <div className="h-64 rounded-md overflow-hidden shadow-inner">
                      <TripMap
                        driverLocation={driverLocation}
                        driverInfo={selectedTripDetail.driver}
                        deliveries={
                          selectedTripDetail.orders?.flatMap(order =>
                            order.deliveries?.map(delivery => ({
                              ...delivery,
                              userId: order.userId,
                              userNames: order.userNames,
                              userLastNames: order.userLastNames,
                              userPhone: order.userPhone,
                            })) || []
                          ) || []
                        }
                      />
                    </div>
                  </div>
                )}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">No hay detalles disponibles.</p>
        )}

        <div className="flex justify-end mt-6">
          <Button size="sm" variant="outline" onClick={closeDetailModal}>
            Cerrar
          </Button>
        </div>
      </Modal>

      <Modal isOpen={isCreateTripModalOpen} onClose={closeCreateTripModal} className="max-w-2xl p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Crear Nuevo Viaje</h3>

        <CustomAlert
          isOpen={createTripAlertConfig.isOpen}
          type={createTripAlertConfig.type}
          title={createTripAlertConfig.title}
          message={createTripAlertConfig.message}
          onConfirm={createTripAlertConfig.onConfirm}
          onCancel={createTripAlertConfig.onCancel}
          onClose={closeCreateTripAlert}
        />

        <div className="space-y-4">
          <div>
            <Label>Número de viaje</Label>
            <Input
              type="text"
              placeholder="Ej: TRIP-001"
              value={numberTrip}
              onChange={(e) => setNumberTrip(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <Label>
              {savedOrders.length > 0
                ? "Órdenes seleccionadas:"
                : "Agregar órdenes al viaje:"}
            </Label>
            {savedOrders.length > 0 && (
              <div className="space-y-2 mt-2">
                {savedOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">
                        Orden: {ORDER_PREFIX.ORD}{order.orderNumber}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        Cliente: {order.userNames} {order.userLastNames}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveSavedOrder(order.id)}
                      className="p-1"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsOrderSelectionModalVisible(true)}
              className="mt-4 w-full"
            >
              Agregar Órdenes
            </Button>
          </div>

          <div>
            <Label>Comentario:</Label>
            <Input
              type="text"
              placeholder="Ej: Detalles del viaje"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button size="sm" variant="outline" onClick={closeCreateTripModal}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSubmitCreateTrip}>
              Crear Viaje
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isOrderSelectionModalVisible} onClose={() => setIsOrderSelectionModalVisible(false)} className="max-w-md p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Órdenes Aprobadas</h3>
        <div className="max-h-96 overflow-y-auto mb-4">
          {approvedOrdersForSelection.length > 0 ? (
            approvedOrdersForSelection.map((order) => (
              <div
                key={order.id}
                className={`p-3 mb-2 rounded-md border cursor-pointer ${
                  selectedOrders.includes(order.id)
                    ? 'bg-blue-100 border-blue-400 dark:bg-blue-900 dark:border-blue-600'
                    : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                }`}
                onClick={() => toggleSelectOrder(order.id)}
              >
                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                  Orden: {ORDER_PREFIX.ORD}{order.orderNumber}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Cliente: {order.userNames} {order.userLastNames}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">No hay órdenes disponibles para agregar.</p>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <Button size="sm" variant="outline" onClick={() => setIsOrderSelectionModalVisible(false)}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSaveSelectedOrders} disabled={selectedOrders.length === 0}>
            Guardar seleccionadas
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default TripListTable;