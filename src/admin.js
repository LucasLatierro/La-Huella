
import {
  SERVICIOS,
  FUNCIONARIOS,
  readBookings,
  obtenerActivas,
  obtenerBorradas,
  deleteBookingById,
  isAdminLogged,
  setAdminSession,
  ADMIN_CREDENTIALS
} from "./core/reservas.js";


//para Jest
/*const {
  SERVICIOS,
  FUNCIONARIOS,
  readBookings,
  obtenerActivas,
  obtenerBorradas,
  deleteBookingById,
  isAdminLogged,
  setAdminSession,
  ADMIN_CREDENTIALS
} = require("./core/reservas.js");
*/

function isNullOrWhitespace(texto) {
  return !texto || !texto.trim();
}

// =========================
// SELECTORES
// =========================
const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");
const adminMsg = document.getElementById("adminMsg");
const tbody = document.getElementById("bookingsTbody");
const emptyState = document.getElementById("emptyState");
const fecAdminTabla = document.getElementById("fecAdminTabla");



document.getElementById("btnFiltrarAdmin").addEventListener("click", filtrarPorDia);
function filtrarPorDia(){
  renderTable(false, fecAdminTabla.value);
}

// =========================
// RENDER Y LOGIN
// =========================
function showAdminMessage(text, type = "info") {
  adminMsg.className = `message message--${type}`;
  adminMsg.textContent = text;
}

function protectRoute() {
  if (isAdminLogged()) {
    loginSection.hidden = true;
    dashboardSection.hidden = false;

    setFechaHoy();
    renderTable();
  } else {
    loginSection.hidden = false;
    dashboardSection.hidden = true;
  }
}


// =========================
// TABLA
// =========================

function setFechaHoy() {
  const hoy = new Date();

  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, "0");
  const day = String(hoy.getDate()).padStart(2, "0");

  fecAdminTabla.value = `${year}-${month}-${day}`;
}

function renderTable(borradas, fecha) {
  let reservas;
  if (isNullOrWhitespace(borradas)) {
    reservas = obtenerActivas();
  } else {
    reservas = obtenerBorradas();
  }
  if (isNullOrWhitespace(fecha)){
    fecha = fecAdminTabla.value;
  }
  if (!isNullOrWhitespace(fecha)){
    reservas = reservas.filter(r => r.fecha === fecha);
  }
  reservas.sort(
    (a, b) => {
      const da = new Date(`${a.fecha}T${a.hora}:00`);
      const db = new Date(`${b.fecha}T${b.hora}:00`);
      return da - db;
    }
  );

  emptyState.hidden = reservas.length !== 0;

  tbody.innerHTML = reservas
    .map(r => {
      const prof = FUNCIONARIOS.find(f => f.id === r.profesional)?.nombre || r.profesional;
      const serv = SERVICIOS.find(s => s.id === r.servicio)?.nombre || r.servicio;

      return `
      <tr>
        <td>${r.fecha}</td>
        <td>${r.hora}</td>
        <td>${escapeHtml(r.mascota)}</td>
        <td>${escapeHtml(prof)}</td>
        <td>${escapeHtml(serv)}</td>
        <td><button data-id="${r.id}" class="btn btn--danger btn--sm">Borrar</button></td>
      </tr>`;
    })
    .join("");

  tbody.querySelectorAll("button[data-id]").forEach(b => {
    b.onclick = confirmarBorrar;
  });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// =========================
// BORRAR RESERVA
// =========================
function confirmarBorrar() {
  const modal = document.getElementById("receiptAdmin");
  modal.hidden = false;

  document.getElementById("btnReceiptBorrar").dataset.id = this.dataset.id;
}

document.getElementById("btnReceiptCancelar").onclick = () => {
  document.getElementById("receiptAdmin").hidden = true;
};

document.getElementById("btnReceiptBorrar").onclick = function () {
  deleteBookingById(this.dataset.id);
  document.getElementById("receiptAdmin").hidden = true;
  renderTable();
};


// =========================
// LOGIN FORM
// =========================
document.getElementById("adminLoginForm").addEventListener("submit", e => {
  e.preventDefault();

  const user = document.getElementById("adminUser").value.trim();
  const pass = document.getElementById("adminPass").value;

  if (user === ADMIN_CREDENTIALS.user && pass === ADMIN_CREDENTIALS.pass) {
    setAdminSession(true);
    showAdminMessage("Ingreso correcto.", "success");
    protectRoute();
  } else {
    showAdminMessage("Credenciales inválidas.", "error");
  }
});

document.getElementById("logoutBtn").onclick = () => {
  setAdminSession(false);
  protectRoute();
};


// =========================
// START
// =========================
protectRoute();

//export {
// =========================================
// EXPORT PARA JEST
// =========================================
if (typeof module !== "undefined") {
  module.exports = {
    isNullOrWhitespace,
    escapeHtml,
    showAdminMessage,
    renderTable,
    protectRoute,
    confirmarBorrar
  };
} // para Jest