// script.js

// === BIENVENIDA (solo la primera vez) ===
document.addEventListener("DOMContentLoaded", () => {
  // Mostrar alerta de bienvenida solo una vez
  if (!sessionStorage.getItem("bienvenida")) {
    alert("👗 ¡Bienvenida a Zweite Liebe! La moda con propósito te espera.");
    sessionStorage.setItem("bienvenida", "true");
  }

  // Inicializar carrito y mostrar beneficios en consola
  inicializarCarrito();
  mostrarBeneficios();
});

// === VARIABLES DEL CARRITO ===
let carrito = [];
let listaCarrito, total, contador, vaciarBtn, verCarritoBtn, cerrarCarritoBtn, carritoDropdown;

// === INICIALIZAR CARRITO ===
function inicializarCarrito() {
  // Obtener elementos del DOM
  listaCarrito = document.getElementById("lista-carrito");
  total = document.getElementById("total");
  contador = document.getElementById("contador-carrito");
  vaciarBtn = document.getElementById("vaciar-carrito");
  verCarritoBtn = document.getElementById("ver-carrito");
  cerrarCarritoBtn = document.getElementById("cerrar-carrito");
  carritoDropdown = document.getElementById("carrito-dropdown");

  // Cargar carrito desde localStorage si existe
  const carritoGuardado = localStorage.getItem("carrito");
  if (carritoGuardado) {
    carrito = JSON.parse(carritoGuardado);
    actualizarCarrito();
  }

  // === EVENTOS PRINCIPALES ===
  if (verCarritoBtn && carritoDropdown) {
    verCarritoBtn.addEventListener("click", () => {
      // Mostrar u ocultar el dropdown del carrito
      carritoDropdown.style.display =
        carritoDropdown.style.display === "block" ? "none" : "block";
    });
  }

  if (cerrarCarritoBtn) {
    cerrarCarritoBtn.addEventListener("click", () => {
      // Cerrar el dropdown del carrito
      carritoDropdown.style.display = "none";
    });
  }

  if (vaciarBtn) {
    vaciarBtn.addEventListener("click", vaciarCarrito);
  }

  // Asignar eventos a botones de productos para agregar al carrito
  const botones = document.querySelectorAll(".agregar-carrito");
  botones.forEach((boton) => {
    boton.addEventListener("click", agregarProducto);
  });
}

// === AGREGAR PRODUCTO ===
function agregarProducto(e) {
  const nombre = e.target.dataset.nombre;
  const precio = parseFloat(e.target.dataset.precio);

  if (!nombre || isNaN(precio)) return; // Verificar que el nombre y precio sean válidos

  // Agregar producto al carrito
  carrito.push({ nombre, precio });
  guardarCarrito(); // Guardar carrito en localStorage
  actualizarCarrito(); // Actualizar la vista del carrito

  mostrarMensaje(`${nombre} fue agregado al carrito 🛍️`); // Mostrar mensaje flotante
}

// === ACTUALIZAR CARRITO ===
function actualizarCarrito() {
  if (!listaCarrito || !total || !contador) return;

  // Limpiar el contenido previo del carrito
  listaCarrito.innerHTML = "";
  let suma = 0;

  // Agregar productos al carrito y calcular total
  carrito.forEach((item, i) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.textContent = `${item.nombre} - $${item.precio.toFixed(2)}`;

    // Crear botón para eliminar producto
    const eliminar = document.createElement("button");
    eliminar.textContent = "×";
    eliminar.className = "btn btn-sm btn-outline-danger ms-2";
    eliminar.onclick = () => {
      carrito.splice(i, 1); // Eliminar producto del carrito
      guardarCarrito(); // Guardar cambios en localStorage
      actualizarCarrito(); // Actualizar vista del carrito
    };

    li.appendChild(eliminar); // Agregar el botón eliminar al elemento de lista
    listaCarrito.appendChild(li); // Agregar item al carrito
    suma += item.precio; // Sumar precio del producto
  });

  // Actualizar total y contador de productos
  total.textContent = `Total: $${suma.toFixed(2)}`;
  contador.textContent = carrito.length;
}

// === GUARDAR EN LOCALSTORAGE ===
function guardarCarrito() {
  // Guardar el carrito en localStorage
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

// === VACIAR CARRITO ===
function vaciarCarrito() {
  if (carrito.length === 0) {
    mostrarMensaje("👜 Tu carrito ya está vacío.");
    return;
  }

  if (confirm("¿Deseas vaciar el carrito?")) {
    carrito = []; // Limpiar carrito
    guardarCarrito(); // Guardar cambios en localStorage
    actualizarCarrito(); // Actualizar vista del carrito
    mostrarMensaje("🧺 Carrito vaciado correctamente.");
  }
}

// === FUNCIÓN UTILITARIA: MENSAJE FLOTANTE ===
function mostrarMensaje(texto) {
  const mensaje = document.createElement("div");
  mensaje.textContent = texto;
  mensaje.style.position = "fixed";
  mensaje.style.bottom = "20px";
  mensaje.style.right = "20px";
  mensaje.style.background = "#B76E79";
  mensaje.style.color = "white";
  mensaje.style.padding = "10px 20px";
  mensaje.style.borderRadius = "6px";
  mensaje.style.boxShadow = "0 3px 10px rgba(0,0,0,0.2)";
  mensaje.style.zIndex = "2000";
  mensaje.style.transition = "opacity 0.5s ease";
  document.body.appendChild(mensaje);

  setTimeout(() => {
    mensaje.style.opacity = "0";
    setTimeout(() => mensaje.remove(), 500); // Eliminar mensaje después de 2 segundos
  }, 2000);
}

// === FUNCIÓN EXTRA: CÁLCULO DE DESCUENTO ===
function calcularDescuento(precio, porcentaje) {
  if (isNaN(precio) || isNaN(porcentaje)) return 0;
  return precio - (precio * porcentaje) / 100;
}

// === FUNCIÓN EXTRA: BENEFICIOS CONSOLE ===
function mostrarBeneficios() {
  const beneficios = [
    "Reduce el impacto ambiental 🌍",
    "Apoya la moda circular ♻️",
    "Fomenta la reutilización 👗",
    "Promueve la sostenibilidad 💚",
  ];

  for (let i = 0; i < beneficios.length; i++) {
    console.log(beneficios[i]);
  }
}