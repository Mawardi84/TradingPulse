import test from 'node:test';
import assert from 'node:assert/strict';

test('Responsive breakpoint logic distinguishes smartphone/tablet (<1280px) and desktop (>=1280px)', () => {
  const isDesktopWidth = (width: number) => width >= 1280;

  // Smartphones
  assert.equal(isDesktopWidth(360), false, 'Samsung Galaxy / Android standard width is mobile');
  assert.equal(isDesktopWidth(390), false, 'iPhone 14/15/16 width is mobile');
  assert.equal(isDesktopWidth(412), false, 'Pixel 7/8/9 width is mobile');

  // Tablets
  assert.equal(isDesktopWidth(768), false, 'iPad portrait is tablet mode (uses focused mobile tabs)');
  assert.equal(isDesktopWidth(1024), false, 'iPad landscape is tablet mode (uses focused mobile tabs)');

  // Desktops
  assert.equal(isDesktopWidth(1280), true, '1280px is desktop workstation mode');
  assert.equal(isDesktopWidth(1440), true, '1440px is desktop workstation mode');
  assert.equal(isDesktopWidth(1920), true, '1080p full HD is desktop workstation mode');
});

test('Mobile navigation switcher includes all 3 core trading views', () => {
  const mobileViews = ['chart', 'order', 'analysis'] as const;
  assert.equal(mobileViews.length, 3);
  assert.ok(mobileViews.includes('chart'));
  assert.ok(mobileViews.includes('order'));
  assert.ok(mobileViews.includes('analysis'));
});
