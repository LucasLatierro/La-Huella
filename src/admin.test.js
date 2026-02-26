const {
  isNullOrWhitespace,
  escapeHtml,
  showAdminMessage,
  renderTable,
  protectRoute,
  confirmarBorrar
} = require("../src/admin.js");


// ============================
// TESTS FUNCIONES
// ============================

test("isNullOrWhitespace existe", function(){
    const resultado = isNullOrWhitespace;

    expect(resultado).toBeTruthy();
});

test("escapeHtml existe", function(){
    const resultado = escapeHtml;

    expect(resultado).toBeTruthy();
});

test("showAdminMessage existe", function(){
    const resultado = showAdminMessage;

    expect(resultado).toBeTruthy();
});

test("renderTable existe", function(){
    const resultado = renderTable;

    expect(resultado).toBeTruthy();
});

test("protectRoute existe", function(){
    const resultado = protectRoute;

    expect(resultado).toBeTruthy();
});

test("confirmarBorrar existe", function(){
    const resultado = confirmarBorrar;

    expect(resultado).toBeTruthy();
});


// ============================
// TESTS FUNCIONALES SIMPLES
// ============================

test("isNullOrWhitespace devuelve true con string vacio", function(){
    const resultado = isNullOrWhitespace("");

    expect(resultado).toBe(true);
});

test("isNullOrWhitespace devuelve false con texto", function(){
    const resultado = isNullOrWhitespace("hola");

    expect(resultado).toBe(false);
});

test("escapeHtml reemplaza < correctamente", function(){
    const resultado = escapeHtml("<script>");

    expect(resultado).toBe("&lt;script&gt;");
});

test("escapeHtml reemplaza & correctamente", function(){
    const resultado = escapeHtml("a & b");

    expect(resultado).toBe("a &amp; b");
});
