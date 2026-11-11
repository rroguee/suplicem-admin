"use client";

import { useState, useEffect, useCallback, useContext } from "react";
import { AuthContext } from "@/context/authContext";
import { getUsers, User } from "@/services/usersService";
import { getProducts } from "@/services/prodcutsService";
import { getBankAccounts, BankAccount } from "@/services/bankAccountService";
import { createOrder, CreateOrderPayload } from "@/services/ordersService";

export interface SelectedItem {
  productId: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface GooglePlaceData {
  description: string;
  placeId: string;
  latitude: number;
  longitude: number;
}

export function useAssistedOrder(
  initialClient?: User | null,
  onSuccess?: () => void,
  initialClientId?: string | null
) {
  const { user } = useContext(AuthContext);
  const [clients, setClients] = useState<User[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedClient, setSelectedClient] = useState<User | null>(initialClient || null);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(0);
  const [isCustomAddress, setIsCustomAddress] = useState(false);
  const [customAddressData, setCustomAddressData] = useState<GooglePlaceData | null>(null);
  const [items, setItems] = useState<SelectedItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"transfer" | "credit">("credit");
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>("");
  const [creditNote, setCreditNote] = useState<string>("");
  const [transferReference, setTransferReference] = useState<string>("");
  const [deliveryNotes, setDeliveryNotes] = useState<string>("");
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoadingData(true);
    setErrorMessage(null);
    try {
      const [usersRes, prodsRes, banksRes] = await Promise.all([
        getUsers({ userType: "client" }),
        getProducts(),
        getBankAccounts(),
      ]);

      if (usersRes.success) {
        const sellerClients = (usersRes.users || []).filter(
          (u: User) => u.userType === "client" && (user?.userType === "admin" || u.sellerId === user?.uid)
        );
        setClients(sellerClients);
        if (initialClientId) {
          const matched = sellerClients.find((c: User) => c.uid === initialClientId);
          if (matched) {
            setSelectedClient(matched);
            setSelectedAddressIndex(0);
          }
        }
      }
      if (prodsRes.success) {
        setProducts(prodsRes.products || []);
      }
      setBankAccounts(banksRes || []);
      if (banksRes && banksRes.length > 0) {
        setSelectedBankAccountId(banksRes[0].id);
      }
    } catch (err: any) {
      setErrorMessage("Error al cargar datos comerciales: " + (err.message || "Desconocido"));
    } finally {
      setLoadingData(false);
    }
  }, [user, initialClientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (initialClient) {
      setSelectedClient(initialClient);
      setSelectedAddressIndex(0);
    }
  }, [initialClient]);

  const setItemQuantity = (product: any, qty: number) => {
    const validQty = Math.max(0, qty);
    setItems((prev) => {
      if (validQty === 0) {
        return prev.filter((it) => it.productId !== product.id);
      }
      const existing = prev.find((it) => it.productId === product.id);
      if (existing) {
        return prev.map((it) => (it.productId === product.id ? { ...it, quantity: validQty } : it));
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          quantity: validQty,
          unit: product.unit || "fundas",
          unitPrice: product.price || 0,
        },
      ];
    });
  };

  const estimatedTotal = items.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0);
  const totalBags = items.reduce((acc, it) => acc + it.quantity, 0);
  const totalTons = Number(((totalBags * 42.5) / 1000).toFixed(2));

  const submitAssistedOrder = async (): Promise<{ success: boolean; orderNumber?: number; message?: string }> => {
    if (!selectedClient) {
      return { success: false, message: "Selecciona un cliente de tu cartera." };
    }
    if (items.length === 0) {
      return { success: false, message: "Agrega al menos un producto a la orden." };
    }

    let finalAddress: any = null;

    if (isCustomAddress) {
      if (!customAddressData || !customAddressData.description.trim()) {
        return { success: false, message: "Selecciona una dirección válida de las sugerencias de Google Maps." };
      }
      finalAddress = {
        description: customAddressData.description.trim(),
        placeId: customAddressData.placeId || `manual-web-${Date.now()}`,
        latitude: customAddressData.latitude || 18.4861,
        longitude: customAddressData.longitude || -69.9312,
        additionalInfo: "Dirección de obra seleccionada vía Google Maps",
        recipientName: `${selectedClient.names} ${selectedClient.lastNames}`,
        recipientDocument: selectedClient.identification,
        recipientDocumentType: selectedClient.identificationType,
      };
    } else {
      const addresses = selectedClient.addresses || [];
      const clientAddress = addresses[selectedAddressIndex] || addresses[0];
      if (!clientAddress) {
        return { success: false, message: "El cliente no tiene dirección registrada. Agrega una nueva dirección con Google Maps." };
      }
      finalAddress = {
        description: clientAddress.description,
        placeId: clientAddress.placeId || "manual-web",
        latitude: clientAddress.latitude || 18.4861,
        longitude: clientAddress.longitude || -69.9312,
        additionalInfo: clientAddress.additionalInfo || "",
        recipientName: `${selectedClient.names} ${selectedClient.lastNames}`,
        recipientDocument: selectedClient.identification,
        recipientDocumentType: selectedClient.identificationType,
      };
    }

    if (paymentMethod === "transfer" && !selectedBankAccountId) {
      return { success: false, message: "Selecciona la cuenta bancaria de destino para la transferencia." };
    }

    const idempotencyKey =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    let combinedComments = deliveryNotes.trim();
    if (paymentMethod === "transfer" && transferReference.trim()) {
      combinedComments = combinedComments
        ? `Ref Transferencia: ${transferReference.trim()} • ${combinedComments}`
        : `Ref Transferencia: ${transferReference.trim()}`;
    }

    const payload: CreateOrderPayload = {
      userId: selectedClient.uid,
      createdBySellerId: user?.uid,
      deliveryType: "domicilio",
      deliveryAddress: finalAddress,
      deliveries: items.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
        unit: it.unit || "fundas",
        address: finalAddress,
      })),
      items: items.map((it) => ({
        productId: it.productId,
        name: it.name,
        quantity: it.quantity,
        unit: it.unit || "fundas",
      })),
      paymentMethod,
      bankAccountId: paymentMethod === "transfer" ? selectedBankAccountId : undefined,
      creditNote: paymentMethod === "credit" ? creditNote.trim() || "Crédito comercial autorizado" : undefined,
      comments: combinedComments || undefined,
    };

    setSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await createOrder(payload, idempotencyKey);
      setSubmitting(false);
      if (res.success) {
        if (onSuccess) onSuccess();
        return { success: true, orderNumber: res.orderNumber };
      }
      return { success: false, message: res.message || "Error al emitir pedido." };
    } catch (err: any) {
      setSubmitting(false);
      const valErrors = err.response?.data?.errors;
      const msg = valErrors && Array.isArray(valErrors)
        ? valErrors.map((e: any) => e.message).join(" • ")
        : err.response?.data?.message || err.message || "Error al crear el pedido";
      setErrorMessage(msg);
      return { success: false, message: msg };
    }
  };

  return {
    clients,
    products,
    bankAccounts,
    selectedClient,
    setSelectedClient,
    selectedAddressIndex,
    setSelectedAddressIndex,
    isCustomAddress,
    setIsCustomAddress,
    customAddressData,
    setCustomAddressData,
    items,
    setItemQuantity,
    paymentMethod,
    setPaymentMethod,
    selectedBankAccountId,
    setSelectedBankAccountId,
    creditNote,
    setCreditNote,
    transferReference,
    setTransferReference,
    deliveryNotes,
    setDeliveryNotes,
    estimatedTotal,
    totalBags,
    totalTons,
    loadingData,
    submitting,
    errorMessage,
    submitAssistedOrder,
    isAdmin: user?.userType === "admin",
  };
}

export type UseAssistedOrderReturn = ReturnType<typeof useAssistedOrder>;
