import React, { useState } from 'react';
import {
  Drawer,
  Button,
  Badge,
  EmptyState,
  Card,
  Avatar,
} from '@/design-system';
import {
  Bell,
  CheckCheck,
  Mail,
  MessageSquare,
  Phone,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  Clock,
  Layers,
  Send,
  Zap,
} from 'lucide-react';
import { ExtendedNotification } from './types';
import { NotificationType, NotificationChannel } from '@/types';

export interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: ExtendedNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSelectNotification?: (notification: ExtendedNotification) => void;
  onOpenTriggerModal?: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectNotification,
  onOpenTriggerModal,
}) => {
  const [tab, setTab] = useState<'unread' | 'all'>('unread');

  const unreadNotifications = notifications.filter((n) => !n.read);
  const displayedNotifications = tab === 'unread' ? unreadNotifications : notifications;

  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case 'in_app':
        return <Bell className="w-3.5 h-3.5 text-blue-400" />;
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-amber-400" />;
      case 'sms':
        return <Phone className="w-3.5 h-3.5 text-violet-400" />;
      case 'whatsapp':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getChannelBadgeVariant = (channel: NotificationChannel) => {
    switch (channel) {
      case 'in_app':
        return 'blue';
      case 'email':
        return 'amber';
      case 'sms':
        return 'violet';
      case 'whatsapp':
        return 'emerald';
      default:
        return 'slate';
    }
  };

  const getTypeBadgeVariant = (type: NotificationType) => {
    switch (type) {
      case 'info':
        return 'slate';
      case 'warning':
        return 'amber';
      case 'success':
        return 'emerald';
      case 'error':
        return 'rose';
      case 'task':
        return 'violet';
      case 'stock_alert':
        return 'rose';
      default:
        return 'blue';
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'info':
        return <Info className="w-3.5 h-3.5 text-slate-400" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'error':
        return <XCircle className="w-3.5 h-3.5 text-rose-400" />;
      case 'task':
        return <Layers className="w-3.5 h-3.5 text-violet-400" />;
      case 'stock_alert':
        return <Zap className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const formatRelativeTime = (isoString: string) => {
    const diffMs = new Date().getTime() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Notification Center"
      side="right"
      width="lg"
    >
      {/* Top Drawer Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-dark-border/60 pb-3">
          <div className="flex items-center gap-1.5 p-1 bg-dark-surface rounded-lg border border-dark-border/60">
            <button
              onClick={() => setTab('unread')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                tab === 'unread'
                  ? 'bg-brand-500 text-dark-bg font-semibold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unread ({unreadNotifications.length})
            </button>
            <button
              onClick={() => setTab('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                tab === 'all'
                  ? 'bg-brand-500 text-dark-bg font-semibold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({notifications.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
              onClick={onMarkAllAsRead}
              disabled={unreadNotifications.length === 0}
            >
              Mark All Read
            </Button>
            {onOpenTriggerModal && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Send className="w-3.5 h-3.5" />}
                onClick={onOpenTriggerModal}
              >
                Broadcast
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {displayedNotifications.length === 0 ? (
          <div className="py-8">
            <EmptyState
              title={tab === 'unread' ? 'All Caught Up!' : 'No Notifications'}
              description={
                tab === 'unread'
                  ? 'You have zero unread notifications in your inbox.'
                  : 'There are no notification logs recorded yet.'
              }
              icon={<Bell className="w-10 h-10 text-brand-400 opacity-60" />}
              action={
                tab === 'unread' ? (
                  <Button variant="outline" size="sm" onClick={() => setTab('all')}>
                    View Past Activity
                  </Button>
                ) : onOpenTriggerModal ? (
                  <Button variant="primary" size="sm" leftIcon={<Send className="w-3.5 h-3.5" />} onClick={onOpenTriggerModal}>
                    Send First Notification
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="space-y-3">
            {displayedNotifications.map((notification) => (
              <Card
                key={notification.id}
                hoverable
                className={`relative transition-all border ${
                  !notification.read
                    ? 'bg-dark-surface/90 border-brand-500/40 shadow-brand-500/5'
                    : 'bg-dark-card/60 border-dark-border/60 opacity-85'
                }`}
                onClick={() => {
                  if (!notification.read) onMarkAsRead(notification.id);
                  if (onSelectNotification) onSelectNotification(notification);
                }}
              >
                {/* Unread indicator pill */}
                {!notification.read && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-brand-400 animate-ping" />
                )}

                <div className="flex items-start gap-3">
                  <Avatar
                    name={notification.metadata?.sender_name || 'System'}
                    size="sm"
                    className="mt-0.5"
                  />

                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between gap-2 pr-4">
                      <h4 className="text-xs font-semibold text-slate-100 truncate">
                        {notification.title}
                      </h4>
                      <span className="text-2xs text-slate-400 shrink-0 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {formatRelativeTime(notification.created_at)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {notification.message}
                    </p>

                    {/* Metadata & Tag Badges */}
                    <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Badge variant={getChannelBadgeVariant(notification.channel)} size="sm">
                          <span className="flex items-center gap-1">
                            {getChannelIcon(notification.channel)}
                            {notification.channel.toUpperCase().replace('_', ' ')}
                          </span>
                        </Badge>

                        <Badge variant={getTypeBadgeVariant(notification.type)} size="sm">
                          <span className="flex items-center gap-1">
                            {getTypeIcon(notification.type)}
                            {notification.type}
                          </span>
                        </Badge>

                        {notification.metadata?.delivery_status && (
                          <span className="text-2xs font-mono text-slate-400 capitalize">
                            • {notification.metadata.delivery_status}
                          </span>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkAsRead(notification.id);
                            }}
                            className="text-2xs font-medium text-brand-400 hover:text-brand-300 underline"
                          >
                            Mark Read
                          </button>
                        )}
                        {notification.link && (
                          <a
                            href={notification.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-2xs text-slate-400 hover:text-slate-100 font-medium"
                          >
                            {notification.action_label || 'View'}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
};
