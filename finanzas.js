const ingresos = [
  { categoria: "Supervisión", color: "#4CAF50" },
  { categoria: "Profesorado", color: "#66BB6A" },
  { categoria: "Clases particulares", color: "#81C784" },
  { categoria: "Cursos", color: "#A5D6A7" },
  { categoria: "Otros", color: "#C8E6C9" }
];

const egresos = [
  { categoria: "Alquiler", color: "#f44336" },
  { categoria: "Almacén", color: "#e91e63" },
  { categoria: "Auto", color: "#9c27b0" },
  { categoria: "Celular", color: "#673ab7" },
  { categoria: "Combustible", color: "#3f51b5" },
  { categoria: "Entretenimiento", color: "#2196f3" },
  { categoria: "Farmacia", color: "#03a9f4" },
  { categoria: "Google", color: "#00bcd4" },
  { categoria: "Impuestos", color: "#009688" },
  { categoria: "Internet", color: "#4caf50" },
  { categoria: "Librería", color: "#8bc34a" },
  { categoria: "Mascotas", color: "#cddc39" },
  { categoria: "Netflix", color: "#ffeb3b" },
  { categoria: "Natalia", color: "#ffc107" },
  { categoria: "Salud", color: "#ff9800" },
  { categoria: "Supermercado", color: "#ff5722" },
  { categoria: "Tarjeta AE", color: "#795548" },
  { categoria: "Tarjeta Master", color: "#9e9e9e" },
  { categoria: "Tarjeta Visa", color: "#607d8b" },
  { categoria: "Estudios", color: "#b71c1c" },
  { categoria: "Verdulería", color: "#1b5e20" },
  { categoria: "Varios", color: "#5d4037" }
];

let movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];
let saldo = 0;

function mostrarCategorias(tipo) {
  const contenedor = document.getElementById("categorias");
  contenedor.innerHTML = "";
  const lista = tipo === "Ingreso" ? ingresos : egresos;
  lista.forEach(item => {
    const btn = document.createElement("button");
    btn.textContent = item.categoria;
    btn.style.backgroundColor = item.color;
    btn.onclick = () => registrarMovimiento(tipo, item.categoria, item.color);
    contenedor.appendChild(btn);
  });
}

function registrarMovimiento(tipo, categoria, color) {
  const monto = parseFloat(prompt(`Ingrese monto para ${tipo} (${categoria})`));
  if (isNaN(monto) || monto <= 0) return;

  const fecha = new Date();
  movimientos.push({ tipo, categoria, monto, color, fecha });
  guardarEnLocalStorage();
  actualizarUI();
}

function eliminarMovimiento(index) {
  if (!confirm("¿Eliminar este movimiento?")) return;
  movimientos.splice(index, 1);
  guardarEnLocalStorage();
  actualizarUI();
}

function editarMovimiento(index) {
  const mov = movimientos[index];
  const nuevoMonto = parseFloat(prompt("Nuevo monto:", mov.monto));
  if (isNaN(nuevoMonto) || nuevoMonto <= 0) return;

  const nuevaCategoria = prompt("Nueva categoría:", mov.categoria) || mov.categoria;

  const nuevaFechaInput = prompt("Nueva fecha y hora (YYYY-MM-DD HH:mm):", 
    mov.fecha.toISOString().slice(0,16).replace('T',' '));
  const nuevaFecha = nuevaFechaInput ? new Date(nuevaFechaInput.replace(' ', 'T')) : mov.fecha;

  saldo -= mov.tipo === 'Ingreso' ? mov.monto : -mov.monto;
  saldo += mov.tipo === 'Ingreso' ? nuevoMonto : -nuevoMonto;

  mov.monto = nuevoMonto;
  mov.categoria = nuevaCategoria;
  mov.fecha = nuevaFecha;

  guardarEnLocalStorage();
  actualizarUI();
}

function actualizarUI() {
  const lista = document.getElementById("movimientos");
  lista.innerHTML = "";

  const filtroMes = document.getElementById("filtroMes").value;
  const filtroTipo = document.getElementById("filtroTipo").value;

  saldo = 0;

  const meses = new Set();

  movimientos
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .forEach((mov, index) => {
      const fecha = new Date(mov.fecha);
      const mes = fecha.toISOString().slice(0, 7);
      meses.add(mes);

      if ((filtroMes && mes !== filtroMes) || (filtroTipo && mov.tipo !== filtroTipo)) return;

      if (mov.tipo === "Ingreso") saldo += mov.monto;
      else saldo -= mov.monto;

      const li = document.createElement("li");
      li.innerHTML = `<span>${fecha.toLocaleString()} - ${mov.tipo} (${mov.categoria})</span>
                      <span>$${mov.monto}
                        <button class="btn-eliminar" onclick="eliminarMovimiento(${index})">Eliminar</button>
                        <button class="btn-editar" onclick="editarMovimiento(${index})">Editar</button>
                      </span>`;
      lista.appendChild(li);
    });

  document.getElementById("saldo").textContent = `Saldo: $${saldo.toFixed(2)}`;

  const selectMes = document.getElementById("filtroMes");
  selectMes.innerHTML = `<option value="">Todos los meses</option>`;
  [...meses].sort().forEach(m => {
    const op = document.createElement("option");
    op.value = m;
    op.textContent = m;
    selectMes.appendChild(op);
  });

  actualizarGrafico();
}

function actualizarGrafico() {
  const porMes = {};
  const porCategoria = {};
  const ahora = new Date();
  const mesActual = ahora.toISOString().slice(0, 7);

  movimientos.forEach(m => {
    const mes = new Date(m.fecha).toISOString().slice(0, 7);
    porMes[mes] = (porMes[mes] || 0) + (m.tipo === "Ingreso" ? m.monto : -m.monto);

    if (mes === mesActual) {
      const clave = m.categoria;
      porCategoria[clave] = porCategoria[clave] || { monto: 0, color: m.color };
      porCategoria[clave].monto += m.tipo === "Ingreso" ? m.monto : -m.monto;
    }
  });

  const ctx1 = document.getElementById("grafico").getContext("2d");
  new Chart(ctx1, {
    type: "bar",
    data: {
      labels: Object.keys(porMes),
      datasets: [{
        label: "Saldo mensual",
        data: Object.values(porMes),
        backgroundColor: "#4caf50"
      }]
    }
  });

  const ctx2 = document.getElementById("graficoCategorias").getContext("2d");
  new Chart(ctx2, {
    type: "pie",
    data: {
      labels: Object.keys(porCategoria),
      datasets: [{
        data: Object.values(porCategoria).map(v => v.monto),
        backgroundColor: Object.values(porCategoria).map(v => v.color)
      }]
    }
  });
}

function guardarEnLocalStorage() {
  localStorage.setItem("movimientos", JSON.stringify(movimientos));
}

window.onload = actualizarUI;
