const {
  SERVICIOS,
  FUNCIONARIOS,
  GALERIA,
  ADMIN_CREDENTIALS,
  STORAGE_KEYS,
  readBookings,
  writeBookings,
  guardarReserva,
  deleteBookingById,
  obtenerReservas,
  isAdminLogged,
  setAdminSession,
  generarHorarios,
  obtenerHorariosDisponibles,
  validarReserva,
  haySuperposicion
} = require("../src/core/reservas.js")

test("existen funcionarios", () => {
  expect(FUNCIONARIOS.length).toBeGreaterThan(0);
});

test("hay 6 funcionarios", () => {
  expect(FUNCIONARIOS.length).toBe(6);
});

test("existen servicios", () => {
  expect(SERVICIOS.length).toBeGreaterThan(0);
});

test("hay 4 servicios", () => {
  expect(SERVICIOS.length).toBe(4);
});

test("chequea credenciales admin", () => {
  expect(ADMIN_CREDENTIALS.user).toEqual("admin");
  expect(ADMIN_CREDENTIALS.pass).toEqual("1234");
});

test("genera 0 horarios un domingo", () => {
  expect(generarHorarios(new Date(2026, 1, 1)).length).toBe(0);
});

test("genera 18 horarios un dia de semana", () => {
  expect(generarHorarios(new Date(2026, 1, 2)).length).toBe(18);
  expect(generarHorarios(new Date(2026, 1, 3)).length).toBe(18);
  expect(generarHorarios(new Date(2026, 1, 4)).length).toBe(18);
  expect(generarHorarios(new Date(2026, 1, 5)).length).toBe(18);
  expect(generarHorarios(new Date(2026, 1, 6)).length).toBe(18);
});

test("genera 8 horarios un sabado", () => {
  expect(generarHorarios(new Date(2026, 1, 7)).length).toBe(8);
});