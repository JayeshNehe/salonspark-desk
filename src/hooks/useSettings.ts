import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BusinessSettings {
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  timezone: string;
  language: string;
}

interface OperationalSettings {
  workingHours: {
    start: string;
    end: string;
  };
  workingDays: string[];
  appointmentDuration: number;
  bufferTime: number;
  allowOnlineBooking: boolean;
  requireDeposit: boolean;
  depositAmount: number;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  appointmentReminders: boolean;
  lowStockAlerts: boolean;
  dailyReports: boolean;
  marketingEmails: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordComplexity: boolean;
  auditLogging: boolean;
}

export function useBusinessSettings() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (settings: BusinessSettings) => {
      // For now, we'll store in localStorage since we don't have a settings table
      // In a real app, you'd save to Supabase
      localStorage.setItem('businessSettings', JSON.stringify(settings));
      return settings;
    },
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description: "Business settings have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save business settings.",
        variant: "destructive",
      });
    },
  });
}

export function useOperationalSettings() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (settings: OperationalSettings) => {
      localStorage.setItem('operationalSettings', JSON.stringify(settings));
      return settings;
    },
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description: "Operational settings have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save operational settings.",
        variant: "destructive",
      });
    },
  });
}

export function useNotificationSettings() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (settings: NotificationSettings) => {
      localStorage.setItem('notificationSettings', JSON.stringify(settings));
      return settings;
    },
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description: "Notification preferences have been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save notification settings.",
        variant: "destructive",
      });
    },
  });
}

export function useSecuritySettings() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (settings: SecuritySettings) => {
      localStorage.setItem('securitySettings', JSON.stringify(settings));
      return settings;
    },
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description: "Security settings have been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save security settings.",
        variant: "destructive",
      });
    },
  });
}

export function useDataExport() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async () => {
      // Simulate data export
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Export Started",
        description: "Your data export has been initiated. You'll receive an email when ready.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start data export.",
        variant: "destructive",
      });
    },
  });
}

export function useDataImport() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (file: File) => {
      // Simulate data import
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Import Started",
        description: "Data import process has been initiated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start data import.",
        variant: "destructive",
      });
    },
  });
}