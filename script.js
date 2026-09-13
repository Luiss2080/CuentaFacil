const montoEl = document.getElementById('monto');
const propinaCustomEl = document.getElementById('propina-custom');
const personasEl = document.getElementById('personas');
const botonesPorcentaje = document.querySelectorAll('#botones-porcentaje button');

const resultadoPropinaEl = document.getElementById('resultado-propina');
const resultadoTotalEl = document.getElementById('resultado-total');
const resultadoPorPersonaEl = document.getElementById('resultado-por-persona');

let porcentajeSeleccionado = 15;

function formatearBs(valor) {
  const n = Number.isFinite(valor) ? valor : 0;
  return `Bs. ${n.toFixed(2)}`;
}

function calcular() {
  const monto = Math.max(0, Number(montoEl.value) || 0);
  const personas = Math.max(1, Number(personasEl.value) || 1);
  const porcentaje = Math.max(0, porcentajeSeleccionado);

  const propina = monto * (porcentaje / 100);
  const total = monto + propina;
  const porPersona = total / personas;

  resultadoPropinaEl.textContent = formatearBs(propina);
  resultadoTotalEl.textContent = formatearBs(total);
  resultadoPorPersonaEl.textContent = formatearBs(porPersona);
}

function marcarActivo(btnActivo) {
  botonesPorcentaje.forEach((b) => {
    const activo = b === btnActivo;
    b.classList.toggle('activo', activo);
    b.setAttribute('aria-pressed', String(activo));
  });
}

botonesPorcentaje.forEach((btn) => {
  btn.setAttribute('aria-pressed', btn.classList.contains('activo') ? 'true' : 'false');
  btn.addEventListener('click', () => {
    porcentajeSeleccionado = Number(btn.dataset.porcentaje);
    marcarActivo(btn);
    propinaCustomEl.value = '';
    calcular();
  });
});

propinaCustomEl.addEventListener('input', () => {
  if (propinaCustomEl.value === '') return;
  porcentajeSeleccionado = Math.max(0, Number(propinaCustomEl.value) || 0);
  marcarActivo(null);
  calcular();
});

document.getElementById('btn-mas').addEventListener('click', () => {
  personasEl.value = Math.max(1, (Number(personasEl.value) || 1) + 1);
  calcular();
});

document.getElementById('btn-menos').addEventListener('click', () => {
  personasEl.value = Math.max(1, (Number(personasEl.value) || 1) - 1);
  calcular();
});

[montoEl, personasEl].forEach((el) => el.addEventListener('input', calcular));

calcular();
