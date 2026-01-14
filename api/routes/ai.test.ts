import { describe, expect, it } from 'vitest';
import { SYSTEM_PROMPT, buildUserPrompt } from './ai';

describe('ai prompt', () => {
  it('system prompt is non-empty and Chinese-oriented', () => {
    expect(SYSTEM_PROMPT.length).toBeGreaterThan(10);
    expect(SYSTEM_PROMPT).toContain('断食');
  });

  it('user prompt contains required JSON keys', () => {
    const prompt = buildUserPrompt('准备开食');
    expect(prompt).toContain('"foodName"');
    expect(prompt).toContain('"calories"');
    expect(prompt).toContain('"tags"');
    expect(prompt).toContain('"advice"');
    expect(prompt).toContain('"nextStep"');
  });
});

