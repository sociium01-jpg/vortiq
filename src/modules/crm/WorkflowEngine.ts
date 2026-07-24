// ─────────────────────────────────────────────────────────────
// Vortiq Workflow Automation Engine
// Executes Trigger -> Condition -> Action logic on deal changes
// ─────────────────────────────────────────────────────────────

import { WorkflowRule, CrmLead, LeadStageId } from './types';

export interface WorkflowExecutionResult {
  ruleId: string;
  ruleName: string;
  triggered: boolean;
  actionsExecuted: string[];
}

export function evaluateAndRunWorkflows(
  lead: CrmLead,
  triggerType: 'lead_created' | 'stage_changed' | 'value_threshold' | 'lead_assigned',
  rules: WorkflowRule[],
  context?: { prevStage?: LeadStageId; newStage?: LeadStageId }
): WorkflowExecutionResult[] {
  const results: WorkflowExecutionResult[] = [];

  rules.forEach((rule) => {
    if (!rule.is_active) return;
    if (rule.trigger_type !== triggerType) return;

    let conditionMet = true;

    // Evaluate conditions
    if (rule.trigger_conditions) {
      if (rule.trigger_conditions.stage && context?.newStage !== rule.trigger_conditions.stage) {
        conditionMet = false;
      }
      if (rule.trigger_conditions.min_value && lead.estimated_value < rule.trigger_conditions.min_value) {
        conditionMet = false;
      }
      if (rule.trigger_conditions.source && lead.source !== rule.trigger_conditions.source) {
        conditionMet = false;
      }
    }

    if (conditionMet) {
      const executedActions: string[] = [];

      rule.actions.forEach((act) => {
        if (act.type === 'send_notification') {
          executedActions.push(`Notification Sent: ${act.notification_message || 'Workflow Triggered'}`);
        } else if (act.type === 'create_task') {
          executedActions.push(`Follow-up Task Created: ${act.task_title || 'Review Deal'}`);
        } else if (act.type === 'trigger_webhook') {
          executedActions.push(`Webhook POST dispatched to: ${act.webhook_url || 'https://api.vortiq.biz/webhook'}`);
        } else if (act.type === 'enroll_sequence') {
          executedActions.push(`Enrolled in Cadence Sequence ID: ${act.sequence_id || 'seq-001'}`);
        } else if (act.type === 'update_field') {
          executedActions.push(`Updated Field ${act.target_field} to ${act.field_value}`);
        }
      });

      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        triggered: true,
        actionsExecuted: executedActions,
      });
    }
  });

  return results;
}
