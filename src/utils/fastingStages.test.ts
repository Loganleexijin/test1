import { describe, expect, it } from 'vitest';
import { getCurrentStage, shouldTriggerFatBurningCue } from './fastingStages';

describe('fastingStages', () => {
  it('returns correct stage by elapsed hours', () => {
    expect(getCurrentStage(0).id).toBe('phase1');
    expect(getCurrentStage(3.99).id).toBe('phase1');
    expect(getCurrentStage(4).id).toBe('phase2');
    expect(getCurrentStage(11.99).id).toBe('phase2');
    expect(getCurrentStage(12).id).toBe('phase3');
    expect(getCurrentStage(17.99).id).toBe('phase3');
    expect(getCurrentStage(18).id).toBe('phase4');
    expect(getCurrentStage(23.99).id).toBe('phase4');
    expect(getCurrentStage(24).id).toBe('phase5');
  });

  it('includes detailed copy for stage modal', () => {
    const phase2 = getCurrentStage(6);
    expect(phase2.id).toBe('phase2');
    expect(typeof phase2.detail).toBe('string');
    expect((phase2.detail || '').length).toBeGreaterThan(0);
    expect(typeof phase2.tip).toBe('string');
    expect((phase2.tip || '').length).toBeGreaterThan(0);
  });

  it('triggers fat burning cue only when crossing 12h', () => {
    expect(shouldTriggerFatBurningCue(0, 0)).toBe(false);
    expect(shouldTriggerFatBurningCue(11 * 3600, 11 * 3600 + 10)).toBe(false);
    expect(shouldTriggerFatBurningCue(11 * 3600 + 59, 12 * 3600)).toBe(true);
    expect(shouldTriggerFatBurningCue(12 * 3600, 12 * 3600 + 1)).toBe(false);
  });
});

