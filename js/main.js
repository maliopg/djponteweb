/* DJ PONTE v2 — main.js */

/* Menú móvil */
const toggle = document.querySelector('.nav-toggle');
const links  = document.querySelector('.nav-links');
if(toggle && links){
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('click', e => {
    if(!e.target.closest('.nav') && links.classList.contains('open'))
      links.classList.remove('open');
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
  form.addEventListener('submit', e => {
    e.preventDefault();
    const nombre = form.nombre.value.trim();
    const tipo   = form.tipo.value;
    const fecha  = form.fecha.value;
    const plan   = form.plan.value.trim();
    const num    = form.dataset.wa;
    let msg = `Hola Emilio, soy ${nombre}. Quiero consultar disponibilidad para: ${tipo}`;
    if(fecha) msg += ` el ${fecha}`;
    if(plan)  msg += `. ${plan}`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
  });
}
