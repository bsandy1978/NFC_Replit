import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { getDeviceId } from '@/lib/device-id';

export interface AutoSaveStatus {
  saving: boolean;
  saved: boolean;
  error: boolean;
  errorMessage?: string;
}

export function useAutoSave<T extends Record<string, any>>(
  form: ReturnType<typeof useForm>,
  options: {
    onSaveSuccess?: (data: any) => void;
    onSaveError?: (error: Error) => void;
    saveDelay?: number;
  } = {}
) {
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialRender = useRef(true);
  
  const {
    onSaveSuccess,
    onSaveError,
    saveDelay = 1500,
  } = options;

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: async (formData: any) => {
      // Add device ID to identify this card across devices
      const deviceId = getDeviceId();
      const payload = { ...formData, deviceId };
      
      const response = await apiRequest('POST', '/api/business-cards/auto-save', payload);
      return await response.json();
    },
    onSuccess: (data) => {
      if (onSaveSuccess) {
        onSaveSuccess(data);
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to save",
        description: error.message || "An error occurred while saving changes",
      });
      
      if (onSaveError) {
        onSaveError(error);
      }
    },
  });

  // Watch form values and auto-save
  useEffect(() => {
    const subscription = form.watch((formData) => {
      // Skip the initial render
      if (initialRender.current) {
        initialRender.current = false;
        return;
      }
      
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set new timeout for auto-save
      timeoutRef.current = setTimeout(() => {
        mutate(formData);
      }, saveDelay);
    });
    
    // Clean up subscription and timeout on unmount
    return () => {
      subscription.unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [form, mutate, saveDelay]);
  
  // Return the auto-save status
  return {
    saving: isPending,
    saved: isSuccess,
    error: isError,
    status: {
      saving: isPending,
      saved: isSuccess,
      error: isError,
    } as AutoSaveStatus,
  };
}
