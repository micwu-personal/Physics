(() => {
  'use strict';

  const DEG = Math.PI / 180;
  const RAD = 180 / Math.PI;
  const DAYS = 365;
  const SUN_RADIUS_KM = 696340;
  const EARTH_RADIUS_KM = 6371;
  const MOON_RADIUS_KM = 1737.4;
  const SUN_EARTH_KM = 149597870.7;
  const AXIS_EPSILON = 0.005;
  const EARTH_TILT = -23.44 * DEG;
  const ORBIT_CAMERA_ANGLE = 58 * DEG;
  const EARTH_AXIS_WORLD = {
    x: Math.sin(EARTH_TILT),
    y: 0,
    z: Math.cos(EARTH_TILT)
  };
  const EARTH_EQUATOR_X = {
    x: Math.cos(EARTH_TILT),
    y: 0,
    z: -Math.sin(EARTH_TILT)
  };
  const EARTH_EQUATOR_Y = { x: 0, y: 1, z: 0 };
  const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const MONTHS = {
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    'zh-CN': ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  };
  const EARTH_LAND_BLOBS = [
    { longitude: -105, latitude: 46, rx: 0.24, ry: 0.16 },
    { longitude: -88, latitude: 18, rx: 0.18, ry: 0.24 },
    { longitude: -60, latitude: -18, rx: 0.16, ry: 0.3 },
    { longitude: 15, latitude: 50, rx: 0.16, ry: 0.11 },
    { longitude: 22, latitude: 7, rx: 0.22, ry: 0.31 },
    { longitude: 80, latitude: 45, rx: 0.34, ry: 0.18 },
    { longitude: 120, latitude: 8, rx: 0.2, ry: 0.16 },
    { longitude: 135, latitude: -25, rx: 0.17, ry: 0.12 }
  ];

  function isLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }

  function dayOfYear(date) {
    const yearStart = Date.UTC(date.getFullYear(), 0, 1);
    const localDate = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    const ordinal = Math.floor((localDate - yearStart) / 86400000);
    const leapDayReached = isLeapYear(date.getFullYear())
      && (date.getMonth() > 1 || (date.getMonth() === 1 && date.getDate() === 29));
    return ordinal - (leapDayReached ? 1 : 0);
  }

  function initialDate(search = window.location.search, date = new Date()) {
    const queryValue = new URLSearchParams(search).get('day');
    const queryDay = queryValue === null ? Number.NaN : Number(queryValue);
    if (Number.isFinite(queryDay)) {
      return { day: Math.min(364, Math.max(0, queryDay)), leapDay: false };
    }
    return {
      day: dayOfYear(date),
      leapDay: isLeapYear(date.getFullYear()) && date.getMonth() === 1 && date.getDate() === 29
    };
  }

  const INITIAL_DATE = initialDate();

  const state = {
    mode: 'seasons',
    day: INITIAL_DATE.day,
    leapDay: INITIAL_DATE.leapDay,
    latitude: 39.9,
    hour: 12,
    eclipseType: 'solar',
    moonDistance: 370000,
    sunDistance: SUN_EARTH_KM,
    alignment: 0,
    observer: 0,
    eclipseProgress: 0,
    locationStatus: 'idle',
    playing: null
  };

  const canvases = new Map();
  let frame = 0;
  let lastTime = 0;
  const orbitDrag = { active: false, pointerId: null };

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

  function displayDateLabel(day, leapDay = false) {
    return leapDay && Math.abs(day - 58) < 0.001 ? t('29 Feb', '2月29日') : dateLabel(day);
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

  function northToCanvasY(centerY, northOffset, scale) {
    return centerY - northOffset * scale;
  }

  function northOffsetLabel(value) {
    if (Math.abs(value) < AXIS_EPSILON) return t('0.00 R⊕ · centred', '0.00 R⊕ · 中心对齐');
    return t(
      `${value > 0 ? '+' : ''}${fixed(value, 2)} R⊕ · ${value > 0 ? 'north' : 'south'}`,
      `${value > 0 ? '+' : ''}${fixed(value, 2)} R⊕ · ${value > 0 ? '北' : '南'}`
    );
  }

  function apparentMoonDirection(observer, shadowAxis) {
    const relative = observer - shadowAxis;
    if (Math.abs(relative) < AXIS_EPSILON) return t('Moon centred on the Sun', '月球与太阳中心重合');
    return relative > 0
      ? t('Moon appears south of the Sun', '月球看起来位于太阳以南')
      : t('Moon appears north of the Sun', '月球看起来位于太阳以北');
  }

  function eclipseProgressLabel(progress) {
    if (Math.abs(progress) < 0.03) return t('Maximum eclipse', '食甚');
    return progress < 0
      ? t('Before maximum', '食甚前')
      : t('After maximum', '食甚后');
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
    const crossTrackSeparation = Math.abs(observerKm - axisOffsetKm) / moonDistance * RAD;
    const alongTrackSeparation = Math.abs(state.eclipseProgress)
      * (sunAngularRadius + moonAngularRadius) * 1.25;
    const localSeparation = Math.hypot(crossTrackSeparation, alongTrackSeparation);
    const globalSolar = Math.abs(axisOffsetKm) <= EARTH_RADIUS_KM + penumbraRadius;
    const lunarUmbraRadius = EARTH_RADIUS_KM
      - ((SUN_RADIUS_KM - EARTH_RADIUS_KM) * moonDistance / state.sunDistance);
    const lunarPenumbraRadius = EARTH_RADIUS_KM
      + ((SUN_RADIUS_KM + EARTH_RADIUS_KM) * moonDistance / state.sunDistance);
    const lunarCrossTrackKm = Math.abs(state.alignment) * (EARTH_RADIUS_KM + MOON_RADIUS_KM);
    const lunarAlongTrackKm = Math.abs(state.eclipseProgress)
      * (lunarPenumbraRadius + MOON_RADIUS_KM) * 1.12;
    const lunarSeparationKm = Math.hypot(lunarCrossTrackKm, lunarAlongTrackKm);

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
      crossTrackSeparation,
      globalSolar,
      alongTrackSeparation,
      localSeparation,
      lunarAlongTrackKm,
      lunarCrossTrackKm,
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

  function dot3(left, right) {
    return left.x * right.x + left.y * right.y + left.z * right.z;
  }

  function normalize3(vector) {
    const magnitude = Math.hypot(vector.x, vector.y, vector.z);
    return { x: vector.x / magnitude, y: vector.y / magnitude, z: vector.z / magnitude };
  }

  function cameraVector(vector) {
    const cosCamera = Math.cos(ORBIT_CAMERA_ANGLE);
    const sinCamera = Math.sin(ORBIT_CAMERA_ANGLE);
    return {
      x: vector.x,
      y: -vector.y * cosCamera - vector.z * sinCamera,
      z: -vector.y * sinCamera + vector.z * cosCamera
    };
  }

  function orbitalAngle(day) {
    return 2 * Math.PI * (day - 171) / DAYS;
  }

  function counterClockwiseEllipsePoint(angle, cx, cy, rx, ry) {
    return {
      x: cx + rx * Math.cos(angle),
      y: cy - ry * Math.sin(angle)
    };
  }

  function orbitScreenPoint(day, cx, cy, rx, ry) {
    return counterClockwiseEllipsePoint(orbitalAngle(day), cx, cy, rx, ry);
  }

  function sunDirectionWorld(day) {
    const angle = orbitalAngle(day);
    return { x: -Math.cos(angle), y: -Math.sin(angle), z: 0 };
  }

  function earthRotationAngle(hour) {
    return (hour - 12) * 15 * DEG;
  }

  function earthRotationPhase(day, hour) {
    const sun = sunDirectionWorld(day);
    const axisProjection = dot3(sun, EARTH_AXIS_WORLD);
    const equatorialSun = normalize3({
      x: sun.x - axisProjection * EARTH_AXIS_WORLD.x,
      y: sun.y - axisProjection * EARTH_AXIS_WORLD.y,
      z: sun.z - axisProjection * EARTH_AXIS_WORLD.z
    });
    const subsolarLongitude = Math.atan2(
      dot3(equatorialSun, EARTH_EQUATOR_Y),
      dot3(equatorialSun, EARTH_EQUATOR_X)
    );
    return subsolarLongitude + earthRotationAngle(hour);
  }

  function projectEarthPoint(latitudeDegrees, longitudeDegrees, rotation, radius) {
    const latitude = latitudeDegrees * DEG;
    const longitude = longitudeDegrees * DEG + rotation;
    const surface = {
      x: Math.sin(latitude) * EARTH_AXIS_WORLD.x
        + Math.cos(latitude) * (
          Math.cos(longitude) * EARTH_EQUATOR_X.x + Math.sin(longitude) * EARTH_EQUATOR_Y.x
        ),
      y: Math.sin(latitude) * EARTH_AXIS_WORLD.y
        + Math.cos(latitude) * (
          Math.cos(longitude) * EARTH_EQUATOR_X.y + Math.sin(longitude) * EARTH_EQUATOR_Y.y
        ),
      z: Math.sin(latitude) * EARTH_AXIS_WORLD.z
        + Math.cos(latitude) * (
          Math.cos(longitude) * EARTH_EQUATOR_X.z + Math.sin(longitude) * EARTH_EQUATOR_Y.z
        )
    };
    const camera = cameraVector(surface);
    return {
      depth: camera.z,
      world: surface,
      x: camera.x * radius,
      y: camera.y * radius
    };
  }

  function northPoleIllumination(day) {
    return dot3(EARTH_AXIS_WORLD, sunDirectionWorld(day));
  }

  function drawNightMask(context, x, y, radius, lightVector) {
    const size = Math.max(2, Math.ceil(radius * 2));
    const mask = document.createElement('canvas');
    mask.width = size;
    mask.height = size;
    const maskContext = mask.getContext('2d');
    const image = maskContext.createImageData(size, size);
    const light = normalize3(lightVector);
    for (let pixelY = 0; pixelY < size; pixelY += 1) {
      for (let pixelX = 0; pixelX < size; pixelX += 1) {
        const nx = ((pixelX + 0.5) / size) * 2 - 1;
        const ny = ((pixelY + 0.5) / size) * 2 - 1;
        const radialSquared = nx * nx + ny * ny;
        if (radialSquared > 1) continue;
        const nz = Math.sqrt(1 - radialSquared);
        const illumination = nx * light.x + ny * light.y + nz * light.z;
        const twilight = clamp((0.08 - illumination) / 0.16, 0, 1);
        const offset = (pixelY * size + pixelX) * 4;
        image.data[offset] = 3;
        image.data[offset + 1] = 8;
        image.data[offset + 2] = 24;
        image.data[offset + 3] = Math.round(twilight * 196);
      }
    }
    maskContext.putImageData(image, 0, 0);
    context.drawImage(mask, x - radius, y - radius, radius * 2, radius * 2);
  }

  function drawEarth(context, x, y, radius, lightVector, rotation = 0) {
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

    context.fillStyle = '#7ee8c5';
    for (const land of EARTH_LAND_BLOBS) {
      const projected = projectEarthPoint(land.latitude, land.longitude, rotation, radius);
      if (projected.depth <= -0.08) continue;
      const foreshortening = clamp((projected.depth + 0.08) / 1.08, 0.08, 1);
      context.save();
      context.translate(x + projected.x, y + projected.y);
      context.rotate(EARTH_TILT);
      context.beginPath();
      context.ellipse(
        0,
        0,
        radius * land.rx * foreshortening,
        radius * land.ry,
        0,
        0,
        Math.PI * 2
      );
      context.fill();
      context.restore();
    }

    drawNightMask(context, x, y, radius, lightVector);

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
    const ry = Math.max(52, rx * Math.cos(ORBIT_CAMERA_ANGLE));
    const angle = orbitalAngle(state.day);
    const earthPoint = counterClockwiseEllipsePoint(angle, cx, cy, rx, ry);
    const earthX = earthPoint.x;
    const earthY = earthPoint.y;
    const earthRadius = clamp(Math.min(width, height) * 0.052, 16, 29);
    const earthRotation = earthRotationPhase(state.day, state.hour);
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

    const lightCamera = cameraVector(sunDirectionWorld(state.day));
    drawEarth(context, earthX, earthY, earthRadius, lightCamera, earthRotation);

    const axisCamera = cameraVector(EARTH_AXIS_WORLD);
    const axisScreenLength = Math.hypot(axisCamera.x, axisCamera.y);
    const axisDx = axisCamera.x / axisScreenLength * earthRadius * 1.75;
    const axisDy = axisCamera.y / axisScreenLength * earthRadius * 1.75;
    line(context, earthX - axisDx, earthY - axisDy, earthX + axisDx, earthY + axisDy, '#00d4ff', 2);
    label(context, 'N', earthX + axisDx + 3, earthY + axisDy, '#00d4ff', 10);

    const observerPoint = projectEarthPoint(state.latitude, 0, earthRotation, earthRadius);
    const observerX = earthX + observerPoint.x;
    const observerY = earthY + observerPoint.y;
    const observerIllumination = dot3(observerPoint.world, sunDirectionWorld(state.day));
    const observerNearSide = observerPoint.depth >= 0;
    const observerDaylight = observerIllumination >= 0;
    systemScene.lastGeometry = {
      kind: 'season',
      orbit: { cx, cy, rx, ry },
      earth: { x: earthX, y: earthY, radius: earthRadius },
      observer: {
        x: observerX,
        y: observerY,
        depth: observerPoint.depth,
        illumination: observerIllumination,
        nearSide: observerNearSide,
        daylight: observerDaylight
      },
      rotation: earthRotation,
      light: lightCamera,
      axis: axisCamera
    };
    if (observerNearSide) {
      circle(context, observerX, observerY, 4.5, '#ff6b9d', '#eef2ff', 1);
    } else {
      context.save();
      context.setLineDash([2, 2]);
      circle(context, observerX, observerY, 5.5, '', '#ff6b9d', 2);
      context.restore();
    }
    label(
      context,
      t(
        `${observerNearSide ? 'near side' : 'far side'} · ${observerDaylight ? 'day' : 'night'}`,
        `${observerNearSide ? '近侧' : '背侧'} · ${observerDaylight ? '白昼' : '夜晚'}`
      ),
      observerX + 9,
      observerY - 10,
      observerDaylight ? '#ffd166' : '#a78bfa',
      8
    );

    const moonAngle = 2 * Math.PI * (state.day + state.hour / 24) / 27.321661;
    const moonOrbit = earthRadius * 2.05;
    context.strokeStyle = 'rgba(238,242,255,.2)';
    context.beginPath();
    context.ellipse(earthX, earthY, moonOrbit, moonOrbit * 0.42, 0, 0, Math.PI * 2);
    context.stroke();
    const moonPoint = counterClockwiseEllipsePoint(
      moonAngle,
      earthX,
      earthY,
      moonOrbit,
      moonOrbit * 0.42
    );
    systemScene.lastGeometry.moon = { ...moonPoint, angle: moonAngle };
    circle(context, moonPoint.x, moonPoint.y, Math.max(3.5, earthRadius * 0.22), '#d8deea');

    label(context, t('Sun', '太阳'), cx, cy + 49, '#ffd166', 11, 'center');

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

  function skyDomePoint(altitude, azimuth, cx, cy, radius) {
    const radialDistance = radius * (1 - altitude / 90);
    const angle = (-azimuth - 90) * DEG;
    return {
      x: cx + Math.cos(angle) * radialDistance,
      y: cy + Math.sin(angle) * radialDistance
    };
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
    label(context, t('W', '西'), cx + radius + 10, cy, '#eef2ff', 10, 'center');
    label(context, t('S', '南'), cx, cy + radius + 12, '#eef2ff', 10, 'center');
    label(context, t('E', '东'), cx - radius - 10, cy, '#eef2ff', 10, 'center');

    const samples = [];
    for (let hour = 0; hour <= 24; hour += 0.1) {
      const position = solarPosition(state.day, state.latitude, hour);
      if (position.altitude < 0) {
        samples.push(null);
        continue;
      }
      samples.push(skyDomePoint(position.altitude, position.azimuth, cx, cy, radius));
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
    const currentPoint = skyDomePoint(clamp(current.altitude, 0, 90), current.azimuth, cx, cy, radius);
    if (current.altitude >= 0) {
      drawSun(context, currentPoint.x, currentPoint.y, 7);
      line(context, cx, cy, currentPoint.x, currentPoint.y, 'rgba(0,212,255,.5)', 1, [3, 4]);
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
    const declination = solarDeclination(state.day);

    for (let offset = -2; offset <= 2; offset += 1) {
      const y = earthY + offset * earthRadius * 0.38;
      line(context, width * 0.62, y, width * 0.96, y, 'rgba(255,209,102,.72)', 1.5);
    }
    drawEarth(
      context,
      earthX,
      earthY,
      earthRadius,
      { x: 1, y: 0, z: 0 },
      earthRotationPhase(state.day, state.hour)
    );

    const axisCamera = cameraVector(EARTH_AXIS_WORLD);
    const axisLength = Math.hypot(axisCamera.x, axisCamera.y);
    const axisDx = axisCamera.x / axisLength * earthRadius * 1.55;
    const axisDy = axisCamera.y / axisLength * earthRadius * 1.55;
    line(context, earthX - axisDx, earthY - axisDy, earthX + axisDx, earthY + axisDy, '#00d4ff', 2.5);
    const equatorDx = -axisDy * 0.72;
    const equatorDy = axisDx * 0.72;
    line(context, earthX - equatorDx, earthY - equatorDy, earthX + equatorDx, earthY + equatorDy, 'rgba(238,242,255,.45)');

    const subsolarY = earthY - Math.sin(declination * DEG) * earthRadius * 0.84;
    circle(context, earthX + earthRadius * 0.84, subsolarY, 4.5, '#ffd166', '#eef2ff');
    label(context, t('North axis', '北极方向'), earthX + axisDx + 7, earthY + axisDy, '#00d4ff', 9);
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

    const mapPoint = (azimuth, altitude) => ({
      x: left + azimuth / 360 * (right - left),
      y: altitude >= 0
        ? horizonY - altitude / 90 * (horizonY - 34)
        : horizonY + Math.abs(altitude) / 90 * (height - horizonY - 28)
    });
    for (const altitude of [0, 45, 90]) {
      const point = mapPoint(0, altitude);
      line(context, left, point.y, right, point.y, altitude === 0 ? 'rgba(238,242,255,.5)' : 'rgba(238,242,255,.13)');
      label(context, `${altitude}°`, 10, point.y, '#aeb8d8', 9);
    }
    const compass = [
      [0, t('N', '北')],
      [90, t('E', '东')],
      [180, t('S', '南')],
      [270, t('W', '西')],
      [360, t('N', '北')]
    ];
    for (const [azimuth, direction] of compass) {
      const x = mapPoint(azimuth, 0).x;
      line(context, x, 20, x, height - 24, 'rgba(238,242,255,.08)');
      label(context, `${direction} · ${azimuth === 360 ? 0 : azimuth}°`, x, height - 13, '#aeb8d8', 9, 'center');
    }

    const samples = [];
    for (let hour = 0; hour <= 24.001; hour += 0.2) {
      const position = solarPosition(state.day, state.latitude, hour);
      samples.push({
        ...mapPoint(position.azimuth, position.altitude),
        altitude: position.altitude,
        azimuth: position.azimuth,
        hour
      });
    }
    const drawSegments = (visible, color, dash) => {
      context.save();
      context.strokeStyle = color;
      context.lineWidth = visible ? 3 : 2;
      context.setLineDash(dash);
      context.beginPath();
      let drawing = false;
      let previousX = 0;
      for (const point of samples) {
        const include = visible ? point.altitude >= 0 : point.altitude < 0;
        const wrapped = drawing && Math.abs(point.x - previousX) > (right - left) * 0.5;
        if (!include || wrapped) {
          drawing = false;
          if (!include) continue;
        }
        if (!drawing) {
          context.moveTo(point.x, point.y);
        } else {
          context.lineTo(point.x, point.y);
        }
        drawing = true;
        previousX = point.x;
      }
      context.stroke();
      context.restore();
    };
    drawSegments(false, 'rgba(167,139,250,.72)', [6, 6]);
    drawSegments(true, '#ffd166', []);

    const current = solarPosition(state.day, state.latitude, state.hour);
    const currentPoint = mapPoint(current.azimuth, current.altitude);
    line(context, currentPoint.x, 18, currentPoint.x, height - 26, 'rgba(0,212,255,.72)', 1.5, [4, 5]);
    drawSun(context, currentPoint.x, currentPoint.y, 7);
    label(
      context,
      t(
        `${formatClock(state.hour)} · current azimuth ${fixed(current.azimuth)}° ${azimuthName(current.azimuth)}`,
        `${formatClock(state.hour)} · 当前方位 ${fixed(current.azimuth)}° · ${azimuthName(current.azimuth)}`
      ),
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
    const moonY = northToCanvasY(axisY, state.alignment, earthRadius * 0.48);
    const shadowY = northToCanvasY(axisY, state.alignment, earthRadius);
    const earthScale = earthRadius / EARTH_RADIUS_KM;
    const penumbraPx = Math.max(8, geometry.penumbraRadius * earthScale);
    const centralPx = Math.max(3, Math.abs(geometry.signedCentralShadowRadius) * earthScale);
    systemScene.lastGeometry = {
      kind: 'solar',
      earthScale,
      penumbraRadius: penumbraPx,
      centralShadowRadius: centralPx
    };

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
    circle(context, earthX, northToCanvasY(axisY, state.observer, earthRadius), 5, '#ff6b9d', '#eef2ff');

    line(context, sunX, axisY, earthX, shadowY, 'rgba(255,209,102,.3)', 1, [4, 6]);
    label(context, t('Sun', '太阳'), sunX, axisY + 58, '#ffd166', 10, 'center');
    label(context, t('Moon', '月球'), moonX, moonY - moonRadius - 15, '#eef2ff', 10, 'center');
    label(context, t('Earth', '地球'), earthX, axisY + earthRadius + 18, '#eef2ff', 10, 'center');
    label(context, t('N ↑', '北 ↑'), earthX + earthRadius + 16, axisY - earthRadius + 2, '#00d4ff', 10);
    label(context, t('S ↓', '南 ↓'), earthX + earthRadius + 16, axisY + earthRadius - 2, '#00d4ff', 10);
    label(context, t('shadow axis', '影轴'), mix(moonX, earthX, 0.7), shadowY - 12, '#ffd166', 9, 'center');
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
    const moonY = northToCanvasY(axisY, state.alignment, earthRadius * 1.35);
    const lunarScale = moonRadius / MOON_RADIUS_KM;
    const lunarUmbraPx = geometry.lunarUmbraRadius * lunarScale;
    const lunarPenumbraPx = geometry.lunarPenumbraRadius * lunarScale;
    systemScene.lastGeometry = {
      kind: 'lunar',
      scale: lunarScale,
      moonRadius,
      umbraRadius: lunarUmbraPx,
      penumbraRadius: lunarPenumbraPx
    };

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
    label(context, t('N ↑', '北 ↑'), moonX + moonRadius + 15, axisY - earthRadius, '#00d4ff', 10);
    label(context, t('S ↓', '南 ↓'), moonX + moonRadius + 15, axisY + earthRadius, '#00d4ff', 10);
  }

  function drawSolarObserver(geometry) {
    clear(observerScene, '#10284e');
    const { context, width, height } = observerScene;
    const cx = width * 0.5;
    const cy = height * 0.47;
    const scale = Math.min(width, height) * 0.27 / geometry.sunAngularRadius;
    const sunRadius = geometry.sunAngularRadius * scale;
    const moonRadius = geometry.moonAngularRadius * scale;
    const crossTrackPx = geometry.crossTrackSeparation * scale;
    const direction = Math.sign(state.observer - state.alignment);
    const moonX = cx + Math.sign(state.eclipseProgress) * geometry.alongTrackSeparation * scale;
    const moonY = cy + crossTrackPx * direction;

    const sky = context.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#10284e');
    sky.addColorStop(1, '#331f43');
    context.fillStyle = sky;
    context.fillRect(0, 0, width, height);
    line(context, cx, 24, cx, height * 0.78, 'rgba(238,242,255,.2)', 1, [4, 5]);
    label(context, t('N ↑', '北 ↑'), cx, 16, '#00d4ff', 10, 'center');
    label(context, t('S ↓', '南 ↓'), cx, height * 0.8, '#00d4ff', 10, 'center');
    line(context, width * 0.1, moonY, width * 0.9, moonY, 'rgba(255,209,102,.28)', 1, [5, 6]);
    label(context, t('before', '食甚前'), width * 0.1, moonY - 13, '#ffd166', 9, 'center');
    label(context, t('after', '食甚后'), width * 0.9, moonY - 13, '#ffd166', 9, 'center');
    drawSun(context, cx, cy, sunRadius);
    observerScene.lastGeometry = {
      kind: 'solar',
      northUp: true,
      progress: state.eclipseProgress,
      sun: { x: cx, y: cy, radius: sunRadius },
      moon: { x: moonX, y: moonY, radius: moonRadius }
    };
    circle(context, moonX, moonY, moonRadius, '#070a12', '#d8deea', 1.2);
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
    const lunarScale = moonRadius / MOON_RADIUS_KM;
    const shadowRadius = geometry.lunarUmbraRadius * lunarScale;
    const penumbraRadius = geometry.lunarPenumbraRadius * lunarScale;
    const offset = state.alignment * (EARTH_RADIUS_KM + MOON_RADIUS_KM) * lunarScale;
    const moonX = cx + Math.sign(state.eclipseProgress) * geometry.lunarAlongTrackKm * lunarScale;

    line(context, cx, 22, cx, height * 0.78, 'rgba(238,242,255,.2)', 1, [4, 5]);
    label(context, t('N ↑', '北 ↑'), cx, 15, '#00d4ff', 10, 'center');
    label(context, t('S ↓', '南 ↓'), cx, height * 0.8, '#00d4ff', 10, 'center');
    line(context, width * 0.1, cy, width * 0.9, cy, 'rgba(255,209,102,.28)', 1, [5, 6]);
    label(context, t('before', '食甚前'), width * 0.1, cy - 13, '#ffd166', 9, 'center');
    label(context, t('after', '食甚后'), width * 0.9, cy - 13, '#ffd166', 9, 'center');
    circle(context, moonX, cy, moonRadius, '#d8deea', '#eef2ff');
    context.save();
    const shadowY = cy + offset;
    context.globalAlpha = 0.34;
    circle(context, cx, shadowY, penumbraRadius, '#6e5aa8');
    context.globalAlpha = 0.86;
    observerScene.lastGeometry = {
      kind: 'lunar',
      northUp: true,
      progress: state.eclipseProgress,
      moon: { x: moonX, y: cy, radius: moonRadius },
      shadow: { x: cx, y: shadowY, umbraRadius: shadowRadius, penumbraRadius }
    };
    circle(context, cx, shadowY, shadowRadius, '#2b1420');
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

  function updateLocationStatus() {
    const button = $('useLocation');
    button.disabled = state.locationStatus === 'pending';
    button.textContent = state.locationStatus === 'pending'
      ? t('Finding latitude…', '正在获取纬度…')
      : t('Use my current latitude', '使用我的当前纬度');
    const messages = {
      idle: '',
      pending: '',
      unavailable: t('Location is unavailable in this browser.', '此浏览器无法获取位置。'),
      error: t(
        'Location permission or positioning failed; choose a latitude manually.',
        '位置权限或定位失败；请手动选择纬度。'
      ),
      success: t(
        `Using latitude ${latitudeLabel(state.latitude)}. Longitude is not needed for local apparent solar time.`,
        `已使用纬度 ${latitudeLabel(state.latitude)}。当地真太阳时不需要经度。`
      )
    };
    $('locationStatus').textContent = messages[state.locationStatus];
  }

  function finishLocationRequest(status) {
    state.locationStatus = status;
    updateLocationStatus();
  }

  function requestCurrentLatitude() {
    state.locationStatus = 'pending';
    updateLocationStatus();
    if (!navigator.geolocation) {
      finishLocationRequest('unavailable');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      position => {
        stopPlayback();
        state.latitude = clamp(position.coords.latitude, -90, 90);
        syncInputs();
        render();
        finishLocationRequest('success');
      },
      () => {
        finishLocationRequest('error');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
    );
  }

  function renderSeasons() {
    const position = solarPosition(state.day, state.latitude, state.hour);
    const daylight = daylightInfo(state.day, state.latitude);
    const season = seasonInfo(state.day, state.latitude);
    const currentDate = displayDateLabel(state.day, state.leapDay);
    $('dayOutput').textContent = currentDate;
    $('latitudeOutput').textContent = latitudeLabel(state.latitude);
    $('timeOutput').textContent = formatClock(state.hour);
    $('dayControl').setAttribute('aria-valuetext', currentDate);
    $('latitudeControl').setAttribute('aria-valuetext', latitudeLabel(state.latitude));
    $('timeControl').setAttribute('aria-valuetext', t(`Local apparent solar time ${formatClock(state.hour)}`, `当地真太阳时 ${formatClock(state.hour)}`));

    $('systemTitle').textContent = t('Orbit viewed from north of the ecliptic', '从黄道北侧观察公转');
    $('systemSubtitle').textContent = t(
      "Earth's axis keeps nearly the same direction throughout the orbit; its tilt is 23.44°.",
      '地轴在公转过程中始终近似指向同一方向，倾角为 23.44°。'
    );
    $('observerTitle').textContent = t('Your local sky', '你的当地天空');
    $('observerSubtitle').textContent = t(
      'Looking upward toward the zenith with north up: east is left and west is right.',
      '从地面向上仰望天顶，北方朝上：东方在左，西方在右。'
    );
    $('systemLegend').innerHTML = `
      <span class="legend-key" style="--key-color:#00d4ff">${t('fixed axis direction', '固定地轴方向')}</span>
      <span class="legend-key" style="--key-color:#ff6b9d">${t('observer: solid near side · dashed far side; label shows day/night', '观察者：实心为近侧 · 虚线圈为背侧；文字标明昼夜')}</span>
      <span class="legend-key" style="--key-color:#ffd166">${t('sunlight', '太阳光')}</span>
      <span class="legend-key" style="--key-color:#7ee8c5">${t('eastward rotation ↺ from North Pole', '从北极上方看向东自转 ↺')}</span>
      <span class="legend-key" style="--key-color:#d8deea">${t('Earth & Moon orbit counter-clockwise ↺ from north', '从北侧看地球与月球均逆时针公转 ↺')}</span>`;

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
      `${currentDate}, ${latitudeLabel(state.latitude)}: ${seasonName(state.day, state.latitude)}. The Sun is ${Math.abs(position.altitude).toFixed(1)}° ${position.altitude >= 0 ? 'above' : 'below'} the horizon.`,
      `${currentDate}，${latitudeLabel(state.latitude)}：${seasonName(state.day, state.latitude)}。太阳位于地平线${position.altitude >= 0 ? '上' : '下'} ${Math.abs(position.altitude).toFixed(1)}°。`
    );
    $('seasonBadge').textContent = season.badge;
    $('seasonName').textContent = season.title;
    $('seasonDate').textContent = t(
      `${currentDate} · orbit day ${Math.floor(normalizeDay(state.day)) + 1}`,
      `${currentDate} · 公转第${Math.floor(normalizeDay(state.day)) + 1}天`
    );
    $('seasonExplanation').textContent = season.explanation;

    $('horizonDescription').textContent = t(
      'Cylindrical horizon panorama: horizontal position is compass azimuth N → E → S → W → N; vertical position is altitude. Sunrise appears near east and sunset near west, with seasonal shifts.',
      '圆柱形地平线全景：横向为罗盘方位 北 → 东 → 南 → 西 → 北；纵向为仰角。日出接近东方、日落接近西方，并随季节偏移。'
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
    $('alignmentOutput').textContent = northOffsetLabel(state.alignment);
    $('observerOutput').textContent = Math.abs(state.observer) < AXIS_EPSILON
      ? t('Centre line', '中心线')
      : `${fixed(Math.abs(state.observer), 2)} R⊕ ${state.observer > 0 ? t('north', '以北') : t('south', '以南')}`;
    $('eclipseProgressOutput').textContent = eclipseProgressLabel(state.eclipseProgress);

    $('systemTitle').textContent = state.eclipseType === 'solar'
      ? t('Where the Moon’s shadow reaches Earth', '月影落在地球何处')
      : t('How the Moon crosses Earth’s shadow', '月球如何穿过地影');
    $('systemSubtitle').textContent = state.eclipseType === 'solar'
      ? t('North-up cross-section at conjunction: the dark core is umbra or antumbra; sky motion is perpendicular to this page.', '北上南下的合时截面：暗色核心是本影或伪本影；月球在天空中的经过方向垂直于此截面。')
      : t('North-up cross-section at opposition: the Moon’s before-to-after-maximum sky motion is perpendicular to this page.', '北上南下的冲时截面：月球从食甚前到食甚后的天空运动方向垂直于此截面。');
    $('observerTitle').textContent = state.eclipseType === 'solar'
      ? t('What this observer sees', '该观察者看到什么')
      : t('View from Earth’s night side', '从地球夜半球观察');
    $('observerSubtitle').textContent = state.eclipseType === 'solar'
      ? t(`${apparentMoonDirection(state.observer, state.alignment)}. North is up; time moves left-to-right from before maximum through maximum eclipse to after maximum.`, `${apparentMoonDirection(state.observer, state.alignment)}。北上南下；时间从左向右，由食甚前经过食甚推进到食甚后。`)
      : t('North is up; the Moon moves left-to-right through Earth’s shadow from before maximum through maximum eclipse to after maximum.', '北上南下；月球从左向右穿过地影，由食甚前经过食甚推进到食甚后。');

    const centralDiameter = Math.abs(geometry.signedCentralShadowRadius) * 2;
    const shadowKind = geometry.signedCentralShadowRadius >= 0 ? t('Umbra', '本影') : t('Antumbra', '伪本影');
    $('systemLegend').innerHTML = state.eclipseType === 'solar'
      ? `<span class="legend-key" style="--key-color:#a996ff">${t('Moon penumbra', '月球半影')}</span>
        <span class="legend-key" style="--key-color:${geometry.signedCentralShadowRadius >= 0 ? '#eef2ff' : '#ff6b9d'}">${shadowKind.toLowerCase()}</span>
        <span class="legend-key" style="--key-color:#ff6b9d">${t('observer', '观察者')}</span>
        <span class="legend-key" style="--key-color:#00d4ff">${t('north ↑ / south ↓', '北 ↑ / 南 ↓')}</span>
        <span class="legend-key" style="--key-color:#ffd166">${t('middle view = conjunction cross-section', '中图 = 合时截面')}</span>`
      : `<span class="legend-key" style="--key-color:#a996ff">${t('Earth penumbra', '地球半影')}</span>
        <span class="legend-key" style="--key-color:#eef2ff">${t('Earth umbra', '地球本影')}</span>
        <span class="legend-key" style="--key-color:#d8deea">${t('Moon', '月球')}</span>
        <span class="legend-key" style="--key-color:#00d4ff">${t('north ↑ / south ↓', '北 ↑ / 南 ↓')}</span>
        <span class="legend-key" style="--key-color:#ffd166">${t('middle view = opposition cross-section', '中图 = 冲时截面')}</span>`;

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
          northOffsetLabel(state.alignment),
          Math.abs(state.observer) < AXIS_EPSILON ? t('Centre line', '中心线') : `${fixed(state.observer, 2)} R⊕`
        ]
      );
      $('liveSummary').textContent = t(
        `${eclipseProgressLabel(state.eclipseProgress)} · ${classificationName(geometry.classification)}. The north–south track stays fixed while time advances across the sky.`,
        `${eclipseProgressLabel(state.eclipseProgress)} · ${classificationName(geometry.classification)}。时间在天空中推进时，南北轨迹保持不变。`
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
          northOffsetLabel(state.alignment),
          Math.abs(state.observer) < AXIS_EPSILON ? t('Centre line', '中心线') : `${fixed(state.observer, 2)} R⊕`
        ]
      );
      $('liveSummary').textContent = t(
        `${eclipseProgressLabel(state.eclipseProgress)} · ${classificationName(geometry.classification)}. Everyone with the Moon above the horizon sees essentially the same lunar-eclipse phase.`,
        `${eclipseProgressLabel(state.eclipseProgress)} · ${classificationName(geometry.classification)}。只要月球在地平线上方，各地观察者看到的月食阶段基本相同。`
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
      ['playEclipse', 'eclipse', t('Play sky passage', '播放天空经过'), t('Pause passage', '暂停经过')]
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
    $('seasonDetailBand').hidden = !seasonsMode;
    $('orbitHint').hidden = !seasonsMode;
    $('systemCanvas').tabIndex = seasonsMode ? 0 : -1;
    $('systemCanvas').setAttribute(
      'aria-label',
      seasonsMode
        ? t('Sun Earth Moon system geometry; click the orbit to choose a date', '太阳地球月球系统几何；点击轨道可选择日期')
        : t('Sun Earth Moon eclipse and shadow geometry; north is up', '太阳地球月球食相与影区几何；北上南下')
    );
    $('observerCanvas').setAttribute(
      'aria-label',
      seasonsMode
        ? t('First-person sky-dome observer view', '第一人称天空穹顶观察视角')
        : t('First-person eclipse observer view; north is up', '第一人称食相观察视角；北上南下')
    );
    if (seasonsMode) renderSeasons();
    else renderEclipses();
    updateLocationStatus();
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
    if (state.playing === 'year') {
      state.day = (state.day + delta * DAYS / 18000) % DAYS;
      state.leapDay = false;
    }
    if (state.playing === 'eclipse') {
      state.eclipseProgress += delta * 2 / 5200;
      if (state.eclipseProgress > 1) state.eclipseProgress = -1;
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
    if (mode === 'eclipse' && (state.eclipseProgress >= 0.99 || Math.abs(state.eclipseProgress) < 0.03)) {
      state.eclipseProgress = -1;
      syncInputs();
    }
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
    $('eclipseProgressControl').value = String(state.eclipseProgress);
  }

  function bindRange(id, key) {
    $(id).addEventListener('input', event => {
      stopPlayback();
      state[key] = Number(event.currentTarget.value);
      if (key === 'day') state.leapDay = false;
      if (key === 'latitude') state.locationStatus = 'idle';
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
  bindRange('eclipseProgressControl', 'eclipseProgress');

  document.querySelectorAll('[data-lab-mode]').forEach(button => {
    button.addEventListener('click', () => {
      stopPlayback();
      state.mode = button.dataset.labMode;
      render();
    });
  });
  $('useLocation').addEventListener('click', requestCurrentLatitude);
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
      state.leapDay = false;
      syncInputs();
      render();
    });
  });
  document.querySelectorAll('[data-latitude]').forEach(button => {
    button.addEventListener('click', () => {
      stopPlayback();
      state.latitude = Number(button.dataset.latitude);
      state.locationStatus = 'idle';
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

  function selectOrbitDate(event, requireNearOrbit) {
    if (state.mode !== 'seasons' || !systemScene.orbit) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const { cx, cy, rx, ry } = systemScene.orbit;
    const normalizedRadius = Math.hypot((x - cx) / rx, (y - cy) / ry);
    if (requireNearOrbit && (normalizedRadius < 0.72 || normalizedRadius > 1.28)) return false;
    const angle = Math.atan2(-(y - cy) / ry, (x - cx) / rx);
    stopPlayback();
    state.day = normalizeDay(171 + angle / (2 * Math.PI) * DAYS);
    state.leapDay = false;
    syncInputs();
    render();
    return true;
  }

  $('systemCanvas').addEventListener('pointerdown', event => {
    if (!selectOrbitDate(event, true)) return;
    orbitDrag.active = true;
    orbitDrag.pointerId = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add('dragging');
    event.preventDefault();
  });
  $('systemCanvas').addEventListener('pointermove', event => {
    if (!orbitDrag.active || event.pointerId !== orbitDrag.pointerId) return;
    selectOrbitDate(event, false);
    event.preventDefault();
  });
  const endOrbitDrag = event => {
    if (!orbitDrag.active || event.pointerId !== orbitDrag.pointerId) return;
    orbitDrag.active = false;
    orbitDrag.pointerId = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    event.currentTarget.classList.remove('dragging');
  };
  $('systemCanvas').addEventListener('pointerup', endOrbitDrag);
  $('systemCanvas').addEventListener('pointercancel', endOrbitDrag);

  $('playDay').addEventListener('click', () => togglePlayback('day'));
  $('playYear').addEventListener('click', () => togglePlayback('year'));
  $('playEclipse').addEventListener('click', () => togglePlayback('eclipse'));
  $('seasonReset').addEventListener('click', () => {
    stopPlayback();
    Object.assign(state, {
      day: INITIAL_DATE.day,
      leapDay: INITIAL_DATE.leapDay,
      latitude: 39.9,
      hour: 12,
      locationStatus: 'idle'
    });
    syncInputs();
    render();
  });
  $('eclipseReset').addEventListener('click', () => {
    stopPlayback();
    Object.assign(state, {
      eclipseType: 'solar',
      moonDistance: 370000,
      sunDistance: SUN_EARTH_KM,
      alignment: 0,
      observer: 0,
      eclipseProgress: 0
    });
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
    isLeapYear,
    dayOfYear,
    initialDate,
    displayDateLabel,
    formatClock,
    formatDuration,
    signedDegrees,
    declinationDescription,
    projectEarthPoint,
    earthRotationAngle,
    earthRotationPhase,
    northPoleIllumination,
    counterClockwiseEllipsePoint,
    orbitScreenPoint,
    skyDomePoint,
    northToCanvasY,
    northOffsetLabel,
    apparentMoonDirection,
    eclipseProgressLabel,
    requestCurrentLatitude,
    get systemGeometry() {
      return systemScene.lastGeometry;
    },
    get observerGeometry() {
      return observerScene.lastGeometry;
    },
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
