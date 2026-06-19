(function() {
  const container = document.getElementById('timeline');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'mapBgCanvas';
  canvas.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    z-index: 0;
    pointer-events: none;
    opacity: 0;
    transition: opacity 1.5s ease;
  `;
  document.body.insertBefore(canvas, document.body.firstChild);

  const cities = [
    {name:'Москва',      lon:37.6,  lat:55.75, r:4.0},
    {name:'Санкт-Петербург', lon:30.3, lat:59.95, r:3.0},
    {name:'Екатеринбург',lon:60.6,  lat:56.85, r:2.5},
    {name:'Новосибирск', lon:82.9,  lat:55.05, r:2.5},
    {name:'Владивосток', lon:131.9, lat:43.1,  r:2.0},
    {name:'Казань',      lon:49.1,  lat:55.8,  r:2.0},
    {name:'Сочи',        lon:39.7,  lat:43.6,  r:2.0},
    {name:'Грозный',     lon:45.7,  lat:43.3,  r:1.8},
    {name:'Красноярск',  lon:92.9,  lat:56.0,  r:2.0},
    {name:'Хабаровск',   lon:135.1, lat:48.5,  r:2.0},
    {name:'Мурманск',    lon:33.1,  lat:68.97, r:1.8},
    {name:'Калининград', lon:20.5,  lat:54.7,  r:1.8},
    {name:'Якутск',      lon:129.7, lat:62.0,  r:1.8},
  ];

  // Простая проекция Меркатора
  function project(lon, lat, W, H) {
    // Центр карты подобран под Россию
    const scale = W * 0.27;
    const centerLon = 95, centerLat = 62;
    const x = W * 0.42 + (lon - centerLon) * (scale / 57.3);
    const latRad = lat * Math.PI / 180;
    const centerLatRad = centerLat * Math.PI / 180;
    const y = H * 0.48 - (Math.log(Math.tan(Math.PI/4 + latRad/2)) -
              Math.log(Math.tan(Math.PI/4 + centerLatRad/2))) * scale;
    return [x, y];
  }

  let paths2d = [];
  let pulseT = cities.map((_, i) => i * 0.7);
  let animId;
  let W, H;

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    buildPaths();
  }

  function buildPaths() {
    paths2d = [];
    if (!window._russiaGeo) return;
    window._russiaGeo.features.forEach(feature => {
      const geom = feature.geometry;
      const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
      polys.forEach(poly => {
        poly.forEach(ring => {
          const p = new Path2D();
          ring.forEach(([lon, lat], i) => {
            const [x, y] = project(lon, lat, W, H);
            i === 0 ? p.moveTo(x, y) : p.lineTo(x, y);
          });
          p.closePath();
          paths2d.push(p);
        });
      });
    });
  }

  function draw() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);

    // Регионы России
    paths2d.forEach(p => {
      ctx.fillStyle = 'rgba(184,146,42,0.07)';
      ctx.fill(p);
      ctx.strokeStyle = 'rgba(184,146,42,0.22)';
      ctx.lineWidth = 0.7;
      ctx.stroke(p);
    });

    // Сетка
    ctx.strokeStyle = 'rgba(180,160,100,0.08)';
    ctx.lineWidth = 0.5;
    for (let gx = 0; gx <= W; gx += W/10) {
      ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,H); ctx.stroke();
    }
    for (let gy = 0; gy <= H; gy += H/7) {
      ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(W,gy); ctx.stroke();
    }

    // Города
    cities.forEach((city, i) => {
      const [x, y] = project(city.lon, city.lat, W, H);
      if (x < 0 || x > W || y < 0 || y > H) return;
      pulseT[i] += 0.018;
      const pulse = (Math.sin(pulseT[i]) + 1) / 2;

      // Пульсирующее кольцо
      ctx.beginPath();
      ctx.arc(x, y, city.r + 4 + pulse * 6, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(196,30,36,${0.08 + 0.14 * (1 - pulse)})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Точка
      ctx.beginPath();
      ctx.arc(x, y, city.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(196,30,36,0.55)';
      ctx.fill();
    });

    animId = requestAnimationFrame(draw);
  }

  // Загружаем GeoJSON
  fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
    .then(r => r.json())
    .then(world => {
      window._russiaGeo = {
        type: 'FeatureCollection',
        features: world.features.filter(f => f.properties.name === 'Russia')
      };
      resize();
      canvas.style.opacity = '0.85';
      draw();
    })
    .catch(e => console.warn('Карта не загружена:', e));

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resize();
  });
})();
