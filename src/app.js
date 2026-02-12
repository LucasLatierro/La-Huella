import {
  SERVICIOS,
  FUNCIONARIOS,
  GALERIA,
  obtenerHorariosDisponibles,
  validarReserva,
  haySuperposicion,
  guardarReserva
} from "./core/reservas.js";


// ========================
// SELECTORES
// ========================
const servicioSelect = document.getElementById("servicio");
const profesionalSelect = document.getElementById("profesional");
const fechaInput = document.getElementById("fecha");
const horaSelect = document.getElementById("hora");
const form = document.getElementById("bookingForm");
const mensaje = document.getElementById("formMessage");


// ========================
// INICIALIZACIÓN
// ========================
cargarServicios();
cargarEquipo();
cargarGaleria();
registrarEventos();


function registrarEventos() {
  servicioSelect.addEventListener("change", servToProf);
  profesionalSelect.addEventListener("change", cargarHorarios);
  fechaInput.addEventListener("change", cargarHorarios);

  form.addEventListener("submit", confirmarReserva);

  document.getElementById("btnClear").addEventListener("click", () => {
    form.reset();
    limpiarSelect(profesionalSelect, "Elegí servicio primero");
    limpiarSelect(horaSelect, "Elegí una fecha primero");
  });

  document.getElementById("btnReceiptAceptar").addEventListener("click", () => {
    document.getElementById("receipt").hidden = true;
  });
}


// ========================
// SERVICIOS
// ========================

function cargarServicios() {
  servicioSelect.innerHTML = `<option disabled selected>Seleccioná un servicio</option>`;

  SERVICIOS.forEach(s => {
    servicioSelect.innerHTML += `<option value="${s.id}">${s.nombre}</option>`;
  });

  // Render tarjetas en la sección servicios
  const cards = document.getElementById("servicesCards");
  cards.innerHTML = SERVICIOS.map(s =>
    `
    <div class="card">
      <h3>${s.nombre}</h3>
      <p>Precio base: $${s.precio}</p>
    </div>
  `).join("");
}


// ========================
// PROFESIONALES
// ========================
function servToProf() {
  limpiarSelect(profesionalSelect, "Elegí un profesional");
  const tipo = document.getElementById("servicio").value;
  FUNCIONARIOS.filter(f => f.tipo === tipo).forEach(f => {
    profesionalSelect.innerHTML += `<option value="${f.id}">${f.nombre}</option>`;
  });
}

// ========================
// HORARIOS
// ========================
function cargarHorarios() {
  limpiarSelect(horaSelect, "Seleccioná horario");

  const fecha = fechaInput.value;
  const profesional = profesionalSelect.value;

  if (!fecha || !profesional) return;

  const horarios = obtenerHorariosDisponibles(fecha, profesional);

  if (horarios.length === 0) {
    horaSelect.innerHTML += `<option disabled>No hay horarios disponibles</option>`;
    return;
  }

  horarios.forEach(h => {
    horaSelect.innerHTML += `<option value="${h}">${h}</option>`;
  });
}


// ========================
// EQUIPO
// ========================
function cargarEquipo() {
  const cont = document.getElementById("teamCards");

  cont.innerHTML = FUNCIONARIOS.map(f =>
    `
    <div class="team-card">
      <img src="${f.foto}" alt="${f.nombre}">
      <h3>${f.nombre}</h3>
      <p>${f.tipo === "medica" ? "Área médica" : "Peluquería"}</p>
    </div>
  `).join("");
}


// ========================
// GALERÍA
// ========================
let galIndex = 0;

function cargarGaleria() {
  const img = document.getElementById("carouselImage");
  const dots = document.getElementById("carouselDots");

  actualizarGaleria();

  document.getElementById("prevSlide").onclick = () => {
    galIndex = (galIndex - 1 + GALERIA.length) % GALERIA.length;
    actualizarGaleria();
  };

  document.getElementById("nextSlide").onclick = () => {
    galIndex = (galIndex + 1) % GALERIA.length;
    actualizarGaleria();
  };


  dots.innerHTML = GALERIA.map((_, i) => `<button data-dot="${i}"></button>`).join("");

  dots.querySelectorAll("button").forEach(b =>
    b.addEventListener("click", () => {
      galIndex = Number(b.dataset.dot);
      actualizarGaleria();
    })
  );
}

function actualizarGaleria() {
  const img = document.getElementById("carouselImage");
  img.src = GALERIA[galIndex].src;
  img.alt = GALERIA[galIndex].alt;
}


// ========================
// RESERVA
// ========================
function confirmarReserva(e) {
  e.preventDefault();

  const reserva = obtenerDatos();

  const valid = validarReserva(reserva);
  if (!valid.valido) {
    mensaje.textContent = valid.mensaje;
    return;
  }

  if (haySuperposicion(reserva)) {
    mensaje.textContent = "Ese horario ya está ocupado.";
    return;
  }

  reserva.id = crypto.randomUUID();
  guardarReserva(reserva);

  mostrarConfirmacion(reserva);

  form.reset();
  mensaje.textContent = "";
}


// Obtiene los datos del formulario
function obtenerDatos() {
  return {
    documento: document.getElementById("documento").value,
    duenio: document.getElementById("duenio").value,
    mascota: document.getElementById("mascota").value,
    telefono: document.getElementById("telefono").value,
    servicio: servicioSelect.value,
    profesional: profesionalSelect.value,
    fecha: fechaInput.value,
    hora: horaSelect.value
  };
}


// Confirmación
function mostrarConfirmacion(r) {
  const rec = document.getElementById("receipt");
  document.getElementById("receiptText").textContent =
    `Reserva para ${r.fecha} a las ${r.hora}. Pagos en el local.`;

  rec.hidden = false;
}


// Helpers

// ========================
// limpiarSelect
// ========================
function limpiarSelect(sel, texto) {
  sel.innerHTML = `<option disabled selected>${texto}</option>`;
}