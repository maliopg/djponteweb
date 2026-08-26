/* Fix scroll restaurado por Safari iOS */
if(history.scrollRestoration) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

/* DJ PONTE v2 — main.js */

/* Menú móvil */
const toggle = document.querySelector('.nav-toggle');
const links  = document.querySelector('.nav-links');
if(toggle && links){
  function setMenu(open, returnFocus = false){
    links.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    if(returnFocus) toggle.focus();
  }

  toggle.addEventListener('click', () => {
    setMenu(!links.classList.contains('open'));
  });
  document.addEventListener('click', e => {
    if(!e.target.closest('.nav') && links.classList.contains('open'))
      setMenu(false);
  });
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape' && links.classList.contains('open'))
      setMenu(false, true);
  });
}

/* Año en footer */
document.querySelectorAll('.year').forEach(el => {
  el.textContent = new Date().getFullYear();
});

/* Carrusel universal — sin forced reflow */
document.querySelectorAll('[data-carousel]').forEach(wrap => {
  const track = wrap.querySelector('.carousel-track');
  const dots  = wrap.querySelectorAll('.c-dot');
  const total = dots.length;
  let cur = 0;

  /* Cachear perView para evitar reflow en cada frame */
  let cachedPerView = getPerView();
  function getPerView(){
    /* matchMedia no causa reflow — más eficiente que innerWidth */
    if(window.matchMedia('(min-width:960px)').matches) return 3;
    if(window.matchMedia('(min-width:640px)').matches) return 2;
    return 1;
  }

  const steps = () => Math.ceil(total / cachedPerView);

  function go(n){
    const s = steps();
    cur = ((n % s) + s) % s;
    /* Usar CSS custom property para evitar recálculo de layout */
    track.style.transform = `translateX(-${cur * (100 / cachedPerView)}%)`;
    dots.forEach((d,i) => d.classList.toggle('on', Math.floor(i / cachedPerView) === cur));
  }

  wrap.querySelector('.c-prev')?.addEventListener('click', () => go(cur - 1));
  wrap.querySelector('.c-next')?.addEventListener('click', () => go(cur + 1));
  dots.forEach((d, i) => d.addEventListener('click', () => go(i)));

  let timer = setInterval(() => go(cur + 1), 5000);
  wrap.addEventListener('mouseenter', () => clearInterval(timer));
  wrap.addEventListener('mouseleave', () => { timer = setInterval(() => go(cur + 1), 5000); });

  /* Touch */
  let tx = 0;
  track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, {passive:true});
  track.addEventListener('touchend',   e => {
    const dx = tx - e.changedTouches[0].clientX;
    if(Math.abs(dx) > 40) go(dx > 0 ? cur + 1 : cur - 1);
  }, {passive:true});

  /* Resize: actualizar caché con debounce para no disparar reflow continuamente */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cachedPerView = getPerView();
      go(0);
    }, 150);
  });
});

/* Formulario contacto → WhatsApp */
const form = document.getElementById('form-contacto');
if(form){
  const tipos = Object.freeze({
    boda: 'una boda',
    cumpleanos: 'un cumpleaños',
    'evento-privado': 'un evento privado',
    empresa: 'un evento de empresa',
    'vermu-tardeo': 'un vermú o tardeo',
    'vinyl-set': 'un Vinyl Set',
    otro: 'otro evento'
  });

  const servicio = new URLSearchParams(window.location.search).get('servicio');
  if(servicio && Object.prototype.hasOwnProperty.call(tipos, servicio))
    form.tipo.value = servicio;

  const clean = (value, max) => value.replace(/\s+/g, ' ').trim().slice(0, max);
  const fechaEs = value => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : '';
  };

  form.addEventListener('submit', e => {
    e.preventDefault();
    const nombre    = clean(form.nombre.value, 60);
    const tipo      = tipos[form.tipo.value];
    const fecha     = fechaEs(form.fecha.value);
    const localidad = clean(form.localidad.value, 80);
    const plan      = clean(form.plan.value, 240);
    const num    = form.dataset.wa;
    if(!nombre || !tipo) return;

    let msg = `Hola Emilio, soy ${nombre}. Estoy buscando DJ para ${tipo}`;
    if(fecha) msg += ` el ${fecha}`;
    if(localidad) msg += ` en ${localidad}`;
    msg += '. ';
    if(plan) msg += `${plan}${/[.!?…]$/.test(plan) ? '' : '.'} `;
    msg += 'He llegado desde djponte.com y quería consultar disponibilidad.';

    window.location.assign(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`);
  });
}
