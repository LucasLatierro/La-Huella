import { SERVICIOS, FUNCIONARIOS, GALERIA, obtenerHorariosDisponibles, validarReserva, haySuperposicion, guardarReserva } from "./core/reservas.js";
//const { SERVICIOS, FUNCIONARIOS, GALERIA, obtenerHorariosDisponibles, validarReserva, haySuperposicion, guardarReserva } = require("./core/reservas.js");

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
let galIndex = 0;
let autoplayInterval = null;
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
    servicioSelect.innerHTML += `<option value="${s.id}" class="${s.tipo}">${s.nombre}</option>`;
  });

  // Render tarjetas en la sección servicios
  const cards = document.getElementById("servicesCards");
  cards.innerHTML = SERVICIOS.map(s =>
    `
    <div class="card s-${s.id}">
      <a href="#reserva">
        <img src="${s.img}" alt="${s.nombre}" href="#reserva">
        <h3>${s.nombre}</h3>
        <p>Precio base: $${s.precio}</p>
      </a>
    </div>
  `).join("");

  asignarBotonesPorClase("card", reservarConTarjeta);
}

function asignarBotonesPorClase(clase, funcion) {
  let botones = document.querySelectorAll("." + clase);
  for (let i = 0; i < botones.length; i++) {
    const element = botones[i];
    element.addEventListener("click", funcion);
  }
}

function reservarConTarjeta() {
  if (this.className.includes("unias")) {
    servicioSelect.value = "unias";
  } else if (this.className.includes("corte")) {
    servicioSelect.value = "corte";
  } else if (this.className.includes("banio")) {
    servicioSelect.value = "banio";
  } else if (this.className.includes("medica")) {
    servicioSelect.value = "medica";
  }
  servicioSelect.dispatchEvent(new Event('change'));

}


// ========================
// PROFESIONALES
// ========================
function servToProf() {
  limpiarSelect(profesionalSelect, "Elegí un profesional");
  const tipo = servicioSelect.value;
  FUNCIONARIOS.filter(f => f.tipo.includes(tipo)).forEach(f => {
    profesionalSelect.innerHTML += `<option value="${f.id}">${f.nombre}</option>`;
  });
}

// ========================
// HORARIOS
// ========================
function cargarHorarios() {
  const fecha = fechaInput.value + "-00:00:00";
  const profesional = profesionalSelect.value;

  if (!fecha || !profesional) return;

  if (new Date(fecha).getDay() === 0) {
    limpiarSelect(horaSelect, "Los domingos no se atiende");
  } else {
    limpiarSelect(horaSelect, "Seleccioná horario");
  }

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
function cargarGaleria() {
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
  iniciarAutoplay();
}
function iniciarAutoplay() {
  autoplayInterval = setInterval(() => {
    galIndex = (galIndex + 1) % GALERIA.length;
    actualizarGaleria();
  }, 4000); // cambia cada 4 segundos
}

function actualizarGaleria() {
  const img = document.getElementById("carouselImage");
  const dots = document.querySelectorAll("#carouselDots button");

  img.src = GALERIA[galIndex].src;
  img.alt = GALERIA[galIndex].alt;

  // Quitar clase activa a todos
  dots.forEach(dot => dot.classList.remove("active"));

  // Activar el correspondiente
  if (dots[galIndex]) {
    dots[galIndex].classList.add("active");
  }
}


// ========================
// RESERVA
// ========================
function confirmarReserva(e) {
  e.preventDefault();

  let reserva = obtenerDatos();

  const valid = validarReserva(reserva);
  if (!valid.valido) {
    mensaje.textContent = valid.mensaje;
    return;
  }

  reserva.id = crypto.randomUUID();
  if (reserva.servicio == `peluqueria`) reserva.precio = 1800;
  if (reserva.servicio == `medica`) reserva.precio = 500;
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
    hora: horaSelect.value,
    precio: 1,
    esActiva: true
  };
}


// Confirmación
function mostrarConfirmacion(booking) {
  let profName = FUNCIONARIOS.find(p => p.id === booking.profesional);
  profName = profName.nombre;
  receiptText.textContent = `${capitalize(booking.duenio)}, acabaste de reservar a ${profName} para ${capitalize(booking.mascota)}! Fecha y hora: ${booking.fecha} - ${booking.hora} • Precio: $${booking.precio}`;
  receipt.hidden = false;
}

function capitalize(nombre) {
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
}

// Helpers

// ========================
// limpiarSelect
// ========================
function limpiarSelect(sel, texto) {
  sel.innerHTML = `<option disabled selected>${texto}</option>`;
}