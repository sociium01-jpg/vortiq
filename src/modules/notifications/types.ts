import { AppNotification, NotificationType, NotificationChannel, UserRole } from '@/types';

export type DeliveryStatus = 'pending' | 'delivered' | 'failed' | 'read';

export interface NotificationMetadata {
  sender_name?: string;
  recipient_email?: string;
  recipient_phone?: string;
  whatsapp_template_id?: string;
  email_subject?: string;
  delivery_status?: DeliveryStatus;
  delivery_timestamp?: string;
  error_message?: string;
  entity_id?: string;
  entity_type?: 'lead' | 'task' | 'inventory' | 'subscription' | 'system';
}

export interface ExtendedNotification extends AppNotification {
  metadata?: NotificationMetadata;
  recipient_name?: string;
  action_label?: string;
}

export interface NotificationFilterState {
  channel: 'all' | NotificationChannel;
  type: 'all' | NotificationType;
  readStatus: 'all' | 'unread' | 'read';
  searchTerm: string;
}

export interface NotificationTriggerPayload {
  title: string;
  message: string;
  type: NotificationType;
  channels: NotificationChannel[];
  targetType: 'all' | 'specific_users' | 'role';
  targetRole?: UserRole;
  targetUserIds?: string[];
  link?: string;
  action_label?: string;
  templateId?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  inAppCount: number;
  emailCount: number;
  smsCount: number;
  whatsappCount: number;
  deliverySuccessRate: number;
}
