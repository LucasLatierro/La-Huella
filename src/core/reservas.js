// =========================================
// DATA DEL SISTEMA
// =========================================

// Servicios del sistema
const SERVICIOS = [
  { id: "peluqueria", nombre: "Peluquería - Corte", precio: 1800, img: "src/img/servicio-corte.jpg" },
  { id: "peluqueria", nombre: "Peluquería - Baño", precio: 1800, img: "src/img/servicio-baño.jpg" },
  { id: "peluqueria", nombre: "Peluquería - Corte de uñas", precio: 1800, img: "src/img/servicio-corte-uñas.jpg" },
  { id: "medica", nombre: "Atención médica", precio: 500, img: "src/img/servicio-medico.jpg" }
];

// Funcionarios del sistema
const FUNCIONARIOS = [
  { id: "salud-1", tipo: "medica", nombre: "Dra. Sofía", foto: "src/img/equipo-1.jpg" },
  { id: "salud-2", tipo: "medica", nombre: "Dra. Valentina", foto: "src/img/equipo-2.jpg" },
  { id: "salud-3", tipo: "medica", nombre: "Dra. Camila", foto: "src/img/equipo-3.jpg" },
  { id: "estetica-1", tipo: "peluqueria", nombre: "Peluquera Mía", foto: "src/img/equipo-4.jpg" },
  { id: "estetica-2", tipo: "peluqueria", nombre: "Peluquera Lola", foto: "src/img/equipo-5.jpg" },
  { id: "estetica-3", tipo: "peluqueria", nombre: "Peluquera Alma", foto: "src/img/equipo-6.jpg" }
];

// Galería
const GALERIA = [
  { src: "src/img/galeria-1-1920x1080.jpg", alt: "Trabajo realizado 1" },
  { src: "src/img/galeria-2-1920x1080.jpg", alt: "Trabajo realizado 2" },
  { src: "src/img/galeria-3-1920x1080.jpg", alt: "Trabajo realizado 3" }
];

// Login admin
const ADMIN_CREDENTIALS = { user: "admin", pass: "1234" };


// =========================================
// STORAGE (SIN DOM)
// =========================================

const STORAGE_KEYS = {
  RESERVAS: "huella_reservas",
  ADMIN_SESSION: "huella_admin_session"
};

function readBookings() {
  const raw = localStorage.getItem(STORAGE_KEYS.RESERVAS);
  try {
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeBookings(list) {
  localStorage.setItem(STORAGE_KEYS.RESERVAS, JSON.stringify(list));
}

function guardarReserva(reserva) {
  const reservas = readBookings();
  reservas.push(reserva);
  writeBookings(reservas);
}

function deleteBookingById(id) {
  let reservas = readBookings();
  reservas.forEach(element => {
    if (element.id === id) {
      element.esActiva = false;
    }
  });
  writeBookings(reservas);
}

function obtenerReservas() {
  return readBookings();
}

function obtenerReservasFP(fecha, profesionalId) {
  return readBookings().filter(r => r.profesional === profesionalId && r.fecha === fecha && r.esActiva === true);
}

function obtenerActivas() {
  return readBookings().filter(r => r.esActiva === true);
}

function obtenerBorradas() {
  return readBookings().filter(r => r.esActiva === false);
}

function isAdminLogged() {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === "1";
}

function setAdminSession(isLogged) {
  localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, isLogged ? "1" : "0");
}


// =========================================
// HORARIOS
// =========================================

function generarHorarios(fecha) {
  const dia = new Date(fecha).getDay();
  if (dia === 0) return [];

  const horaCierre = dia === 6 ? 12.5 : 18;
  const horarios = [];

  let hora = 9;
  let minutos = 0;

  while (hora < horaCierre) {
    horarios.push(`${hora.toString().padStart(2, "0")}:${minutos.toString().padStart(2, "0")}`);
    minutos += 30;
    if (minutos >= 60) {
      minutos = 0;
      hora++;
    }
  }
  return horarios;
}

function obtenerHorariosDisponibles(fecha, profesionalId) {
  const horarios = generarHorarios(fecha);
  const reservas = obtenerReservasFP(fecha, profesionalId);
  const esEstetica = profesionalId.charAt(0) == "e";
  
  let ocupados = [];
  let delta = 0;
  if (esEstetica){
    delta++;
  }
  while (ocupados.length < horarios.length - delta) {
    ocupados.push(0);
  }

  for (let i = 0; i < reservas.length; i++) {
    const r = reservas[i];
    let coincide = false;
    for (let j = 0; j < horarios.length - 1 && !coincide; j++) {
      if (j === 0 && r.hora === horarios[0]) {
        ocupados[j++] = 1;
        if (esEstetica){
          ocupados[j] = 1;
        }
        coincide = true;
      } else if (r.hora === horarios[j + 1]) {
        ocupados[j++] = 1;
        if (esEstetica){
          ocupados[j++] = 1;
          ocupados[j] = 1;
        }
        coincide = true;
      }
    }
  }

  let aRetornar = [];
  for (let i = 0; i < horarios.length; i++) {
    const o = ocupados[i];
    if (o === 0) {
      aRetornar.push(horarios[i]);
    }
  }
  return aRetornar;
}


// =========================================
// VALIDACIONES
// =========================================

function validarReserva(reserva) {
  if (Object.values(reserva).some(v => !v)) {
    return { valido: false, mensaje: "Todos los campos son obligatorios." };
  }

  if (isNaN(reserva.documento)) {
    return { valido: false, mensaje: "El documento debe ser numérico." };
  }

  if (new Date(reserva.fecha).getDay() === 0) {
    return { valido: false, mensaje: "Los domingos no se atiende." };
  }

  return { valido: true };
}

function haySuperposicion(nueva) {
  return obtenerReservas().some(
    r =>
      r.fecha === nueva.fecha &&
      r.hora === nueva.hora &&
      r.profesional === nueva.profesional
  );
}

/*if (typeof module !== "undefined") { module.exports = { // para Jest
  SERVICIOS, FUNCIONARIOS, GALERIA, ADMIN_CREDENTIALS, STORAGE_KEYS, readBookings, obtenerActivas, obtenerBorradas, writeBookings, guardarReserva, deleteBookingById, obtenerReservas, isAdminLogged, setAdminSession, generarHorarios, obtenerHorariosDisponibles, validarReserva, haySuperposicion }
; } // para Jest
*/

export {
   SERVICIOS, FUNCIONARIOS, GALERIA, ADMIN_CREDENTIALS, STORAGE_KEYS, readBookings, obtenerActivas, obtenerBorradas, writeBookings, guardarReserva, deleteBookingById, obtenerReservas, isAdminLogged, setAdminSession, generarHorarios, obtenerHorariosDisponibles, validarReserva, haySuperposicion }
; // para html