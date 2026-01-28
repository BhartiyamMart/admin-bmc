'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface ToggleStatusDialogProps {
  isOpen: boolean;
  userName: string | null;
  currentStatus: boolean;
  userType: 'customer' | 'employee' | 'user'; // For display text
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

const ToggleStatusDialog: React.FC<ToggleStatusDialogProps> = ({
  isOpen,
  userName,
  currentStatus,
  userType,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    // Validation
    if (!reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(reason.trim());
      // Reset on success
      setReason('');
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  if (!isOpen) return null;

  const action = currentStatus ? 'Deactivate' : 'Activate';
  const actionLower = currentStatus ? 'deactivate' : 'activate';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-background w-full max-w-md rounded-lg p-6">
        <h2 className="text-lg font-semibold">
          {action} {userType.charAt(0).toUpperCase() + userType.slice(1)}
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Are you sure you want to {actionLower} {userType} <b>{userName}</b>?
        </p>

        {/* Reason Input Field */}
        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={`Please provide a reason for ${actionLower}ing this ${userType}...`}
            rows={3}
            className="focus:border-primary focus:ring-primary w-full rounded border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
            disabled={isSubmitting || isLoading}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting || isLoading}>
            Cancel
          </Button>

          <Button
            className={
              currentStatus ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'
            }
            disabled={isSubmitting || isLoading || !reason.trim()}
            onClick={handleConfirm}
          >
            {isSubmitting || isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : action}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ToggleStatusDialog;
