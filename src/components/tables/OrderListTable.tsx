'use client';

import { useEffect, useState, useCallback } from 'react';
import Pagination from './Pagination';
import ComponentCard from '@/components/common/ComponentCard';
import Button from '@/components/ui/button/Button';
import { CheckLineIcon, CloseLineIcon, EyeIcon } from '@/icons';
import CustomAlert from '../CustomAlert';
import { getOrders, approveOrder, rejectedOrder } from '@/services/ordersService';
import { Modal } from '../ui/modal';
import AddressPicker from '@/hooks/AddressPicker';
import { getUsers, User } from '@/services/usersService'; 
import { formatRD } from '@/utils/currencyUtils';

interface OrderItem {
  productId: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Address {
  longitude: number;
  description: string;
  placeId: string;
  latitude: number;
  additionalInfo?: string;
  recipientName?: string;
  recipientDocument?: string;
  recipientDocumentType?: 'Cédula' | 'Pasaporte' | string;
  userUid?: string;
}

interface OrderDelivery {
  productId: string;
  address: Address;
  quantity: number;
  unit: string;
  status?: 'delivered' | 'pending' | string;
  images?: string[];
  delivered?: boolean;
  availableAddresses?: Address[]; 
  id: string; 
}

interface ServiceOrder {
  id: string;
  orderNumber: number;
  userId: string;
  deliveryType: string;
  items: OrderItem[];
  comments?: string;
  createdAt: string;
  status: 'approved' | 'pending' | 'cancelled' | string;
  deliveries?: OrderDelivery[];
  tripId?: string;
  userNames: string;
  userLastNames: string;
  declineReason?: string;
}

interface EditableDelivery {
  id: string;
  productId: string;
  address: Address;
  quantity: number;
  unit: string;
  availableAddresses: Address[];
}

interface AlertConfig {
  isOpen: boolean;
  type: 'success' | 'error' | 'confirm' | 'info' | 'warning';
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const ITEMS_PER_PAGE = 3;

export default function OrdersTable() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRejectModalOpen, setIsRejectModal] = useState(false);
  const [orderToRejectId, setOrderToRejectId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editedDeliveryType, setEditedDeliveryType] = useState('');
  const [editedDeliveries, setEditedDeliveries] = useState<EditableDelivery[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newAddressData, setNewAddressData] = useState({
    description: "",
    recipientName: "",
    recipientDocument: "",
    recipientDocumentType: "Cédula",
    additionalInfo: "",
    placeId: "",
    latitude: 0,
    longitude: 0,
  });

  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  const STATUS_SORT_ORDER: Record<ServiceOrder['status'], number> = {
    'pending': 1,
    'approved': 2,
    'cancelled': 3,
  };

  const fetchUsers = useCallback(async () => {
    try {
      const response = await getUsers();
      if (response.success) {
        // Aquí se aplica el filtro para mostrar solo los usuarios con userType 'client'
        const clientUsers = response.users.filter((user: User) => user.userType === 'client');
        setUsers(clientUsers);
      } else {
        showAlert({
          message: "No se pudieron cargar los usuarios.",
          type: "error",
          title: "Error"
        });
      }
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      showAlert({
        message: "Error de red al cargar usuarios.",
        type: "error",
        title: "Error"
      });
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getOrders();
      if (response.success) {
        const sortedOrders = response.orders.sort((a: ServiceOrder, b: ServiceOrder) => {
          const statusOrderA = STATUS_SORT_ORDER[a.status] || Infinity;
          const statusOrderB = STATUS_SORT_ORDER[b.status] || Infinity;
          if (statusOrderA !== statusOrderB) return statusOrderA - statusOrderB;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setOrders(sortedOrders);
      } else {
        setError('Error al cargar las órdenes: ' + (response.message || 'Desconocido'));
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('No se pudieron cargar las órdenes. Inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchUsers();
  }, [fetchOrders, fetchUsers]);

  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const calculateOrderTotal = (items: OrderItem[]): number => {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const getStatusDisplay = (status: ServiceOrder['status']) => {
    let text = '';
    let classes = '';
    switch (status) {
      case 'pending': text = 'pendiente'; classes = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'; break;
      case 'approved': text = 'aprobado'; classes = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'; break;
      case 'cancelled': text = 'cancelado'; classes = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'; break;
      default: text = status; classes = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
    return { text, classes };
  };

  const showAlert = (config: Omit<AlertConfig, 'isOpen'>) => {
    setAlertConfig({ ...config, isOpen: true });
  };

  const closeAlert = () => {
    setAlertConfig(prev => ({ ...prev, isOpen: false }));
  };

  const handleViewDetails = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
    setIsEditingDetails(false); 
    setEditedDeliveryType(order.deliveryType || "");

    const initialEditedDeliveries = (order.deliveries || []).map(delivery => {
        let userForThisDelivery = null;
        let availableAddresses: Address[] = [];
        const deliveryUserUid = delivery.address.userUid || order.userId;

        userForThisDelivery = users.find(u => u.uid === deliveryUserUid);

        if (userForThisDelivery) {
            availableAddresses = userForThisDelivery.addresses || [];
        } else if (delivery.address.userUid) {
            availableAddresses = [delivery.address];
        } else {
            userForThisDelivery = users.find(u => u.uid === order.userId);
            availableAddresses = userForThisDelivery?.addresses || [];
        }
        
        const addressExistsInList = availableAddresses.some(
          (addr) => addr.placeId === delivery.address.placeId
        );

        if (!addressExistsInList && delivery.address.placeId) {
          availableAddresses = [delivery.address, ...availableAddresses];
        }

        return {
            ...delivery,
            id: delivery.id || Math.random().toString(36).substring(2, 9),
            availableAddresses,
        };
    });
    setEditedDeliveries(initialEditedDeliveries as EditableDelivery[]);
};


  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOrder(null);
    setIsEditingDetails(false);
  };

  const handleEdit = () => {
    if (!selectedOrder) {
      showAlert({
        message: "No se pudo encontrar la orden.",
        type: "error",
        title: "Error"
      });
      return;
    }

    if (users.length === 0) {
      showAlert({
        message: "Cargando usuarios, por favor espera un momento.",
        type: "info",
        title: "Cargando..."
      });
      return;
    }

    setIsEditingDetails(true);
    setEditedDeliveryType(selectedOrder.deliveryType || "");

    const newEditedDeliveries: EditableDelivery[] = selectedOrder.deliveries?.map((delivery) => {
        let availableAddresses: Address[] = [];
        let addressWithUserUid = delivery.address;
        
        const deliveryUserUid = delivery.address.userUid || selectedOrder.userId;
        const userForThisDelivery = users.find(user => user.uid === deliveryUserUid);

        if (userForThisDelivery) {
            availableAddresses = userForThisDelivery.addresses || [];
            const addressExistsInList = availableAddresses.some(
                (addr) => addr.placeId === delivery.address.placeId
            );
            if (!addressExistsInList && delivery.address.placeId) {
                availableAddresses = [delivery.address, ...availableAddresses];
            }
            addressWithUserUid = {
                ...delivery.address,
                userUid: deliveryUserUid,
            };
        } else {
            availableAddresses = delivery.address ? [delivery.address] : [];
            addressWithUserUid = {
                ...delivery.address,
                userUid: deliveryUserUid,
            };
        }

        const { id, ...restOfDelivery } = delivery;

        return {
            ...restOfDelivery,
            id: id || Math.random().toString(36).substring(2, 9),
            address: addressWithUserUid,
            availableAddresses: availableAddresses,
        };
    }) || [];

    setEditedDeliveries(newEditedDeliveries);
};


  const handleSaveDetails = () => {
    if (!selectedOrder) return;
    const hasEmptyProduct = editedDeliveries.some(
      (delivery) => !delivery.productId || delivery.productId.length === 0
    );

    if (hasEmptyProduct) {
      showAlert({
        message: "Por favor, selecciona un producto para todas las entregas antes de guardar.",
        type: "error",
        title: "Error"
      });
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
        const updatedOrders = orders.map(order => {
            if (order.id === selectedOrder.id) {
                return {
                    ...order,
                    deliveryType: editedDeliveryType,
                    deliveries: editedDeliveries.map(({ availableAddresses, ...rest }) => rest),
                };
            }
            return order;
        });

        setOrders(updatedOrders);
        setSelectedOrder(updatedOrders.find(o => o.id === selectedOrder.id) || null);
        
        setLoading(false);
        setIsEditingDetails(false);
        showAlert({
            type: 'success',
            title: 'Éxito',
            message: 'Detalles de la orden actualizados correctamente.'
        });
    }, 1000);
  };

  const addDelivery = () => {
    const newDelivery: EditableDelivery = {
      id: Math.random().toString(36).substring(2, 9),
      productId: "",
      address: {
        description: "",
        placeId: "",
        latitude: 0,
        longitude: 0,
        userUid: "",
      },
      quantity: 0,
      unit: "fundas",
      availableAddresses: [],
    };
    setEditedDeliveries((prev) => [...prev, newDelivery]);
  };

  const removeDelivery = (id: string) => {
    setEditedDeliveries((prev) => prev.filter((delivery) => delivery.id !== id));
  };

  const updateDelivery = (id: string, newValues: Partial<EditableDelivery>) => {
    setEditedDeliveries((prev) =>
      prev.map((delivery) =>
        delivery.id === id ? {
            ...delivery,
            ...newValues,
            address: {
                ...delivery.address,
                ...newValues.address,
                userUid: delivery.address.userUid,
            }
        } : delivery
      )
    );
};
  
  const handleUserSelection = (userId: string, deliveryId: string) => {
    const user = users.find((u) => u.uid === userId);
    setEditedDeliveries((prev) =>
      prev.map((delivery) => {
        if (delivery.id === deliveryId) {
          return {
            ...delivery,
            address: {
              ...delivery.address,
              userUid: userId,
              placeId: '',
              description: '',
            },
            availableAddresses: user?.addresses || [],
          };
        }
        return delivery;
      })
    );
  };

  const handleAddNewAddress = () => {
    if (!newAddressData.description || !newAddressData.recipientName || !newAddressData.recipientDocument || !newAddressData.recipientDocumentType || !newAddressData.additionalInfo || !newAddressData.placeId || newAddressData.latitude === 0 || newAddressData.longitude === 0) {
      showAlert({
        message: "Todos los campos de la dirección son obligatorios y la dirección debe ser seleccionada del buscador.",
        type: "warning",
        title: "Atención"
      });
      return;
    }

    const newUserUid = `new-user-${Date.now()}`;

    const newAddress: Address = {
      ...newAddressData,
      userUid: newUserUid,
    };

    const newTempUser: User = {
      uid: newUserUid,
      names: newAddressData.recipientName,
      lastNames: "",
      identification: newAddressData.recipientDocument,
      identificationType: newAddressData.recipientDocumentType,
      email: "",
      userType: "client",
      addresses: [newAddress],
    };

    const newDelivery: EditableDelivery = {
      id: Math.random().toString(36).substring(2, 9),
      productId: "",
      quantity: 0,
      unit: "fundas",
      address: newAddress,
      availableAddresses: [newAddress],
    };

    setUsers((prevUsers) => [...prevUsers, newTempUser]);
    setEditedDeliveries((prevDeliveries) => [...prevDeliveries, newDelivery]);

    setIsAddingNewAddress(false);
    setNewAddressData({
      description: "",
      recipientName: "",
      recipientDocument: "",
      recipientDocumentType: "Cédula",
      additionalInfo: "",
      placeId: "",
      latitude: 0,
      longitude: 0,
    });
    showAlert({
      message: "Nueva entrega con dirección agregada.",
      type: "success",
      title: "Éxito"
    });
  };

  const handleApproveOrder = (orderId: string) => {
    const orderNumber = orders.find(o => o.id === orderId)?.orderNumber || '';
    showAlert({
      type: 'confirm',
      title: 'Aprobar Orden',
      message: `¿Estás seguro de que quieres aprobar la orden #${orderNumber}?`,
      onConfirm: async () => {
        try {
          setLoading(true);
          const response = await approveOrder(orderId);
          if (response.success) {
            showAlert({ type: 'success', title: 'Éxito', message: 'Orden aprobada con éxito.' });
            fetchOrders();
          } else {
            showAlert({ type: 'error', title: 'Error', message: 'Error al aprobar la orden: ' + (response.message || 'Desconocido') });
          }
        } catch (err) {
          console.error('Error approving order:', err);
          showAlert({ type: 'error', title: 'Error', message: 'No se pudo aprobar la orden. Inténtalo de nuevo.' });
        } finally {
          setLoading(false);
        }
      },
      onCancel: () => {}
    });
  };

  const handleRejectOrder = (orderId: string) => {
    setOrderToRejectId(orderId);
    setIsRejectModal(true);
  };

  const closeRejectModal = () => {
    setIsRejectModal(false);
    setOrderToRejectId(null);
    setRejectionReason('');
  };

  const confirmRejectOrder = async () => {
    if (!rejectionReason.trim()) {
      showAlert({ type: 'error', title: 'Error de Validación', message: 'El motivo de rechazo es obligatorio.' });
      return;
    }

    if (orderToRejectId) {
      try {
        setLoading(true);
        const response = await rejectedOrder(orderToRejectId, rejectionReason);
        if (response.success) {
          showAlert({ type: 'success', title: 'Éxito', message: 'Orden rechazada con éxito.' });
          fetchOrders();
          closeRejectModal();
        } else {
          showAlert({ type: 'error', title: 'Error', message: 'Error al rechazar la orden: ' + (response.message || 'Desconocido') });
        }
      } catch (err) {
        console.error('Error rejecting order:', err);
        showAlert({ type: 'error', title: 'Error', message: 'No se pudo rechazar la orden. Inténtalo de nuevo.' });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <ComponentCard title="Órdenes">
      {loading && (
        <div className="text-center py-4">
          <p>Cargando órdenes...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-4 text-red-500">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-4">
          <p>No hay órdenes disponibles.</p>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                <th className="px-4 py-3 text-sm font-medium">Orden #</th>
                <th className="px-4 py-3 text-sm font-medium">Cliente</th>
                <th className="px-4 py-3 text-sm font-medium">Producto(s)</th>
                <th className="px-4 py-3 text-sm font-medium">Tipo de Entrega</th>
                <th className="px-4 py-3 text-sm font-medium">Estado</th>
                <th className="px-4 py-3 text-sm font-medium">Total</th>
                <th className="px-4 py-3 text-sm font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => {
                const statusDisplay = getStatusDisplay(order.status);
                const orderTotal = calculateOrderTotal(order.items);
                return (
                  <tr
                    key={order.id}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <td className="px-4 py-3 text-sm">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-sm">{`${order.userNames} ${order.userLastNames}`}</td>
                    <td className="px-4 py-3 text-sm">
                      {order.items.length > 0
                        ? order.items[0].name + (order.items.length > 1 ? ` (+${order.items.length - 1} más)` : '')
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">{order.deliveryType}</td>
                    <td className="px-4 py-3 text-sm capitalize">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${statusDisplay.classes}`}
                      >
                        {statusDisplay.text}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{formatRD(orderTotal)}</td>
                    <td className="px-4 py-3 text-sm flex gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        startIcon={<CheckLineIcon />}
                        onClick={() => handleApproveOrder(order.id)}
                        disabled={order.status !== 'pending'}
                      >
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        startIcon={<CloseLineIcon />}
                        onClick={() => handleRejectOrder(order.id)}
                        disabled={order.status !== 'pending'}
                      >
                        Rechazar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        startIcon={<EyeIcon />}
                        onClick={() => handleViewDetails(order)}
                      >
                        Ver Detalle
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}

      <Modal isOpen={isRejectModalOpen} onClose={closeRejectModal} className="max-w-xs">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Rechazar Orden</h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Por favor, ingresa el motivo del rechazo para la orden #
            {orders.find(o => o.id === orderToRejectId)?.orderNumber || ''}.
          </p>
          <textarea
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md mb-4 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            rows={4}
            placeholder="Motivo de rechazo (obligatorio)"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
          ></textarea>
          <div className="flex justify-end gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={closeRejectModal}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={confirmRejectOrder}
              disabled={!rejectionReason.trim()}
            >
              Confirmar Rechazo
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isDetailModalOpen} onClose={closeDetailModal} className="max-w-3xl">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Detalle de Orden #{selectedOrder.orderNumber}
              </h2>
              <div className="flex justify-end mb-4 gap-2">
                {isEditingDetails ? (
                  <>
                    <Button onClick={handleSaveDetails} variant="primary">Guardar</Button>
                    <Button onClick={() => setIsEditingDetails(false)} variant="outline">Cancelar</Button>
                  </>
                ) : (
                  <Button onClick={handleEdit} variant="primary">Editar</Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Información del Cliente</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Nombre:</span> {`${selectedOrder.userNames} ${selectedOrder.userLastNames}`}
                  </p>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Entrega</label>
                    {isEditingDetails ? (
                      <select
                        value={editedDeliveryType}
                        onChange={(e) => setEditedDeliveryType(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="domicilio">Domicilio</option>
                        <option value="almacen">Almacén</option>
                      </select>
                    ) : (
                      <p className="text-gray-700 dark:text-gray-300 capitalize">{selectedOrder.deliveryType}</p>
                    )}
                  </div>

                  <p className="mt-2 text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Estado:</span>
                    <span className={`ml-2 inline-block rounded-full px-2 py-1 text-xs font-semibold ${getStatusDisplay(selectedOrder.status).classes}`}>
                      {getStatusDisplay(selectedOrder.status).text}
                    </span>
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Resumen de la Orden</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Fecha:</span> {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Total:</span> {formatRD(calculateOrderTotal(selectedOrder.items))}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Productos</h3>
                <ul className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <li key={index} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
                      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Cantidad: {item.quantity} {item.unit} | Subtotal: {formatRD(item.subtotal)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Entregas</h3>
                  {isEditingDetails && editedDeliveryType === 'domicilio' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={addDelivery}>
                        + Entrega existente
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setIsAddingNewAddress(true)}>
                        + Nueva dirección
                      </Button>
                    </div>
                  )}
                </div>
                
                <ul className="space-y-4">
                {(isEditingDetails ? editedDeliveries : selectedOrder?.deliveries ?? []).map((delivery, index) => (
  <li key={delivery.id || index} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
    {isEditingDetails && editedDeliveryType === 'domicilio' ? (
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Entrega {index + 1}</h4>
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Usuario</label>
            <select
              value={delivery.address.userUid || ''}
              onChange={(e) => handleUserSelection(e.target.value, delivery.id)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md"
            >
              <option value="">Seleccionar usuario</option>
              {users.map((user) => (
                <option key={user.uid} value={user.uid}>
                  {user.names} {user.lastNames}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dirección</label>
            <select
              value={delivery.address.placeId || ''}
              onChange={(e) => {
                const selectedAddress = delivery.availableAddresses?.find(
                  (addr) => addr.placeId === e.target.value
                );
                if (selectedAddress) {
                  updateDelivery(delivery.id, { address: selectedAddress });
                }
              }}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md"
            >
              <option value="">Seleccionar dirección</option>
              {delivery.availableAddresses?.map((addr) => (
                <option key={addr.placeId} value={addr.placeId}>
                  {addr.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Producto</label>
          <select
            value={delivery.productId}
            onChange={(e) => updateDelivery(delivery.id, { productId: e.target.value })}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md"
          >
            <option value="">Seleccionar producto</option>
            {selectedOrder?.items.map(item => (
              <option key={item.productId} value={item.productId}>{item.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cantidad ({delivery.unit})</label>
          <input
            type="number"
            value={delivery.quantity}
            onChange={(e) => updateDelivery(delivery.id, { quantity: Number(e.target.value) })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <Button size="sm" variant="outline" onClick={() => removeDelivery(delivery.id)}>Eliminar Entrega</Button>
      </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            Producto: {selectedOrder.items.find(i => i.productId === delivery.productId)?.name || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Cantidad: {delivery.quantity} {delivery.unit}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Dirección: {delivery.address.description}
                          </p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              {selectedOrder.comments && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Comentarios</h3>
                  <p className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
                    {selectedOrder.comments}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>

      <Modal isOpen={isAddingNewAddress} onClose={() => setIsAddingNewAddress(false)} className="max-w-xl">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Agregar Nueva Dirección</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción de la Dirección</label>
              <AddressPicker onPlaceSelected={(data) => {
                setNewAddressData({
                  ...newAddressData,
                  description: data.description,
                  latitude: data.latitude,
                  longitude: data.longitude,
                  placeId: data.placeId,
                });
              }} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Información Adicional</label>
              <input
                type="text"
                value={newAddressData.additionalInfo}
                onChange={(e) => setNewAddressData({...newAddressData, additionalInfo: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de quien recibe</label>
              <input
                type="text"
                value={newAddressData.recipientName}
                onChange={(e) => setNewAddressData({...newAddressData, recipientName: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Documento</label>
              <select
                value={newAddressData.recipientDocumentType}
                onChange={(e) => setNewAddressData({...newAddressData, recipientDocumentType: e.target.value})}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md"
              >
                <option value="Cédula">Cédula</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número de Documento</label>
              <input
                type="text"
                value={newAddressData.recipientDocument}
                onChange={(e) => setNewAddressData({...newAddressData, recipientDocument: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button onClick={() => setIsAddingNewAddress(false)} variant="outline">
                Cancelar
              </Button>
              <Button onClick={handleAddNewAddress} variant="primary">
                Agregar
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <CustomAlert
        isOpen={alertConfig.isOpen}
        type={'info'}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
        onClose={closeAlert}
      />
    </ComponentCard>
  );
}