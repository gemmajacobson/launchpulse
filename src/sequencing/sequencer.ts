import { addDays, formatISO, parseISO } from 'date-fns';
import type { ScoredLead, Sequence, SequenceStep } from '../lib/types.js';

export interface ScheduledTouch {
  leadId: string;
  sequenceId: string;
  channel: SequenceStep['channel'];
  template: string;
  sendAt: string;
}

/** Grade-based routing: hot leads get the high-touch sequence, cooler leads get nurture. */
export function routeToSequence(lead: ScoredLead, sequences: Sequence[]): Sequence | null {
  const active = sequences.filter((s) => s.active);
  if (active.length === 0) return null;

  const wanted = lead.grade === 'A' || lead.grade === 'B' ? 'high-intent' : 'nurture';
  return active.find((s) => s.audience === wanted) ?? active[0];
}

export function scheduleSequence(
  lead: ScoredLead,
  sequence: Sequence,
  startDate: Date,
): ScheduledTouch[] {
  return sequence.steps.map((step) => ({
    leadId: lead.id,
    sequenceId: sequence.id,
    channel: step.channel,
    template: step.template,
    sendAt: formatISO(addDays(startDate, step.dayOffset)),
  }));
}

/** Suppress touches that would land within quiet hours or too close to a prior reply. */
export function suppressRecentRepliers(
  touches: ScheduledTouch[],
  lastReplyAt: Map<string, string>,
  cooldownDays = 5,
): ScheduledTouch[] {
  return touches.filter((touch) => {
    const reply = lastReplyAt.get(touch.leadId);
    if (!reply) return true;
    const gapMs = parseISO(touch.sendAt).getTime() - parseISO(reply).getTime();
    return gapMs > cooldownDays * 24 * 60 * 60 * 1000;
  });
}
