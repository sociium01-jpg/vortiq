import React, { useState } from 'react';
import { Modal, Input, Select, Button } from '@/design-system';
import { NotificationTriggerPayload } from './types';
import { NotificationType, NotificationChannel, UserRole } from '@/types';
import {
  Bell,
  Mail,
  MessageSquare,
  Phone,
  Send,
  Link2,
  FileCode2,
} from 'lucide-react';

export interface NotificationTriggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (payload: NotificationTriggerPayload) => void;
}

export const NotificationTriggerModal: React.FC<NotificationTriggerModalProps> = ({
  isOpen,
  onClose,
  onSend,
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>('info');
  const [selectedChannels, setSelectedChannels] = useState<NotificationChannel[]>(['in_app']);
  const [targetType, setTargetType] = useState<'all' | 'specific_users' | 'role'>('all');
  const [targetRole, setTargetRole] = useState<UserRole>('MEMBER');
  const [link, setLink] = useState('');
  const [actionLabel, setActionLabel] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const channelOptions: { id: NotificationChannel; label: string; icon: React.ReactNode }[] = [
    { id: 'in_app', label: 'In-App Center', icon: <Bell className="w-4 h-4 text-blue-400" /> },
    { id: 'email', label: 'Email Dispatch', icon: <Mail className="w-4 h-4 text-amber-400" /> },
    { id: 'sms', label: 'SMS Alert', icon: <Phone className="w-4 h-4 text-violet-400" /> },
    { id: 'whatsapp', label: 'WhatsApp Bot', icon: <MessageSquare className="w-4 h-4 text-emerald-400" /> },
  ];

  const toggleChannel = (channel: NotificationChannel) => {
    if (selectedChannels.includes(channel)) {
      if (selectedChannels.length > 1) {
        setSelectedChannels(selectedChannels.filter((c) => c !== channel));
      }
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Notification title is required';
    if (!message.trim()) errs.message = 'Notification body content is required';
    if (selectedChannels.length === 0) errs.channels = 'Select at least one notification channel';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onSend({
        title,
        message,
        type,
        channels: selectedChannels,
        targetType,
        targetRole: targetType === 'role' ? targetRole : undefined,
        link: link.trim() || undefined,
        action_label: actionLabel.trim() || undefined,
        templateId: templateId.trim() || undefined,
      });
      setIsSubmitting(false);
      resetForm();
      onClose();
    }, 400);
  };

  const resetForm = () => {
    setTitle('');
    setMessage('');
    setType('info');
    setSelectedChannels(['in_app']);
    setTargetType('all');
    setTargetRole('MEMBER');
    setLink('');
    setActionLabel('');
    setTemplateId('');
    setErrors({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Broadcast Multi-Channel Notification"
      maxWidth="lg"
      footer={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              resetForm();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            leftIcon={<Send className="w-4 h-4" />}
            onClick={handleSubmit}
          >
            Broadcast Now
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <Input
          label="Notification Title"
          placeholder="e.g. System Maintenance Scheduled / Urgent Low Stock Alert"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
        />

        {/* Message Textarea */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">
            Message Body / Content
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your notification message content here..."
            className={`block w-full rounded-lg bg-dark-surface border text-slate-100 placeholder-slate-500 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-colors ${
              errors.message ? 'border-rose-500' : 'border-dark-border'
            }`}
          />
          {errors.message && <p className="text-xs text-rose-400">{errors.message}</p>}
        </div>

        {/* Notification Type & Target Audience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Notification Type"
            value={type}
            onChange={(e) => setType(e.target.value as NotificationType)}
            options={[
              { value: 'info', label: 'Info (System updates)' },
              { value: 'warning', label: 'Warning (Requires attention)' },
              { value: 'success', label: 'Success (Task completed)' },
              { value: 'error', label: 'Error (System failures)' },
              { value: 'task', label: 'Task (Assignment/Review)' },
              { value: 'stock_alert', label: 'Stock Alert (Inventory reorder)' },
            ]}
          />

          <Select
            label="Target Audience"
            value={targetType}
            onChange={(e) => setTargetType(e.target.value as any)}
            options={[
              { value: 'all', label: 'All Team Members' },
              { value: 'role', label: 'Filter by Role' },
              { value: 'specific_users', label: 'Specific User Group' },
            ]}
          />
        </div>

        {targetType === 'role' && (
          <Select
            label="Select Role Target"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value as UserRole)}
            options={[
              { value: 'OWNER', label: 'OWNER level' },
              { value: 'ADMIN', label: 'ADMIN & above' },
              { value: 'MANAGER', label: 'MANAGER & above' },
              { value: 'MEMBER', label: 'MEMBER role' },
            ]}
          />
        )}

        {/* Multi-Channel Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-300">
            Target Delivery Channels (Select Multi)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {channelOptions.map((ch) => {
              const isSelected = selectedChannels.includes(ch.id);
              return (
                <button
                  type="button"
                  key={ch.id}
                  onClick={() => toggleChannel(ch.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-dark-surface border-brand-500 text-slate-100 shadow-md ring-1 ring-brand-500/30'
                      : 'bg-dark-card/40 border-dark-border/60 text-slate-400 hover:text-slate-200 hover:bg-dark-surface/50'
                  }`}
                >
                  {ch.icon}
                  <span className="truncate">{ch.label}</span>
                </button>
              );
            })}
          </div>
          {errors.channels && <p className="text-xs text-rose-400">{errors.channels}</p>}
        </div>

        {/* Optional Template ID for WhatsApp or Email */}
        {(selectedChannels.includes('email') || selectedChannels.includes('whatsapp')) && (
          <Input
            label="Template ID / Campaign Tag (Optional)"
            placeholder="e.g. WAPP_STOCK_ALERT_V1 or EMAIL_WEEKLY_SUMMARY"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            leftIcon={<FileCode2 className="w-4 h-4 text-slate-400" />}
            helperText="Used for WhatsApp Business API HSM templates or SendGrid transactional email templates."
          />
        )}

        {/* Deep Link / Action Link */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Action Link URL (Optional)"
            placeholder="e.g. /modules/inventory or https://app.vortiq.com/tasks/42"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            leftIcon={<Link2 className="w-4 h-4 text-slate-400" />}
          />
          <Input
            label="Action Button Label (Optional)"
            placeholder="e.g. View Task / Inspect Stock"
            value={actionLabel}
            onChange={(e) => setActionLabel(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};
