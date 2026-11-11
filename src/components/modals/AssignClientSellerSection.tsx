'use client';

import React, { useContext, useEffect, useState } from 'react';
import { UserCheck } from 'lucide-react';
import Button from '@/components/ui/button/Button';
import { AuthContext } from '@/context/authContext';
import { assignClientSeller, User } from '@/services/usersService';

interface Props {
  client: User;
  sellers: User[];
  onAssigned: () => void;
}

export const AssignClientSellerSection: React.FC<Props> = ({
  client,
  sellers,
  onAssigned,
}) => {
  const { user: authUser } = useContext(AuthContext);
  const isAdmin = authUser?.userType === 'admin';

  const [selectedSellerId, setSelectedSellerId] = useState<string>(client.sellerId || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedSellerId(client.sellerId || '');
    setError(null);
  }, [client.uid, client.sellerId]);

  if (!isAdmin || client.userType !== 'client') {
    return null;
  }

  const hasChanged = (selectedSellerId || '') !== (client.sellerId || '');

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await assignClientSeller(client.uid, selectedSellerId || null);
      if (response?.success === false) {
        setError(response.message || 'No se pudo asignar el vendedor.');
        return;
      }
      onAssigned();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Error al asignar vendedor.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900 space-y-2.5">
      <div className="flex items-center gap-2">
        <UserCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">
          Asignar Vendedor de Cartera
        </label>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={selectedSellerId}
          onChange={(e) => setSelectedSellerId(e.target.value)}
          disabled={saving}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 shadow-xs focus:border-orange-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="">-- Cartera general libre (sin vendedor) --</option>
          {sellers.map((s) => (
            <option key={s.uid} value={s.uid}>
              {s.names} {s.lastNames} ({s.sellerCode || `VEND-${s.uid.slice(0, 5).toUpperCase()}`})
            </option>
          ))}
        </select>

        <Button
          size="sm"
          variant="primary"
          onClick={handleSave}
          disabled={!hasChanged || saving}
        >
          {saving ? 'Guardando...' : 'Asignar'}
        </Button>
      </div>

      {error && (
        <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
      )}
    </div>
  );
};
