// Versión con función editar incluida

// Código base omitido para brevedad...

function editarMovimiento(index) {
  const mov = movimientos[index];

  const nuevoMonto = parseFloat(prompt("Nuevo monto:", mov.monto));
  if (isNaN(nuevoMonto) || nuevoMonto <= 0) return;

  const nuevaCategoria = prompt("Nueva categoría:", mov.categoria) || mov.categoria;

  const nuevaFechaInput = prompt("Nueva fecha y hora (YYYY-MM-DD HH:mm):", 
    mov.fecha.toISOString().slice(0,16).replace('T',' '));
  const nuevaFecha = nuevaFechaInput ? new Date(nuevaFechaInput.replace(' ', 'T')) : mov.fecha;

  // Ajustar el saldo
  saldo -= mov.tipo === 'Ingreso' ? mov.monto : -mov.monto;
  saldo += mov.tipo === 'Ingreso' ? nuevoMonto : -nuevoMonto;

  // Aplicar cambios
  mov.monto = nuevoMonto;
  mov.categoria = nuevaCategoria;
  mov.fecha = nuevaFecha;

  guardarEnLocalStorage();
  actualizarUI();
}
