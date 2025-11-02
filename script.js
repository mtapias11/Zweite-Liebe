// script.js

// === WILKOMMEN ZURÜCK (solo la primera vez) ===
document.addEventListener("DOMContentLoaded", () => {
  try {
    if (!sessionStorage.getItem("bienvenida")) {
      if (typeof window !== "undefined" && typeof window.alert === "function") {
        alert("👗 ¡Wilkommen a Zweite Liebe! La moda con propósito te espera.");
      }
      sessionStorage.setItem("bienvenida", "true");
    }
  } catch (err) {
    console.warn("sessionStorage no disponible:", err);
  }

  inicializarCarrito();
  inicializarFormulario();
});

// === VARIABLES DEL CARRITO ===
let carrito = [];
let listaCarrito, total, contador, vaciarBtn, verCarritoBtn, cerrarCarritoBtn, carritoDropdown, checkoutBtn;

// Evitar múltiples listeners sobre el mismo botón
const seenButtons = new WeakSet();

// Observador para botones dinámicos
let observer = null;

// === INICIALIZAR CARRITO ===
function inicializarCarrito() {
  // Obtener elementos (pueden no existir en todas las páginas)
  listaCarrito = document.getElementById("lista-carrito");
  total = document.getElementById("total");
  contador = document.getElementById("contador-carrito");
  vaciarBtn = document.getElementById("vaciar-carrito");
  verCarritoBtn = document.getElementById("ver-carrito");
  cerrarCarritoBtn = document.getElementById("cerrar-carrito");
  carritoDropdown = document.getElementById("carrito-dropdown");
  checkoutBtn = document.getElementById("checkout-btn");

  // Cargar carrito desde localStorage (manejo robusto)
  try {
    const carritoGuardado = localStorage.getItem("carrito");
    if (carritoGuardado) {
      const parsed = JSON.parse(carritoGuardado);
      carrito = Array.isArray(parsed) ? parsed : [];
    } else {
      carrito = [];
    }
  } catch (err) {
    console.warn("Error leyendo carrito de localStorage; iniciando vacío:", err);
    carrito = [];
    try { localStorage.removeItem("carrito"); } catch {}
  }

  actualizarCarrito();

  // Eventos UI (si existen)
  if (verCarritoBtn && carritoDropdown) {
    verCarritoBtn.addEventListener("click", () => {
      carritoDropdown.style.display = carritoDropdown.style.display === "block" ? "none" : "block";
    });
  }

  if (cerrarCarritoBtn && carritoDropdown) {
    cerrarCarritoBtn.addEventListener("click", () => {
      carritoDropdown.style.display = "none";
    });
  }

  if (vaciarBtn) vaciarBtn.addEventListener("click", vaciarCarrito);

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (carrito.length === 0) {
        mostrarMensaje("Tu carrito está vacío. Agrega productos antes de pagar.");
        return;
      }
      mostrarMensaje("Gracias por tu compra. Procesando pedido...");
      // Simulación de checkout: limpiar carrito
      carrito = [];
      guardarCarrito();
      actualizarCarrito();
    });
  }

  // Registrar botones actuales y observar DOM para botones dinámicos
  registrarBotonesAgregar(document);
  observarBotonesDinamicos();
}

// === AGREGAR PRODUCTO (manejo de cantidades) ===
// Espera botones con atributos data-nombre y data-precio opcionales data-id
function agregarProducto(e) {
  const btn = e.currentTarget || e.target;
  const host = (btn && btn.dataset && btn.dataset.nombre) ? btn : (btn.closest ? btn.closest("[data-nombre][data-precio]") : null);

  const nombre = host?.dataset?.nombre ? String(host.dataset.nombre).trim() : "";
  const precio = parsePrecio(host?.dataset?.precio);
  const id = host?.dataset?.id ? String(host.dataset.id).trim() : nombre || undefined;

  if (!nombre || Number.isNaN(precio)) {
    mostrarMensaje("Producto inválido — no se agregó al carrito.");
    return;
  }

  // Buscar por id si existe, si no por nombre
  const key = id || nombre;
  const idx = carrito.findIndex(it => (it.id || it.nombre) === key);
  if (idx > -1) {
    carrito[idx].cantidad = (Number(carrito[idx].cantidad) || 1) + 1;
  } else {
    carrito.push({ id, nombre, precio: Number(precio), cantidad: 1 });
  }

  guardarCarrito();
  actualizarCarrito();
  mostrarMensaje(`${nombre} fue agregado al carrito 🛍️`);
}

// Robust price parser: acepta "12.34", "12,34", "$1,234.56", "1.234,56"
function parsePrecio(raw) {
  if (raw == null) return NaN;
  const s = String(raw).trim().replace(/\s+/g, "");
  const cleaned = s.replace(/[^\d.,-]/g, "");
  if (cleaned.indexOf(",") > -1 && cleaned.indexOf(".") === -1) {
    return parseFloat(cleaned.replace(",", "."));
  }
  const normalized = cleaned.replace(/,(?=\d{3}\b)/g, "");
  return parseFloat(normalized);
}

// === REGISTRAR BOTONES AGREGAR ===
function registrarBotonesAgregar(root) {
  if (!root || !root.querySelectorAll) return;
  const selector = ".agregar-carrito, [data-nombre][data-precio]";
  const botones = root.querySelectorAll(selector);
  botones.forEach(boton => {
    if (seenButtons.has(boton)) return;
    boton.addEventListener("click", agregarProducto);
    if (!boton.hasAttribute("aria-label") && boton.dataset && boton.dataset.nombre) {
      boton.setAttribute("aria-label", `Agregar ${boton.dataset.nombre} al carrito`);
    }
    seenButtons.add(boton);
  });
}

// Observador para elementos dinámicos
function observarBotonesDinamicos() {
  if (typeof MutationObserver === "undefined") return;
  if (observer) return;
  let t;
  observer = new MutationObserver(() => {
    clearTimeout(t);
    t = setTimeout(() => registrarBotonesAgregar(document), 100);
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "data-nombre", "data-precio"] });
}

// === ACTUALIZAR CARRITO ===
function actualizarCarrito() {
  // Si no existe la UI de carrito, no intentar renderizar (pero no romper)
  if (!listaCarrito || !total || !contador) {
    // Aún así actualizar contador del DOM si existe
    try { if (contador) contador.textContent = carrito.length; } catch {}
    return;
  }

  listaCarrito.innerHTML = "";
  let suma = 0;

  if (carrito.length === 0) {
    const vacio = document.createElement("li");
    vacio.className = "list-group-item";
    vacio.textContent = "Tu carrito está vacío.";
    listaCarrito.appendChild(vacio);
  }

  carrito.forEach((item, i) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex flex-column";

    // Fila superior: nombre + subtotal
    const topRow = document.createElement("div");
    topRow.className = "d-flex justify-content-between align-items-center w-100";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = item.nombre;
    nameSpan.style.fontWeight = "500";

    const itemTotal = (Number(item.precio) || 0) * (Number(item.cantidad) || 1);
    const subtotal = document.createElement("span");
    subtotal.textContent = `$${itemTotal.toFixed(2)}`;

    topRow.appendChild(nameSpan);
    topRow.appendChild(subtotal);

    // Fila inferior: precio unitario, controles de cantidad y acciones
    const bottomRow = document.createElement("div");
    bottomRow.className = "d-flex justify-content-between align-items-center w-100 mt-2";

    const leftGroup = document.createElement("div");
    leftGroup.className = "d-flex align-items-center gap-2";

    const priceSmall = document.createElement("small");
    priceSmall.textContent = `Unit: $${Number(item.precio).toFixed(2)}`;

    // Controles de cantidad
    const qtyControl = document.createElement("div");
    qtyControl.className = "d-flex align-items-center gap-1";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.className = "btn btn-sm btn-outline-secondary";
    minus.textContent = "−";
    minus.setAttribute("aria-label", `Disminuir cantidad de ${item.nombre}`);
    minus.addEventListener("click", () => {
      if ((Number(item.cantidad) || 1) <= 1) {
        carrito.splice(i, 1);
      } else {
        item.cantidad = Number(item.cantidad) - 1;
      }
      guardarCarrito();
      actualizarCarrito();
    });

    const qtyInput = document.createElement("input");
    qtyInput.type = "number";
    qtyInput.min = "1";
    qtyInput.value = Number(item.cantidad) || 1;
    qtyInput.style.width = "64px";
    qtyInput.className = "form-control form-control-sm";
    qtyInput.addEventListener("change", () => {
      let v = Number(qtyInput.value);
      if (Number.isNaN(v) || v < 1) v = 1;
      item.cantidad = v;
      guardarCarrito();
      actualizarCarrito();
    });

    const plus = document.createElement("button");
    plus.type = "button";
    plus.className = "btn btn-sm btn-outline-secondary";
    plus.textContent = "+";
    plus.setAttribute("aria-label", `Aumentar cantidad de ${item.nombre}`);
    plus.addEventListener("click", () => {
      item.cantidad = (Number(item.cantidad) || 1) + 1;
      guardarCarrito();
      actualizarCarrito();
    });

    qtyControl.appendChild(minus);
    qtyControl.appendChild(qtyInput);
    qtyControl.appendChild(plus);

    leftGroup.appendChild(priceSmall);
    leftGroup.appendChild(qtyControl);

    const rightGroup = document.createElement("div");
    const eliminar = document.createElement("button");
    eliminar.textContent = "Eliminar";
    eliminar.className = "btn btn-sm btn-outline-danger";
    eliminar.type = "button";
    eliminar.setAttribute("aria-label", `Eliminar ${item.nombre}`);
    eliminar.addEventListener("click", () => {
      carrito.splice(i, 1);
      guardarCarrito();
      actualizarCarrito();
    });

    rightGroup.appendChild(eliminar);
    bottomRow.appendChild(leftGroup);
    bottomRow.appendChild(rightGroup);

    li.appendChild(topRow);
    li.appendChild(bottomRow);
    listaCarrito.appendChild(li);

    suma += itemTotal;
  });

  total.textContent = `Total: $${suma.toFixed(2)}`;
  contador.textContent = carrito.length;
}

// === GUARDAR EN LOCALSTORAGE ===
function guardarCarrito() {
  try {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  } catch (err) {
    console.error("No se pudo guardar el carrito en localStorage:", err);
    mostrarMensaje("No se pudo guardar el carrito localmente.");
  }
}

// === VACIAR CARRITO ===
function vaciarCarrito() {
  if (carrito.length === 0) {
    mostrarMensaje("👜 Tu carrito ya está vacío.");
    return;
  }

  const proceed = (typeof window !== "undefined" && typeof window.confirm === "function")
    ? confirm("¿Deseas vaciar el carrito?")
    : true;

  if (!proceed) return;

  carrito = [];
  guardarCarrito();
  actualizarCarrito();
  mostrarMensaje("🧺 Carrito vaciado correctamente.");
}

// === MENSAJES (toasts) ===
const TOAST_CONTAINER_ID = "__toast_container__";
function ensureToastContainer() {
  let c = document.getElementById(TOAST_CONTAINER_ID);
  if (c) return c;
  c = document.createElement("div");
  c.id = TOAST_CONTAINER_ID;
  Object.assign(c.style, {
    position: "fixed",
    right: "20px",
    bottom: "20px",
    zIndex: 2000,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    alignItems: "flex-end",
    pointerEvents: "none"
  });
  c.setAttribute("aria-live", "polite");
  document.body.appendChild(c);
  return c;
}

function mostrarMensaje(texto, ms = 2200) {
  const container = ensureToastContainer();
  const mensaje = document.createElement("div");
  mensaje.textContent = texto;
  mensaje.setAttribute("role", "status");
  mensaje.style.pointerEvents = "auto";
  Object.assign(mensaje.style, {
    background: "#B76E79",
    color: "white",
    padding: "10px 16px",
    borderRadius: "8px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
    transition: "opacity 0.25s ease, transform 0.25s ease",
    opacity: "0",
    transform: "translateY(6px)",
    maxWidth: "320px",
    wordWrap: "break-word"
  });
  container.appendChild(mensaje);

  requestAnimationFrame(() => {
    mensaje.style.opacity = "1";
    mensaje.style.transform = "translateY(0)";
  });

  setTimeout(() => {
    mensaje.style.opacity = "0";
    mensaje.style.transform = "translateY(6px)";
    setTimeout(() => {
      try { mensaje.remove(); } catch {}
    }, 250);
  }, ms);
}

// === CÁLCULO DE DESCUENTO (helper) ===
function calcularDescuento(precio, porcentaje) {
  const p = Number(precio);
  const pct = Number(porcentaje);
  if (Number.isNaN(p) || Number.isNaN(pct)) return 0;
  return p - (p * pct) / 100;
}

// === FORMULARIO: mostrar mensaje al enviar ===
function inicializarFormulario() {
  const selectors = ["#contact-form", ".contact-form", "form[data-role='contact-form']"];
  let form = selectors.map(s => document.querySelector(s)).find(f => f) || document.querySelector("form");

  if (!form) {
    if (typeof MutationObserver === "undefined") return;
    const formObserver = new MutationObserver((mutations, o) => {
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length) {
          for (const n of m.addedNodes) {
            if (n.nodeType === 1) {
              const f = (n.matches && n.matches("form")) ? n : (n.querySelector && n.querySelector("form"));
              if (f) {
                attachFormListener(f);
                try { o.disconnect(); } catch {}
                return;
              }
            }
          }
        }
      }
    });
    formObserver.observe(document.body, { childList: true, subtree: true });
    return;
  }
  attachFormListener(form);
}

function attachFormListener(form) {
  if (!form || form.__attached) return;
  form.__attached = true;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    mostrarMensaje("¡Mensaje enviado! Gracias por contactarnos 💌");
    try { form.reset(); } catch {}
    // Si se desea envío por AJAX mostrar mensaje tras respuesta exitosa.
  });
}

// Export helpers para pruebas (si aplica)
try {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { parsePrecio, calcularDescuento };
  }
} catch {}