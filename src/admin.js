import {
  SERVICIOS,
  FUNCIONARIOS,
  readBookings,
  deleteBookingById,
  isAdminLogged,
  setAdminSession,
  ADMIN_CREDENTIALS
} from "./core/reservas.js";


// =========================
// SELECTORES
// =========================
const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");
const adminMsg = document.getElementById("adminMsg");
const tbody = document.getElementById("bookingsTbody");
const emptyState = document.getElementById("emptyState");


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
    renderTable();
  } else {
    loginSection.hidden = false;
    dashboardSection.hidden = true;
  }
}


// =========================
// TABLA
// =========================
function renderTable() {
  const reservas = readBookings().sort((a, b) => {
    const da = new Date(`${a.fecha}T${a.hora}:00`);
    const db = new Date(`${b.fecha}T${b.hora}:00`);
    return da - db;
  });

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