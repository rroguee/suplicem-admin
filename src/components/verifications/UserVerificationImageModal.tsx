'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { ExternalLink } from 'lucide-react';

interface Props {
  imageUrl: string | null;
  onClose: () => void;
}

export const UserVerificationImageModal: React.FC<Props> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <Modal isOpen={!!imageUrl} onClose={onClose} className="max-w-3xl p-4 sm:p-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          Documento de Identificación Adjunto
        </h3>
        <div className="flex items-center gap-2 mr-10 sm:mr-12">
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Abrir original</span>
          </a>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center overflow-hidden rounded-xl bg-gray-900/90 p-2 min-h-[350px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Documento de Identidad"
          className="max-h-[70vh] w-auto rounded-lg object-contain"
        />
      </div>
    </Modal>
  );
};
