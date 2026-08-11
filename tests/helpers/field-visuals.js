import { expect } from '@playwright/test';
import { setRange } from './runtime.js';

export const fieldVisualScenarios = {
  'astronomy-optics': [
    { state: { aperture: 0.4, wavelength: 750 } },
    { state: { aperture: 2.4, wavelength: 380 } }
  ],
  fluids: [
    { state: { reynolds: 50 }, expect: 'layered, attached streamlines' },
    { state: { reynolds: 1000 }, expect: 'transitional wake begins to grow' },
    { state: { reynolds: 3200 }, expect: 'wake-dominated; real transition still depends on geometry and disturbance' }
  ],
  acoustics: [
    { state: { boundary: 'open-open', mode: 4 }, expect: 'open-open pipe: integer harmonics' },
    { state: { boundary: 'open-closed', mode: 4 }, expect: 'open-closed pipe: odd modes only' }
  ],
  thermodynamics: [
    { state: { hot: 350, cold: 420 }, expect: 'T_h = 350 K, T_c = 345 K' },
    { state: { hot: 900, cold: 120 }, expect: 'Carnot ceiling = 0.867' }
  ],
  electromagnetism: [
    { state: { fluxRate: -1, fieldStrength: 0.4 }, expect: 'induced current direction: clockwise' },
    { state: { fluxRate: 1, fieldStrength: 1.6 }, expect: 'induced current direction: counterclockwise' }
  ],
  statistical: [
    { state: { gap: 0.2, temperature: 2.2 } },
    { state: { gap: 2.4, temperature: 0.2 } }
  ],
  geophysics: [
    { state: { wave: 'P', takeoff: 20 }, expect: 'P wave refracts and continues through the core' },
    { state: { wave: 'S', takeoff: 70 }, expect: 'S wave blocked by the liquid outer core' }
  ],
  'quantum-theory': [
    { state: { frequency: 0.4, intensity: 2.5 }, expect: 'no electrons are emitted, no matter how bright the beam is' },
    { state: { frequency: 1.8, intensity: 0.5 }, expect: 'electrons are emitted; kinetic energy rises with frequency' }
  ],
  nuclear: [
    { state: { mass: 10 }, expect: 'On the light side, moving toward the iron peak raises the average binding energy through fusion.' },
    { state: { mass: 56 }, expect: 'Near the iron peak nuclei are most tightly bound, so neither fusion nor fission yields much extra energy.' },
    { state: { mass: 220 }, expect: 'Very heavy nuclei can release energy by fissioning back toward the iron peak.' }
  ],
  condensed: [
    { state: { gap: 0, filling: 0.6 }, expect: 'overlap or partial filling: metallic response' },
    { state: { gap: 1, filling: 0.85 }, expect: 'finite gap: heat or doping can create carriers' },
    { state: { gap: 2.5, filling: 1 }, expect: 'large gap: very few carriers at room temperature' }
  ],
  particle: [
    { state: { momentum: 0.5, fieldStrength: 1.6, charge: '1' }, expect: 'charge sign = +' },
    { state: { momentum: 3.6, fieldStrength: 0.5, charge: '-1' }, expect: 'charge sign = −' }
  ],
  plasma: [
    { state: { density: 0.4, field: 2.2 } },
    { state: { density: 2.4, field: 0.4 } }
  ],
  biophysics: [
    { state: { ratio: 0.25 } },
    { state: { ratio: 8 } }
  ],
  nonlinear: [
    { state: { r: 2.8 }, expect: 'settles onto a fixed point or short cycle' },
    { state: { r: 3.5 }, expect: 'period-doubling regime' },
    { state: { r: 3.9 }, expect: 'long-term chaotic orbit' }
  ],
  'standard-model': [
    { state: { phase: 'symmetric' }, expect: 'in the high-energy symmetric phase the electroweak fields appear before the low-energy split' },
    { state: { phase: 'broken' }, expect: 'after symmetry breaking, W and Z become massive while the photon stays massless' }
  ],
  'quantum-information': [
    { state: { theta: 0, phi: 0 } },
    { state: { theta: 180, phi: 360 } }
  ],
  'soft-matter': [
    { state: { mode: 'polymer', extension: 1, activity: 0.2 }, expect: 'the restoring force is largely entropic' },
    { state: { mode: 'active', extension: 0.1, activity: 1.8 }, expect: 'ordered motion sustained far from equilibrium' }
  ]
};

export async function applyFieldVisualState(page, state) {
  for (const [key, value] of Object.entries(state)) {
    if (typeof value === 'string') {
      await page.locator(`.field-control-group[data-control-key="${key}"] [data-control-value="${value}"]`).click();
      continue;
    }
    await setRange(page.locator(`#fieldVisualHost input[data-control-key="${key}"]`), String(value));
  }
}

export async function readFieldVisualState(page) {
  return page.evaluate(() => Object.fromEntries(
    [...document.querySelectorAll('#fieldVisualHost .field-control-group[data-control-key]')].map(group => {
      const { controlKey } = group.dataset;
      const range = group.querySelector('input[type="range"]');
      if (range) return [controlKey, Number(range.value)];
      const pressed = group.querySelector('[aria-pressed="true"]');
      return [controlKey, pressed?.dataset.controlValue ?? null];
    })
  ));
}

export async function expectVisualScenario(page, fieldId, scenario) {
  await applyFieldVisualState(page, scenario.state);
  if (scenario.expect) {
    await expect(page.locator('#fieldVisualHost')).toContainText(scenario.expect);
  }
  const status = page.locator('#fieldVisualHost .field-visual-note').last();
  await expect(status).not.toHaveText('');
  return readFieldVisualState(page);
}
