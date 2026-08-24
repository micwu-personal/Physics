(() => {
  'use strict';

  const DEG = Math.PI / 180;
  const RAD = 180 / Math.PI;
  const DAYS = 365;
  const SUN_RADIUS_KM = 696340;
  const EARTH_RADIUS_KM = 6371;
  const MOON_RADIUS_KM = 1737.4;
  const SUN_EARTH_KM = 149597870.7;
  const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const MONTHS = {
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    'zh-CN': ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  };

  const state = {
    mode: 'seasons',
    day: 171,
    latitude: 39.9,
    hour: 12,
    eclipseType: 'solar',
    moonDistance: 370000,
    sunDistance: SUN_EARTH_KM,
    alignment: 0,
    observer: 0,
    playing: null
  };

  const canvases = new Map();
  let frame = 0;
  let lastTime = 0;

  const $ = id => {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Missing orbital-lab element: ${id}`);
    return element;
  };
  const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
  const mix = (start, end, amount) => start + (end - start) * amount;
  const normalizeDay = day => ((day % DAYS) + DAYS) % DAYS;
  const normalizeHour = hour => ((hour % 24) + 24) % 24;
  const zh = () => window.PhysicsUI.language === 'zh-CN';
  const t = (en, chinese) => zh() ? chinese : en;
  const fixed = (value, digits = 1) => Number(value).toFixed(digits);

  function setupCanvas(id) {
    const canvas = $(id);
    const scene = { canvas, context: canvas.getContext('2d'), width: 0, height: 0 };
    canvases.set(id, scene);
    return scene;
  }

  const systemScene = setupCanvas('systemCanvas');
  const observerScene = setupCanvas('observerCanvas');
  const seasonScene = setupCanvas('seasonCanvas');
  const horizonScene = setupCanvas('horizonCanvas');
  const annualScene = setupCanvas('annualCanvas');
  const canvasMuted = getComputedStyle(document.documentElement).getPropertyValue('--muted').trim();

  function resizeCanvas(scene) {
    const rect = scene.canvas.getBoundingClientRect();
    const ratio = clamp(window.devicePixelRatio, 1, 2);
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    if (scene.width === width && scene.height === height) return;
    scene.width = width;
    scene.height = height;
    scene.canvas.width = Math.round(width * ratio);
    scene.canvas.height = Math.round(height * ratio);
    scene.context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function clear(scene, color = '#050816') {
    resizeCanvas(scene);
    scene.context.clearRect(0, 0, scene.width, scene.height);
    scene.context.fillStyle = color;
    scene.context.fillRect(0, 0, scene.width, scene.height);
  }

  function line(context, x1, y1, x2, y2, color, width = 1, dash = []) {
    context.save();
    context.strokeStyle = color;
    context.lineWidth = width;
    context.setLineDash(dash);
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.restore();
  }

  function circle(context, x, y, radius, fill, stroke = '', width = 1) {
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    if (fill) {
      context.fillStyle = fill;
      context.fill();
    }
    if (stroke) {
      context.strokeStyle = stroke;
      context.lineWidth = width;
      context.stroke();
    }
  }

  function label(context, text, x, y, color = canvasMuted, size = 11, align = 'left') {
    context.fillStyle = color;
    context.font = `600 ${size}px "JetBrains Mono", ui-monospace, monospace`;
    context.textAlign = align;
    context.textBaseline = 'middle';
    context.fillText(text, x, y);
  }

  function fillPolygon(context, points, fill) {
    context.fillStyle = fill;
    context.beginPath();
    points.forEach(([x, y], index) => {
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.closePath();
    context.fill();
  }

  function dateParts(day) {
    let remaining = Math.floor(((day % DAYS) + DAYS) % DAYS);
    let month = 0;
    while (month < MONTH_DAYS.length - 1 && remaining >= MONTH_DAYS[month]) {
      remaining -= MONTH_DAYS[month];
      month += 1;
    }
    return { month, date: remaining + 1 };
  }

  function dateLabel(day) {
    const { month, date } = dateParts(day);
    return zh() ? `${MONTHS['zh-CN'][month]}${date}日` : `${date} ${MONTHS.en[month]}`;
  }

  function formatClock(hour) {
    let minutes = Math.round((((hour % 24) + 24) % 24) * 60);
    if (minutes === 1440) minutes = 0;
    return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
  }

  function formatDuration(hours) {
    if (hours <= 0.001) return t('0 h', '0小时');
    if (hours >= 23.999) return t('24 h', '24小时');
    const minutes = Math.round(hours * 60);
    const whole = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return t(`${whole} h ${String(rest).padStart(2, '0')} min`, `${whole}时${String(rest).padStart(2, '0')}分`);
  }

  function solarDeclination(day) {
    const gamma = 2 * Math.PI * (((day % DAYS) + DAYS) % DAYS) / DAYS;
    return RAD * (
      0.006918
      - 0.399912 * Math.cos(gamma)
      + 0.070257 * Math.sin(gamma)
      - 0.006758 * Math.cos(2 * gamma)
      + 0.000907 * Math.sin(2 * gamma)
      - 0.002697 * Math.cos(3 * gamma)
      + 0.00148 * Math.sin(3 * gamma)
    );
  }

  function solarPosition(day, latitude, hour) {
    const phi = clamp(latitude, -90, 90) * DEG;
    const declination = solarDeclination(day) * DEG;
    const hourAngle = (15 * ((((hour % 24) + 24) % 24) - 12)) * DEG;
    const sinAltitude = clamp(
      Math.sin(phi) * Math.sin(declination)
        + Math.cos(phi) * Math.cos(declination) * Math.cos(hourAngle),
      -1,
      1
    );
    const altitude = Math.asin(sinAltitude) * RAD;
    const rawAzimuth = Math.atan2(
      Math.sin(hourAngle),
      Math.cos(hourAngle) * Math.sin(phi) - Math.tan(declination) * Math.cos(phi)
    ) * RAD;
    return {
      altitude,
      azimuth: (rawAzimuth + 180 + 360) % 360,
      declination: declination * RAD
    };
  }

  function daylightInfo(day, latitude) {
    const phi = clamp(latitude, -89.999, 89.999) * DEG;
    const declination = solarDeclination(day) * DEG;
    const standardSunriseAltitude = -0.833 * DEG;
    const cosine = (
      Math.sin(standardSunriseAltitude) - Math.sin(phi) * Math.sin(declination)
    ) / (Math.cos(phi) * Math.cos(declination));
    if (cosine <= -1) return { kind: 'polar-day', hours: 24, sunrise: null, sunset: null };
    if (cosine >= 1) return { kind: 'polar-night', hours: 0, sunrise: null, sunset: null };
    const hourAngle = Math.acos(clamp(cosine, -1, 1)) * RAD;
    const hours = 2 * hourAngle / 15;
    return { kind: 'normal', hours, sunrise: 12 - hours / 2, sunset: 12 + hours / 2 };
  }

  function seasonInfo(day, latitude) {
    if (Math.abs(latitude) < 10) {
      return {
        badge: t('Equatorial zone · weak contrast', '赤道区域 · 季节差异较弱'),
        title: t('Weak astronomical seasons', '天文季节差异较弱'),
        explanation: t(
          'Day length changes little near the equator. Seasonal rainfall and temperature there depend strongly on circulation, elevation, oceans, and local climate—not only solar geometry.',
          '赤道附近的昼长变化较小；当地雨季与温度还强烈取决于环流、海拔、海洋与局地气候，而不只由太阳几何决定。'
        )
      };
    }
    const north = day < 79 || day >= 355 ? 'winter'
      : day < 171 ? 'spring'
        : day < 265 ? 'summer' : 'autumn';
    const opposite = { winter: 'summer', spring: 'autumn', summer: 'winter', autumn: 'spring' };
    const season = latitude >= 0 ? north : opposite[north];
    const names = {
      winter: t('winter', '冬季'),
      spring: t('spring', '春季'),
      summer: t('summer', '夏季'),
      autumn: t('autumn', '秋季')
    };
    const hemisphere = latitude >= 0 ? t('Northern Hemisphere', '北半球') : t('Southern Hemisphere', '南半球');
    const warm = season === 'summer' || season === 'spring';
    return {
      badge: t(`${hemisphere} · ${names[season]}`, `${hemisphere} · ${names[season]}`),
      title: names[season].charAt(0).toUpperCase() + names[season].slice(1),
      explanation: warm
        ? t(
          `${hemisphere} is tilted more sunward: average solar altitude is higher, sunlight is less oblique, and daylight tends to be longer.`,
          `${hemisphere}较朝向太阳，太阳平均高度较高，太阳光更集中，白昼也倾向更长。`
        )
        : t(
          `${hemisphere} is tilted more away from the Sun: average solar altitude is lower, sunlight is more oblique, and daylight tends to be shorter.`,
          `${hemisphere}较背向太阳，太阳平均高度较低，太阳光更倾斜，白昼也倾向更短。`
        )
    };
  }

  function seasonName(day, latitude) {
    return seasonInfo(day, latitude).badge;
  }

  function azimuthName(azimuth) {
    const names = zh()
      ? ['北', '东北', '东', '东南', '南', '西南', '西', '西北']
      : ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return names[Math.round(azimuth / 45) % 8];
  }

  function latitudeLabel(latitude) {
    if (Math.abs(latitude) < 0.05) return t('Equator', '赤道');
    return `${fixed(Math.abs(latitude))}° ${latitude > 0 ? 'N' : 'S'}`;
  }

  function signedDegrees(value) {
    return `${value >= 0 ? '+' : ''}${fixed(value)}°`;
  }

  function declinationDescription(declination) {
    if (Math.abs(declination) < 0.05) {
      return t('Subsolar point on the equator', '太阳直射点位于赤道');
    }
    return t(
      `Subsolar point at ${fixed(Math.abs(declination))}° ${declination > 0 ? 'N' : 'S'}`,
      `太阳直射点位于${declination > 0 ? '北' : '南'}纬 ${fixed(Math.abs(declination))}°`
    );
  }

  function eclipseGeometry() {
    const moonDistance = state.moonDistance;
    const sunMoonDistance = state.sunDistance - moonDistance;
    const sunAngularRadius = Math.atan(SUN_RADIUS_KM / state.sunDistance) * RAD;
    const moonAngularRadius = Math.atan(MOON_RADIUS_KM / moonDistance) * RAD;
    const umbraLength = MOON_RADIUS_KM * sunMoonDistance / (SUN_RADIUS_KM - MOON_RADIUS_KM);
    const signedCentralShadowRadius = MOON_RADIUS_KM
      - ((SUN_RADIUS_KM - MOON_RADIUS_KM) * moonDistance / sunMoonDistance);
    const penumbraRadius = MOON_RADIUS_KM
      + ((SUN_RADIUS_KM + MOON_RADIUS_KM) * moonDistance / sunMoonDistance);
    const axisOffsetKm = state.alignment * EARTH_RADIUS_KM;
    const observerKm = state.observer * EARTH_RADIUS_KM;
    const localSeparation = Math.abs(observerKm - axisOffsetKm) / moonDistance * RAD;
    const globalSolar = Math.abs(axisOffsetKm) <= EARTH_RADIUS_KM + penumbraRadius;
    const lunarUmbraRadius = EARTH_RADIUS_KM
      - ((SUN_RADIUS_KM - EARTH_RADIUS_KM) * moonDistance / state.sunDistance);
    const lunarPenumbraRadius = EARTH_RADIUS_KM
      + ((SUN_RADIUS_KM + EARTH_RADIUS_KM) * moonDistance / state.sunDistance);
    const lunarSeparationKm = Math.abs(state.alignment) * (EARTH_RADIUS_KM + MOON_RADIUS_KM);

    let classification = 'none';
    if (state.eclipseType === 'solar' && globalSolar) {
      if (localSeparation < Math.abs(moonAngularRadius - sunAngularRadius)) {
        classification = moonAngularRadius >= sunAngularRadius ? 'total' : 'annular';
      } else if (localSeparation < moonAngularRadius + sunAngularRadius) {
        classification = 'partial';
      }
    }
    if (state.eclipseType === 'lunar') {
      if (lunarSeparationKm + MOON_RADIUS_KM <= lunarUmbraRadius) classification = 'total-lunar';
      else if (lunarSeparationKm - MOON_RADIUS_KM < lunarUmbraRadius) classification = 'partial-lunar';
      else if (lunarSeparationKm - MOON_RADIUS_KM < lunarPenumbraRadius) classification = 'penumbral-lunar';
    }

    return {
      axisOffsetKm,
      classification,
      globalSolar,
      localSeparation,
      lunarSeparationKm,
      lunarPenumbraRadius,
      lunarUmbraRadius,
      moonAngularRadius,
      penumbraRadius,
      signedCentralShadowRadius,
      sunAngularRadius,
      umbraLength
    };
  }

  function classificationName(classification) {
    const names = {
      none: t('No eclipse at this observer', '该观察者处无食'),
      partial: t('Partial solar eclipse', '日偏食'),
      total: t('Total solar eclipse', '日全食'),
      annular: t('Annular solar eclipse', '日环食'),
      'total-lunar': t('Total lunar eclipse', '月全食'),
      'partial-lunar': t('Partial lunar eclipse', '月偏食'),
      'penumbral-lunar': t('Penumbral lunar eclipse', '半影月食')
    };
    return names[classification];
  }

  function drawStarField(context, width, height) {
    context.fillStyle = 'rgba(238,242,255,.45)';
    for (let index = 0; index < 56; index += 1) {
      const x = (index * 83.17) % width;
      const y = (index * index * 17.31 + 11) % height;
      context.fillRect(x, y, index % 9 === 0 ? 1.5 : 1, index % 9 === 0 ? 1.5 : 1);
    }
  }

  function drawSun(context, x, y, radius) {
    const glow = context.createRadialGradient(x, y, radius * 0.2, x, y, radius * 2.2);
    glow.addColorStop(0, 'rgba(255,244,173,.95)');
    glow.addColorStop(0.45, 'rgba(255,209,102,.7)');
    glow.addColorStop(1, 'rgba(255,209,102,0)');
    circle(context, x, y, radius * 2.2, glow);
    circle(context, x, y, radius, '#ffd166');
  }

  function drawEarth(context, x, y, radius, toSun, rotation = 0) {
    context.save();
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.clip();

    const ocean = context.createRadialGradient(
      x - radius * 0.34,
      y - radius * 0.38,
      radius * 0.08,
      x,
      y,
      radius * 1.2
    );
    ocean.addColorStop(0, '#b8ecff');
    ocean.addColorStop(0.24, '#49a7ff');
    ocean.addColorStop(0.72, '#1767a8');
    ocean.addColorStop(1, '#0b285e');
    context.fillStyle = ocean;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);

    context.save();
    context.translate(x, y);
    context.rotate(rotation);
    context.fillStyle = '#7ee8c5';
    context.beginPath();
    context.moveTo(-radius * 0.68, -radius * 0.24);
    context.bezierCurveTo(-radius * 0.5, -radius * 0.72, -radius * 0.08, -radius * 0.68, radius * 0.02, -radius * 0.3);
    context.bezierCurveTo(radius * 0.18, -radius * 0.06, -radius * 0.12, radius * 0.06, -radius * 0.22, radius * 0.4);
    context.bezierCurveTo(-radius * 0.5, radius * 0.38, -radius * 0.66, radius * 0.1, -radius * 0.68, -radius * 0.24);
    context.fill();
    context.beginPath();
    context.moveTo(radius * 0.12, -radius * 0.48);
    context.bezierCurveTo(radius * 0.38, -radius * 0.62, radius * 0.72, -radius * 0.32, radius * 0.64, -radius * 0.02);
    context.bezierCurveTo(radius * 0.56, radius * 0.28, radius * 0.25, radius * 0.12, radius * 0.18, radius * 0.48);
    context.bezierCurveTo(-radius * 0.02, radius * 0.25, -radius * 0.04, -radius * 0.2, radius * 0.12, -radius * 0.48);
    context.fill();
    context.restore();

    context.save();
    context.translate(x, y);
    context.rotate(toSun);
    context.fillStyle = 'rgba(3,8,24,.72)';
    context.fillRect(-radius, -radius, radius, radius * 2);
    context.restore();

    context.strokeStyle = 'rgba(238,242,255,.42)';
    context.lineWidth = Math.max(1, radius * 0.055);
    context.beginPath();
    context.arc(x - radius * 0.16, y - radius * 0.12, radius * 0.72, -1.55, 0.2);
    context.stroke();
    context.beginPath();
    context.arc(x + radius * 0.12, y + radius * 0.3, radius * 0.62, 1.2, 3.05);
    context.stroke();
    context.restore();
    circle(context, x, y, radius, '', 'rgba(238,242,255,.62)', 1.2);
  }

  function drawSeasonSystem() {
    clear(systemScene);
    const { context, width, height } = systemScene;
    drawStarField(context, width, height);
    const cx = width * 0.47;
    const cy = height * 0.45;
    const rx = Math.max(105, Math.min(width * 0.37, width * 0.43));
    const ry = Math.max(52, height * 0.2);
    const angle = 2 * Math.PI * (state.day - 171) / DAYS;
    const earthX = cx + rx * Math.cos(angle);
    const earthY = cy + ry * Math.sin(angle);
    const earthRadius = clamp(Math.min(width, height) * 0.052, 16, 29);
    systemScene.orbit = { cx, cy, rx, ry };

    context.strokeStyle = 'rgba(0,212,255,.28)';
    context.lineWidth = 1.5;
    context.setLineDash([5, 7]);
    context.beginPath();
    context.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    context.stroke();
    context.setLineDash([]);

    drawSun(context, cx, cy, clamp(Math.min(width, height) * 0.055, 20, 34));
    line(context, cx, cy, earthX, earthY, 'rgba(255,209,102,.34)', 1.5, [4, 5]);

    const toSun = Math.atan2(cy - earthY, cx - earthX);
    drawEarth(context, earthX, earthY, earthRadius, toSun, (state.hour - 12) * 15 * DEG);

    const tilt = -23.44 * DEG;
    const axisDx = Math.sin(tilt) * earthRadius * 1.75;
    const axisDy = Math.cos(tilt) * earthRadius * 1.75;
    line(context, earthX - axisDx, earthY + axisDy, earthX + axisDx, earthY - axisDy, '#00d4ff', 2);
    label(context, 'N', earthX + axisDx + 3, earthY - axisDy, '#00d4ff', 10);

    const observerAngle = (state.latitude - 90) * DEG;
    const observerX = earthX + Math.cos(observerAngle + tilt) * earthRadius;
    const observerY = earthY + Math.sin(observerAngle + tilt) * earthRadius;
    circle(context, observerX, observerY, 4.5, '#ff6b9d', '#eef2ff', 1);

    const moonAngle = 2 * Math.PI * (state.day + state.hour / 24) / 27.321661;
    const moonOrbit = earthRadius * 2.05;
    context.strokeStyle = 'rgba(238,242,255,.2)';
    context.beginPath();
    context.ellipse(earthX, earthY, moonOrbit, moonOrbit * 0.42, 0, 0, Math.PI * 2);
    context.stroke();
    circle(
      context,
      earthX + Math.cos(moonAngle) * moonOrbit,
      earthY + Math.sin(moonAngle) * moonOrbit * 0.42,
      Math.max(3.5, earthRadius * 0.22),
      '#d8deea'
    );

    label(context, t('Sun', '太阳'), cx, cy + 49, '#ffd166', 11, 'center');
    label(context, t('Selected place', '所选地点'), observerX + 10, observerY - 10, '#ff9abb', 9);

    const stripY = height - 44;
    line(context, 24, stripY, width - 24, stripY, 'rgba(238,242,255,.2)');
    const markers = [
      [79, t('Mar equinox', '春分')],
      [171, t('Jun solstice', '夏至')],
      [265, t('Sep equinox', '秋分')],
      [355, t('Dec solstice', '冬至')]
    ];
    for (const [day, text] of markers) {
      const x = 24 + day / 364 * (width - 48);
      line(context, x, stripY - 5, x, stripY + 5, '#aeb8d8');
      label(context, text, x, stripY + 18, '#aeb8d8', 8, 'center');
    }
    const currentX = 24 + state.day / 364 * (width - 48);
    circle(context, currentX, stripY, 5, '#ffd166');
    label(context, t('viewed from north of the ecliptic', '从黄道北侧观察'), 16, 18, '#eef2ff', 10);
  }

  function drawSkyDome() {
    clear(observerScene, '#07101f');
    const { context, width, height } = observerScene;
    const cx = width / 2;
    const cy = height * 0.5;
    const radius = Math.min(width * 0.43, height * 0.4);
    const sky = context.createRadialGradient(cx, cy, radius * 0.05, cx, cy, radius);
    sky.addColorStop(0, '#1b3f71');
    sky.addColorStop(0.75, '#10284e');
    sky.addColorStop(1, '#111827');
    circle(context, cx, cy, radius, sky, 'rgba(238,242,255,.38)', 1.2);

    for (const altitude of [30, 60]) {
      const r = radius * (1 - altitude / 90);
      circle(context, cx, cy, r, '', 'rgba(238,242,255,.13)');
      label(context, `${altitude}°`, cx + 5, cy - r + 10, '#8190b2', 8);
    }
    line(context, cx - radius, cy, cx + radius, cy, 'rgba(238,242,255,.12)');
    line(context, cx, cy - radius, cx, cy + radius, 'rgba(238,242,255,.12)');
    label(context, t('N', '北'), cx, cy - radius - 10, '#eef2ff', 10, 'center');
    label(context, t('E', '东'), cx + radius + 10, cy, '#eef2ff', 10, 'center');
    label(context, t('S', '南'), cx, cy + radius + 12, '#eef2ff', 10, 'center');
    label(context, t('W', '西'), cx - radius - 10, cy, '#eef2ff', 10, 'center');

    const samples = [];
    for (let hour = 0; hour <= 24; hour += 0.1) {
      const position = solarPosition(state.day, state.latitude, hour);
      if (position.altitude < 0) {
        samples.push(null);
        continue;
      }
      const r = radius * (1 - position.altitude / 90);
      const angle = (position.azimuth - 90) * DEG;
      samples.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
    }

    context.strokeStyle = '#ffd166';
    context.lineWidth = 2.5;
    context.beginPath();
    let active = false;
    for (const point of samples) {
      if (!point) {
        active = false;
        continue;
      }
      if (!active) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
      active = true;
    }
    context.stroke();

    const current = solarPosition(state.day, state.latitude, state.hour);
    const currentRadius = radius * (1 - clamp(current.altitude, 0, 90) / 90);
    const currentAngle = (current.azimuth - 90) * DEG;
    const sunX = cx + Math.cos(currentAngle) * currentRadius;
    const sunY = cy + Math.sin(currentAngle) * currentRadius;
    if (current.altitude >= 0) {
      drawSun(context, sunX, sunY, 7);
      line(context, cx, cy, sunX, sunY, 'rgba(0,212,255,.5)', 1, [3, 4]);
    } else {
      label(context, t('Sun below horizon', '太阳位于地平线下'), cx, cy, '#aeb8d8', 11, 'center');
    }
    label(context, t('zenith', '天顶'), cx, cy + 12, '#aeb8d8', 8, 'center');
  }

  function drawPolyline(context, points, color, width = 2, dash = []) {
    context.save();
    context.strokeStyle = color;
    context.lineWidth = width;
    context.setLineDash(dash);
    context.beginPath();
    points.forEach((point, index) => {
      if (index === 0) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    });
    context.stroke();
    context.restore();
  }

  function drawSeasonProfile() {
    clear(seasonScene);
    const { context, width, height } = seasonScene;
    drawStarField(context, width, height);
    const earthX = width * 0.36;
    const earthY = height * 0.5;
    const earthRadius = clamp(Math.min(width, height) * 0.25, 42, 68);
    const tilt = -23.44 * DEG;
    const declination = solarDeclination(state.day);

    for (let offset = -2; offset <= 2; offset += 1) {
      const y = earthY + offset * earthRadius * 0.38;
      line(context, width * 0.62, y, width * 0.96, y, 'rgba(255,209,102,.72)', 1.5);
    }
    drawEarth(context, earthX, earthY, earthRadius, 0, (state.hour - 12) * 15 * DEG);

    const axisDx = Math.sin(tilt) * earthRadius * 1.55;
    const axisDy = Math.cos(tilt) * earthRadius * 1.55;
    line(context, earthX - axisDx, earthY + axisDy, earthX + axisDx, earthY - axisDy, '#00d4ff', 2.5);
    const equatorDx = Math.cos(tilt) * earthRadius * 1.12;
    const equatorDy = Math.sin(tilt) * earthRadius * 1.12;
    line(context, earthX - equatorDx, earthY - equatorDy, earthX + equatorDx, earthY + equatorDy, 'rgba(238,242,255,.45)');

    const subsolarY = earthY - Math.sin(declination * DEG) * earthRadius * 0.84;
    circle(context, earthX + earthRadius * 0.84, subsolarY, 4.5, '#ffd166', '#eef2ff');
    label(context, t('North axis', '北极方向'), earthX + axisDx + 7, earthY - axisDy, '#00d4ff', 9);
    label(context, t('sunlight', '太阳光'), width * 0.79, earthY - earthRadius * 0.92, '#ffd166', 9, 'center');
    label(context, signedDegrees(declination), earthX + earthRadius + 12, subsolarY + 14, '#ffd166', 9);
    label(context, t('23.44° axial tilt', '地轴倾角 23.44°'), 14, height - 16, '#aeb8d8', 9);
  }

  function drawHorizonPath() {
    clear(horizonScene, '#07101f');
    const { context, width, height } = horizonScene;
    const horizonY = height * 0.67;
    const left = 48;
    const right = width - 24;
    const sky = context.createLinearGradient(0, 0, 0, horizonY);
    sky.addColorStop(0, '#10284e');
    sky.addColorStop(0.72, '#24476b');
    sky.addColorStop(1, '#a75f45');
    context.fillStyle = sky;
    context.fillRect(0, 0, width, horizonY);
    context.fillStyle = '#0b1718';
    context.fillRect(0, horizonY, width, height - horizonY);

    const mapPoint = (hour, altitude) => ({
      x: left + hour / 24 * (right - left),
      y: altitude >= 0
        ? horizonY - altitude / 90 * (horizonY - 34)
        : horizonY + Math.abs(altitude) / 90 * (height - horizonY - 28)
    });
    for (const altitude of [0, 45, 90]) {
      const point = mapPoint(0, altitude);
      line(context, left, point.y, right, point.y, altitude === 0 ? 'rgba(238,242,255,.5)' : 'rgba(238,242,255,.13)');
      label(context, `${altitude}°`, 10, point.y, '#aeb8d8', 9);
    }
    for (const hour of [0, 6, 12, 18, 24]) {
      const x = mapPoint(hour, 0).x;
      line(context, x, 20, x, height - 24, 'rgba(238,242,255,.08)');
      label(context, formatClock(hour), x, height - 13, '#aeb8d8', 9, 'center');
    }

    const samples = [];
    for (let hour = 0; hour <= 24.001; hour += 0.2) {
      const position = solarPosition(state.day, state.latitude, hour);
      samples.push({ ...mapPoint(hour, position.altitude), altitude: position.altitude });
    }
    const drawSegments = (visible, color, dash) => {
      context.save();
      context.strokeStyle = color;
      context.lineWidth = visible ? 3 : 2;
      context.setLineDash(dash);
      context.beginPath();
      let drawing = false;
      for (const point of samples) {
        const include = visible ? point.altitude >= 0 : point.altitude < 0;
        if (!include) {
          drawing = false;
          continue;
        }
        if (!drawing) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
        drawing = true;
      }
      context.stroke();
      context.restore();
    };
    drawSegments(false, 'rgba(167,139,250,.72)', [6, 6]);
    drawSegments(true, '#ffd166', []);

    const current = solarPosition(state.day, state.latitude, state.hour);
    const currentPoint = mapPoint(state.hour, current.altitude);
    line(context, currentPoint.x, 18, currentPoint.x, height - 26, 'rgba(0,212,255,.72)', 1.5, [4, 5]);
    drawSun(context, currentPoint.x, currentPoint.y, 7);
    label(
      context,
      t(`Current azimuth ${fixed(current.azimuth)}° ${azimuthName(current.azimuth)}`, `当前方位 ${fixed(current.azimuth)}° · ${azimuthName(current.azimuth)}`),
      width / 2,
      18,
      '#eef2ff',
      10,
      'center'
    );
  }

  function sampleAnnual(latitude) {
    const samples = [];
    for (let day = 0; day < 364; day += 4) {
      samples.push({
        day,
        altitude: solarPosition(day, latitude, 12).altitude,
        daylight: daylightInfo(day, latitude).hours
      });
    }
    samples.push({
      day: 364,
      altitude: solarPosition(364, latitude, 12).altitude,
      daylight: daylightInfo(364, latitude).hours
    });
    return samples;
  }

  function drawAnnualChart() {
    clear(annualScene);
    const { context, width, height } = annualScene;
    const samples = sampleAnnual(state.latitude);
    const left = 54;
    const right = width - 24;
    const altitudeTop = 30;
    const altitudeBottom = height * 0.46;
    const daylightTop = height * 0.58;
    const daylightBottom = height - 44;
    const xForDay = day => left + day / 364 * (right - left);
    const yForAltitude = altitude => altitudeBottom - (altitude + 90) / 180 * (altitudeBottom - altitudeTop);
    const yForDaylight = hours => daylightBottom - hours / 24 * (daylightBottom - daylightTop);

    for (const altitude of [0, 45, 90]) {
      const y = yForAltitude(altitude);
      line(context, left, y, right, y, 'rgba(238,242,255,.13)');
      label(context, `${altitude}°`, 12, y, '#aeb8d8', 9);
    }
    for (const hours of [0, 12, 24]) {
      const y = yForDaylight(hours);
      line(context, left, y, right, y, 'rgba(238,242,255,.13)');
      label(context, t(`${hours}h`, `${hours}时`), 12, y, '#aeb8d8', 9);
    }

    drawPolyline(
      context,
      samples.map(sample => ({ x: xForDay(sample.day), y: yForAltitude(sample.altitude) })),
      '#00d4ff',
      3
    );
    drawPolyline(
      context,
      samples.map(sample => ({ x: xForDay(sample.day), y: yForDaylight(sample.daylight) })),
      '#ffd166',
      3
    );

    const currentX = xForDay(state.day);
    const currentAltitude = solarPosition(state.day, state.latitude, 12).altitude;
    const currentDaylight = daylightInfo(state.day, state.latitude).hours;
    line(context, currentX, 18, currentX, daylightBottom + 5, 'rgba(238,242,255,.62)', 1.2, [4, 5]);
    circle(context, currentX, yForAltitude(currentAltitude), 5, '#00d4ff');
    circle(context, currentX, yForDaylight(currentDaylight), 5, '#ffd166');

    const monthMarkers = [
      [0, t('Jan', '1月')], [59, t('Mar', '3月')], [120, t('May', '5月')],
      [181, t('Jul', '7月')], [243, t('Sep', '9月')], [304, t('Nov', '11月')], [364, t('Dec', '12月')]
    ];
    for (const [day, month] of monthMarkers) {
      label(context, month, xForDay(day), height - 15, '#aeb8d8', 9, 'center');
    }

    $('annualMaxAltitude').textContent = `${fixed(Math.max(...samples.map(sample => sample.altitude)))}°`;
    $('annualMaxDaylight').textContent = formatDuration(Math.max(...samples.map(sample => sample.daylight)));
    $('annualMinDaylight').textContent = formatDuration(Math.min(...samples.map(sample => sample.daylight)));
  }

  function drawSolarEclipseSystem(geometry) {
    clear(systemScene);
    systemScene.orbit = null;
    const { context, width, height } = systemScene;
    drawStarField(context, width, height);
    const sunX = width * 0.12;
    const moonX = width * 0.51;
    const earthX = width * 0.87;
    const axisY = height * 0.5;
    const earthRadius = Math.min(54, height * 0.17);
    const moonRadius = Math.min(24, height * 0.068);
    const offsetY = state.alignment * earthRadius;
    const moonY = axisY + offsetY * 0.48;
    const shadowY = axisY + offsetY;
    const earthScale = earthRadius / EARTH_RADIUS_KM;
    const penumbraPx = Math.max(8, geometry.penumbraRadius * earthScale);
    const centralPx = Math.max(3, Math.abs(geometry.signedCentralShadowRadius) * earthScale);

    fillPolygon(context, [
      [moonX, moonY - moonRadius],
      [moonX, moonY + moonRadius],
      [earthX, shadowY + penumbraPx],
      [earthX, shadowY - penumbraPx]
    ], 'rgba(124,92,255,.22)');

    fillPolygon(context, [
      [moonX, moonY - moonRadius * 0.72],
      [moonX, moonY + moonRadius * 0.72],
      [earthX, shadowY + centralPx],
      [earthX, shadowY - centralPx]
    ], geometry.signedCentralShadowRadius >= 0 ? 'rgba(2,4,12,.88)' : 'rgba(255,107,157,.18)');

    drawSun(context, sunX, axisY, Math.min(42, height * 0.13));
    circle(context, moonX, moonY, moonRadius, '#d8deea', '#eef2ff');
    circle(context, earthX, axisY, earthRadius, '#1578b7', '#eef2ff');
    context.save();
    context.beginPath();
    context.arc(earthX, axisY, earthRadius, 0, Math.PI * 2);
    context.clip();
    context.fillStyle = 'rgba(5,8,22,.56)';
    context.fillRect(earthX, axisY - earthRadius, earthRadius, earthRadius * 2);
    context.fillStyle = 'rgba(124,92,255,.28)';
    context.fillRect(earthX - earthRadius, shadowY - penumbraPx, earthRadius * 2, penumbraPx * 2);
    context.fillStyle = geometry.signedCentralShadowRadius >= 0 ? 'rgba(2,4,12,.86)' : 'rgba(255,107,157,.24)';
    context.fillRect(earthX - earthRadius, shadowY - centralPx, earthRadius * 2, centralPx * 2);
    context.restore();
    circle(context, earthX, axisY + state.observer * earthRadius, 5, '#ff6b9d', '#eef2ff');

    line(context, sunX, axisY, earthX, shadowY, 'rgba(255,209,102,.3)', 1, [4, 6]);
    label(context, t('Sun', '太阳'), sunX, axisY + 58, '#ffd166', 10, 'center');
    label(context, t('Moon', '月球'), moonX, moonY - moonRadius - 15, '#eef2ff', 10, 'center');
    label(context, t('Earth', '地球'), earthX, axisY + earthRadius + 18, '#eef2ff', 10, 'center');
    label(context, t('penumbra', '半影'), mix(moonX, earthX, 0.54), mix(moonY, shadowY, 0.54) + penumbraPx + 14, '#a996ff', 9, 'center');
    label(
      context,
      geometry.signedCentralShadowRadius >= 0 ? t('umbra', '本影') : t('antumbra', '伪本影'),
      mix(moonX, earthX, 0.7),
      mix(moonY, shadowY, 0.7) - 13,
      geometry.signedCentralShadowRadius >= 0 ? '#eef2ff' : '#ff9abb',
      9,
      'center'
    );
  }

  function drawLunarEclipseSystem(geometry) {
    clear(systemScene);
    systemScene.orbit = null;
    const { context, width, height } = systemScene;
    drawStarField(context, width, height);
    const sunX = width * 0.12;
    const earthX = width * 0.49;
    const moonX = width * 0.86;
    const axisY = height * 0.5;
    const earthRadius = Math.min(44, height * 0.14);
    const moonRadius = Math.min(22, height * 0.065);
    const moonY = axisY + state.alignment * earthRadius * 1.35;
    const lunarUmbraPx = Math.max(moonRadius * 1.35, geometry.lunarUmbraRadius / MOON_RADIUS_KM * moonRadius);
    const lunarPenumbraPx = lunarUmbraPx * 1.75;

    fillPolygon(context, [
      [earthX, axisY - earthRadius],
      [earthX, axisY + earthRadius],
      [moonX + moonRadius, axisY + lunarPenumbraPx],
      [moonX + moonRadius, axisY - lunarPenumbraPx]
    ], 'rgba(124,92,255,.2)');
    fillPolygon(context, [
      [earthX, axisY - earthRadius * 0.72],
      [earthX, axisY + earthRadius * 0.72],
      [moonX + moonRadius, axisY + lunarUmbraPx],
      [moonX + moonRadius, axisY - lunarUmbraPx]
    ], 'rgba(2,4,12,.84)');

    drawSun(context, sunX, axisY, Math.min(42, height * 0.13));
    circle(context, earthX, axisY, earthRadius, '#1578b7', '#eef2ff');
    circle(context, moonX, moonY, moonRadius, '#d8deea', '#eef2ff');
    label(context, t('Sun', '太阳'), sunX, axisY + 58, '#ffd166', 10, 'center');
    label(context, t('Earth', '地球'), earthX, axisY + earthRadius + 18, '#eef2ff', 10, 'center');
    label(context, t('Moon', '月球'), moonX, moonY - moonRadius - 15, '#eef2ff', 10, 'center');
    label(context, t("Earth's umbra", '地球本影'), mix(earthX, moonX, 0.58), axisY - 15, '#eef2ff', 9, 'center');
  }

  function drawSolarObserver(geometry) {
    clear(observerScene, '#10284e');
    const { context, width, height } = observerScene;
    const cx = width * 0.5;
    const cy = height * 0.47;
    const scale = Math.min(width, height) * 0.27 / geometry.sunAngularRadius;
    const sunRadius = geometry.sunAngularRadius * scale;
    const moonRadius = geometry.moonAngularRadius * scale;
    const separationPx = Math.min(width * 0.72, geometry.localSeparation * scale);
    const direction = state.observer >= state.alignment ? -1 : 1;

    const sky = context.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#10284e');
    sky.addColorStop(1, '#331f43');
    context.fillStyle = sky;
    context.fillRect(0, 0, width, height);
    drawSun(context, cx, cy, sunRadius);
    circle(context, cx + separationPx * direction, cy, moonRadius, '#070a12', '#d8deea', 1.2);
    line(context, 0, height * 0.82, width, height * 0.82, 'rgba(238,242,255,.42)');
    label(context, t('local horizon', '当地地平线'), 12, height * 0.82 + 14, '#aeb8d8', 9);
    label(context, classificationName(geometry.classification), cx, height - 20, '#eef2ff', 11, 'center');
  }

  function drawLunarObserver(geometry) {
    clear(observerScene, '#080b18');
    const { context, width, height } = observerScene;
    drawStarField(context, width, height * 0.78);
    const cx = width * 0.5;
    const altitude = 12 + (1 - Math.abs(state.observer)) * 56;
    const cy = height * 0.78 - altitude / 90 * height * 0.62;
    const moonRadius = Math.min(width, height) * 0.16;
    const shadowRadius = geometry.lunarUmbraRadius / MOON_RADIUS_KM * moonRadius;
    const offset = state.alignment * shadowRadius * 0.96;

    circle(context, cx, cy, moonRadius, '#d8deea', '#eef2ff');
    context.save();
    context.globalAlpha = 0.86;
    circle(context, cx + offset, cy, shadowRadius, '#2b1420');
    context.restore();
    line(context, 0, height * 0.82, width, height * 0.82, 'rgba(238,242,255,.42)');
    context.fillStyle = '#0b1518';
    context.fillRect(0, height * 0.82, width, height * 0.18);
    label(context, t('night-side horizon', '夜半球地平线'), 12, height * 0.82 + 14, '#aeb8d8', 9);
    label(context, classificationName(geometry.classification), cx, height - 20, '#eef2ff', 11, 'center');
  }

  function setReadouts(labels, values) {
    ['A', 'B', 'C', 'D', 'E', 'F'].forEach((key, index) => {
      $(`metricLabel${key}`).textContent = labels[index];
      $(`metricValue${key}`).textContent = values[index];
    });
  }

  function renderSeasons() {
    const position = solarPosition(state.day, state.latitude, state.hour);
    const daylight = daylightInfo(state.day, state.latitude);
    const season = seasonInfo(state.day, state.latitude);
    $('dayOutput').textContent = dateLabel(state.day);
    $('latitudeOutput').textContent = latitudeLabel(state.latitude);
    $('timeOutput').textContent = formatClock(state.hour);
    $('dayControl').setAttribute('aria-valuetext', dateLabel(state.day));
    $('latitudeControl').setAttribute('aria-valuetext', latitudeLabel(state.latitude));
    $('timeControl').setAttribute('aria-valuetext', t(`Local apparent solar time ${formatClock(state.hour)}`, `当地真太阳时 ${formatClock(state.hour)}`));

    $('systemTitle').textContent = t('Orbit viewed from north of the ecliptic', '从黄道北侧观察公转');
    $('systemSubtitle').textContent = t(
      "Earth's axis keeps nearly the same direction throughout the orbit; its tilt is 23.44°.",
      '地轴在公转过程中始终近似指向同一方向，倾角为 23.44°。'
    );
    $('observerTitle').textContent = t('Your local sky', '你的当地天空');
    $('observerSubtitle').textContent = t(
      'The circle is your horizon; the centre is the zenith directly overhead.',
      '圆周是地平线，圆心是头顶正上方的天顶。'
    );
    $('systemLegend').innerHTML = `
      <span class="legend-key" style="--key-color:#00d4ff">${t('fixed axis direction', '固定地轴方向')}</span>
      <span class="legend-key" style="--key-color:#ff6b9d">${t('selected observer', '所选观察者')}</span>
      <span class="legend-key" style="--key-color:#ffd166">${t('sunlight', '太阳光')}</span>`;

    const riseSet = daylight.kind === 'normal'
      ? `${formatClock(daylight.sunrise)} / ${formatClock(daylight.sunset)}`
      : daylight.kind === 'polar-day'
        ? t('Sun does not set', '太阳不落')
        : t('Sun does not rise', '太阳不升');
    setReadouts(
      [
        t('Solar altitude', '太阳仰角'),
        t('Azimuth', '方位角'),
        t('Daylight', '白昼长度'),
        t('Sunrise / sunset', '日出 / 日落'),
        t('Solar declination', '太阳赤纬'),
        t('Subsolar point', '太阳直射点')
      ],
      [
        `${fixed(position.altitude)}°`,
        `${fixed(position.azimuth)}° · ${azimuthName(position.azimuth)}`,
        formatDuration(daylight.hours),
        riseSet,
        signedDegrees(position.declination),
        declinationDescription(position.declination)
      ]
    );

    $('liveSummary').textContent = t(
      `${dateLabel(state.day)}, ${latitudeLabel(state.latitude)}: ${seasonName(state.day, state.latitude)}. The Sun is ${Math.abs(position.altitude).toFixed(1)}° ${position.altitude >= 0 ? 'above' : 'below'} the horizon.`,
      `${dateLabel(state.day)}，${latitudeLabel(state.latitude)}：${seasonName(state.day, state.latitude)}。太阳位于地平线${position.altitude >= 0 ? '上' : '下'} ${Math.abs(position.altitude).toFixed(1)}°。`
    );
    $('seasonBadge').textContent = season.badge;
    $('seasonName').textContent = season.title;
    $('seasonDate').textContent = t(
      `${dateLabel(state.day)} · orbit day ${Math.floor(normalizeDay(state.day)) + 1}`,
      `${dateLabel(state.day)} · 公转第${Math.floor(normalizeDay(state.day)) + 1}天`
    );
    $('seasonExplanation').textContent = season.explanation;

    const noonAzimuth = solarPosition(state.day, state.latitude, 12).azimuth;
    const facing = noonAzimuth < 90 || noonAzimuth > 270 ? t('north', '北方') : t('south', '南方');
    $('horizonDescription').textContent = t(
      `Face ${facing}. This flattened horizon-time view complements the sky dome: horizontal position is solar time, vertical position is altitude.`,
      `面向${facing}观察。这个展开的地平线—时间视图补充了天空穹顶：横向表示太阳时，纵向表示仰角。`
    );
    $('gaugeAltitude').textContent = `${fixed(position.altitude)}°`;
    const gaugeAngle = clamp(position.altitude, -90, 90) * DEG;
    $('gaugeRay').setAttribute('x2', fixed(110 + 80 * Math.cos(gaugeAngle), 2));
    $('gaugeRay').setAttribute('y2', fixed(118 - 80 * Math.sin(gaugeAngle), 2));
    $('gaugeRay').setAttribute('stroke', position.altitude >= 0 ? '#ffd166' : '#a78bfa');
    $('horizonSunrise').textContent = daylight.kind === 'normal'
      ? formatClock(daylight.sunrise)
      : daylight.kind === 'polar-day' ? t('Does not set', '不落') : t('Does not rise', '不升');
    $('horizonSunset').textContent = daylight.kind === 'normal'
      ? formatClock(daylight.sunset)
      : daylight.kind === 'polar-day' ? t('Does not set', '不落') : t('Does not rise', '不升');
    $('horizonState').textContent = daylight.kind === 'polar-day'
      ? t('Polar day', '极昼')
      : daylight.kind === 'polar-night' ? t('Polar night', '极夜') : t('Normal day/night cycle', '正常昼夜');
    $('horizonDirection').textContent = `${fixed(position.azimuth)}° · ${azimuthName(position.azimuth)}`;

    drawSeasonSystem();
    drawSkyDome();
    drawSeasonProfile();
    drawHorizonPath();
    drawAnnualChart();
  }

  function renderEclipses() {
    const geometry = eclipseGeometry();
    $('distanceOutput').textContent = `${Math.round(state.moonDistance).toLocaleString(zh() ? 'zh-CN' : 'en-US')} km`;
    $('sunDistanceOutput').textContent = t(
      `${fixed(state.sunDistance / 1000000, 2)} million km`,
      `${fixed(state.sunDistance / 1000000, 2)} 百万千米`
    );
    $('alignmentOutput').textContent = `${state.alignment >= 0 ? '+' : ''}${fixed(state.alignment, 2)} R⊕`;
    $('observerOutput').textContent = Math.abs(state.observer) < 0.02
      ? t('Centre line', '中心线')
      : `${fixed(Math.abs(state.observer), 2)} R⊕ ${state.observer > 0 ? t('north', '以北') : t('south', '以南')}`;

    $('systemTitle').textContent = state.eclipseType === 'solar'
      ? t('Where the Moon’s shadow reaches Earth', '月影落在地球何处')
      : t('How the Moon crosses Earth’s shadow', '月球如何穿过地影');
    $('systemSubtitle').textContent = state.eclipseType === 'solar'
      ? t('The dark core is umbra or antumbra; the wider violet cone is penumbra.', '暗色核心是本影或伪本影；较宽的紫色锥体是半影。')
      : t('A lunar eclipse is visible across the night side of Earth at nearly the same time.', '月食可由地球夜半球的大范围地区近乎同时看到。');
    $('observerTitle').textContent = state.eclipseType === 'solar'
      ? t('What this observer sees', '该观察者看到什么')
      : t('View from Earth’s night side', '从地球夜半球观察');
    $('observerSubtitle').textContent = state.eclipseType === 'solar'
      ? t('Move the observer across Earth to enter penumbra, umbra, or antumbra.', '移动地球上的观察者，进入半影、本影或伪本影。')
      : t('Observer position changes the Moon’s height, not the eclipse phase.', '观察者位置改变月球高度，但不改变月食阶段。');

    const centralDiameter = Math.abs(geometry.signedCentralShadowRadius) * 2;
    const shadowKind = geometry.signedCentralShadowRadius >= 0 ? t('Umbra', '本影') : t('Antumbra', '伪本影');
    $('systemLegend').innerHTML = `
      <span class="legend-key" style="--key-color:#a996ff">${t('penumbra', '半影')}</span>
      <span class="legend-key" style="--key-color:${geometry.signedCentralShadowRadius >= 0 ? '#eef2ff' : '#ff6b9d'}">${shadowKind.toLowerCase()}</span>
      <span class="legend-key" style="--key-color:#ff6b9d">${t('observer', '观察者')}</span>`;

    if (state.eclipseType === 'solar') {
      setReadouts(
        [
          t('Local result', '当地结果'),
          t('Moon / Sun diameter', '月 / 日角直径'),
          t(`${shadowKind} diameter`, `${shadowKind}直径`),
          t('Umbra tip from Moon', '本影尖端距月球'),
          t('Shadow-axis offset', '影轴偏移'),
          t('Observer position', '观察者位置')
        ],
        [
          classificationName(geometry.classification),
          `${fixed(geometry.moonAngularRadius * 2, 3)}° / ${fixed(geometry.sunAngularRadius * 2, 3)}°`,
          `${Math.round(centralDiameter).toLocaleString()} km`,
          `${Math.round(geometry.umbraLength).toLocaleString()} km`,
          `${state.alignment >= 0 ? '+' : ''}${fixed(state.alignment, 2)} R⊕`,
          Math.abs(state.observer) < 0.02 ? t('Centre line', '中心线') : `${fixed(state.observer, 2)} R⊕`
        ]
      );
      $('liveSummary').textContent = t(
        `${classificationName(geometry.classification)}. At the selected Sun–Earth and Earth–Moon distances, the Moon appears ${geometry.moonAngularRadius >= geometry.sunAngularRadius ? 'larger' : 'smaller'} than the Sun.`,
        `${classificationName(geometry.classification)}。在所选日地与地月距离下，月球看起来比太阳${geometry.moonAngularRadius >= geometry.sunAngularRadius ? '大' : '小'}。`
      );
      drawSolarEclipseSystem(geometry);
      drawSolarObserver(geometry);
    } else {
      setReadouts(
        [
          t('Eclipse phase', '食相阶段'),
          t('Earth umbra at Moon', '月球处地球本影'),
          t('Moon diameter', '月球直径'),
          t('Visibility', '可见范围'),
          t('Shadow-axis offset', '影轴偏移'),
          t('Observer position', '观察者位置')
        ],
        [
          classificationName(geometry.classification),
          `${Math.round(geometry.lunarUmbraRadius * 2).toLocaleString()} km`,
          `${Math.round(MOON_RADIUS_KM * 2).toLocaleString()} km`,
          t('Most of Earth’s night side', '地球夜半球大部分地区'),
          `${state.alignment >= 0 ? '+' : ''}${fixed(state.alignment, 2)} R⊕`,
          Math.abs(state.observer) < 0.02 ? t('Centre line', '中心线') : `${fixed(state.observer, 2)} R⊕`
        ]
      );
      $('liveSummary').textContent = t(
        `${classificationName(geometry.classification)}. Everyone with the Moon above the horizon sees essentially the same lunar-eclipse phase.`,
        `${classificationName(geometry.classification)}。只要月球在地平线上方，各地观察者看到的月食阶段基本相同。`
      );
      drawLunarEclipseSystem(geometry);
      drawLunarObserver(geometry);
    }
  }

  function updatePressedStates() {
    document.querySelectorAll('[data-lab-mode]').forEach(button => {
      button.setAttribute('aria-selected', String(button.dataset.labMode === state.mode));
    });
    document.querySelectorAll('[data-eclipse-type]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.eclipseType === state.eclipseType));
    });
    document.querySelectorAll('[data-day]').forEach(button => {
      button.setAttribute('aria-pressed', String(Math.abs(state.day - Number(button.dataset.day)) < 0.6));
    });
    document.querySelectorAll('[data-latitude]').forEach(button => {
      button.setAttribute('aria-pressed', String(Math.abs(state.latitude - Number(button.dataset.latitude)) < 0.06));
    });
    document.querySelectorAll('[data-hour]').forEach(button => {
      button.setAttribute('aria-pressed', String(Math.abs(normalizeHour(state.hour) - Number(button.dataset.hour)) < 0.03));
    });
    const daylight = daylightInfo(state.day, state.latitude);
    document.querySelectorAll('[data-solar-event]').forEach(button => {
      const eventName = button.dataset.solarEvent;
      const available = daylight.kind === 'normal';
      const eventHour = available ? daylight[eventName] : null;
      const base = eventName === 'sunrise' ? t("Today's sunrise", '当天日出') : t("Today's sunset", '当天日落');
      button.disabled = !available;
      button.textContent = available
        ? `${base} · ${formatClock(eventHour)}`
        : `${base} · ${daylight.kind === 'polar-day' ? t('polar day', '极昼') : t('polar night', '极夜')}`;
      button.title = available
        ? t(`Set time to ${formatClock(eventHour)}`, `将时间设为 ${formatClock(eventHour)}`)
        : t('No sunrise or sunset on this date at this latitude', '该日期与纬度没有日出或日落');
      button.setAttribute('aria-pressed', String(available && Math.abs(normalizeHour(state.hour) - eventHour) < 0.03));
    });
    const playback = [
      ['playDay', 'day', t('Play one day', '播放一天'), t('Pause day', '暂停一天')],
      ['playYear', 'year', t('Play one year', '播放一年'), t('Pause year', '暂停一年')],
      ['playEclipse', 'eclipse', t('Sweep the shadow', '播放影子扫过'), t('Pause shadow', '暂停影子')]
    ];
    for (const [id, mode, idle, active] of playback) {
      const button = $(id);
      const playing = state.playing === mode;
      button.setAttribute('aria-pressed', String(playing));
      button.textContent = playing ? active : idle;
    }
  }

  function render() {
    document.querySelectorAll('[data-mode-panel]').forEach(panel => {
      panel.hidden = panel.dataset.modePanel !== state.mode;
    });
    const seasonsMode = state.mode === 'seasons';
    $('orbitalWorkspace').dataset.mode = state.mode;
    $('orbitalWorkspace').setAttribute('aria-labelledby', state.mode === 'seasons' ? 'seasonTab' : 'eclipseTab');
    $('seasonLearning').hidden = !seasonsMode;
    $('orbitHint').hidden = !seasonsMode;
    $('systemCanvas').tabIndex = seasonsMode ? 0 : -1;
    $('systemCanvas').setAttribute(
      'aria-label',
      seasonsMode
        ? t('Sun Earth Moon system geometry; click the orbit to choose a date', '太阳地球月球系统几何；点击轨道可选择日期')
        : t('Sun Earth Moon eclipse and shadow geometry', '太阳地球月球食相与影区几何')
    );
    if (seasonsMode) renderSeasons();
    else renderEclipses();
    updatePressedStates();
  }

  function stopPlayback() {
    state.playing = null;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
  }

  function animate(timestamp) {
    if (!state.playing) return;
    if (!lastTime) lastTime = timestamp;
    const delta = clamp(timestamp - lastTime, 0, 80);
    lastTime = timestamp;
    if (state.playing === 'day') state.hour = (state.hour + delta * 24 / 12000) % 24;
    if (state.playing === 'year') state.day = (state.day + delta * DAYS / 18000) % DAYS;
    if (state.playing === 'eclipse') {
      state.alignment += delta * 2.7 / 6200;
      if (state.alignment > 1.35) state.alignment = -1.35;
    }
    syncInputs();
    render();
    frame = requestAnimationFrame(animate);
  }

  function togglePlayback(mode) {
    if (state.playing === mode) {
      stopPlayback();
      render();
      return;
    }
    stopPlayback();
    window.PhysicsUI.requestMotion();
    state.playing = mode;
    frame = requestAnimationFrame(animate);
    render();
  }

  function syncInputs() {
    $('dayControl').value = String(state.day);
    $('latitudeControl').value = String(state.latitude);
    $('timeControl').value = String(state.hour);
    $('distanceControl').value = String(state.moonDistance);
    $('sunDistanceControl').value = String(state.sunDistance);
    $('alignmentControl').value = String(state.alignment);
    $('observerControl').value = String(state.observer);
  }

  function bindRange(id, key) {
    $(id).addEventListener('input', event => {
      stopPlayback();
      state[key] = Number(event.currentTarget.value);
      render();
    });
  }

  bindRange('dayControl', 'day');
  bindRange('latitudeControl', 'latitude');
  bindRange('timeControl', 'hour');
  bindRange('distanceControl', 'moonDistance');
  bindRange('sunDistanceControl', 'sunDistance');
  bindRange('alignmentControl', 'alignment');
  bindRange('observerControl', 'observer');

  document.querySelectorAll('[data-lab-mode]').forEach(button => {
    button.addEventListener('click', () => {
      stopPlayback();
      state.mode = button.dataset.labMode;
      render();
    });
  });
  document.querySelectorAll('[data-eclipse-type]').forEach(button => {
    button.addEventListener('click', () => {
      stopPlayback();
      state.eclipseType = button.dataset.eclipseType;
      render();
    });
  });
  document.querySelectorAll('[data-day]').forEach(button => {
    button.addEventListener('click', () => {
      stopPlayback();
      state.day = Number(button.dataset.day);
      syncInputs();
      render();
    });
  });
  document.querySelectorAll('[data-latitude]').forEach(button => {
    button.addEventListener('click', () => {
      stopPlayback();
      state.latitude = Number(button.dataset.latitude);
      syncInputs();
      render();
    });
  });
  document.querySelectorAll('[data-hour]').forEach(button => {
    button.addEventListener('click', () => {
      stopPlayback();
      state.hour = Number(button.dataset.hour);
      syncInputs();
      render();
    });
  });
  document.querySelectorAll('[data-solar-event]').forEach(button => {
    button.addEventListener('click', () => {
      const daylight = daylightInfo(state.day, state.latitude);
      if (daylight.kind !== 'normal') return;
      stopPlayback();
      state.hour = daylight[button.dataset.solarEvent];
      syncInputs();
      render();
    });
  });

  $('systemCanvas').addEventListener('click', event => {
    if (state.mode !== 'seasons' || !systemScene.orbit) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const { cx, cy, rx, ry } = systemScene.orbit;
    const normalizedRadius = Math.hypot((x - cx) / rx, (y - cy) / ry);
    if (normalizedRadius < 0.72 || normalizedRadius > 1.28) return;
    const angle = Math.atan2((y - cy) / ry, (x - cx) / rx);
    stopPlayback();
    state.day = normalizeDay(171 + angle / (2 * Math.PI) * DAYS);
    syncInputs();
    render();
  });

  $('playDay').addEventListener('click', () => togglePlayback('day'));
  $('playYear').addEventListener('click', () => togglePlayback('year'));
  $('playEclipse').addEventListener('click', () => togglePlayback('eclipse'));
  $('seasonReset').addEventListener('click', () => {
    stopPlayback();
    Object.assign(state, { day: 171, latitude: 39.9, hour: 12 });
    syncInputs();
    render();
  });
  $('eclipseReset').addEventListener('click', () => {
    stopPlayback();
    Object.assign(state, { eclipseType: 'solar', moonDistance: 370000, sunDistance: SUN_EARTH_KM, alignment: 0, observer: 0 });
    syncInputs();
    render();
  });

  document.addEventListener('physics-language', render);
  document.addEventListener('physics-motion', event => {
    if (event.detail.paused && state.playing) {
      stopPlayback();
      render();
    }
  });
  const resizeObserver = new ResizeObserver(render);
  resizeObserver.observe($('orbitalWorkspace'));
  resizeObserver.observe($('seasonLearning'));

  window.__orbitalLab = Object.freeze({
    state,
    requireElement: $,
    dateLabel,
    formatClock,
    formatDuration,
    signedDegrees,
    declinationDescription,
    solarDeclination,
    solarPosition,
    daylightInfo,
    seasonInfo,
    seasonName,
    sampleAnnual,
    latitudeLabel,
    azimuthName,
    classificationName,
    animate,
    stopPlayback,
    togglePlayback,
    eclipseGeometry,
    render
  });

  syncInputs();
  render();
})();
