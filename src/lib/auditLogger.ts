// Vortiq Audit Logger & Removal Notification Harness
// Implements cross-cutting standing conventions for Phase 1 MVP

export interface EntityChangeLog {
  id: string;
  tenant_id: string;
  entity_type: string;
  entity_id: string;
  field_name: string;
  before_value: string;
  after_value: string;
  changed_by: string;
  created_at: string;
}

class AuditLogger {
  private changeLogs: EntityChangeLog[] = [];

  /**
   * Log direct database-level field corrections with before/after traceability.
   */
  logChange(
    tenantId: string,
    entityType: string,
    entityId: string,
    fieldName: string,
    beforeValue: any,
    afterValue: any,
    changedByUserId: string
  ): EntityChangeLog {
    const entry: EntityChangeLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      tenant_id: tenantId,
      entity_type: entityType,
      entity_id: entityId,
      field_name: fieldName,
      before_value: String(beforeValue ?? ''),
      after_value: String(afterValue ?? ''),
      changed_by: changedByUserId,
      created_at: new Date().toISOString(),
    };

    this.changeLogs.unshift(entry);
    console.log(`[AUDIT CHANGE LOG] ${entityType} (${entityId}) field '${fieldName}' modified: '${entry.before_value}' -> '${entry.after_value}' by User (${changedByUserId})`);
    return entry;
  }

  /**
   * Fetch change logs for a specific entity ID (e.g. Lead, Task, Inventory item)
   */
  getLogsForEntity(entityId: string): EntityChangeLog[] {
    return this.changeLogs.filter((log) => log.entity_id === entityId);
  }

  /**
   * Trigger in-app notification to Owner/Admin when any entity is removed.
   */
  notifyOwnerOnRemoval(
    tenantId: string,
    entityType: string,
    entityName: string,
    removedByUserName: string,
    addNotificationCallback?: (notif: { title: string; message: string; type: string }) => void
  ) {
    const title = `Security Alert: ${entityType} Removed`;
    const message = `${entityType} "${entityName}" was permanently removed by ${removedByUserName} on ${new Date().toLocaleString('en-IN')}.`;
    
    console.warn(`[REMOVAL ALERT - Tenant: ${tenantId}] ${title} | ${message}`);

    if (addNotificationCallback) {
      addNotificationCallback({
        title,
        message,
        type: 'warning',
      });
    }
  }
}

export const auditLogger = new AuditLogger();
