// script.js
// Zweite Liebe - Interactividad con JavaScript
// ---------------------------------------------

// Mensaje de bienvenida al cargar la página
window.addEventListener("load", function() {
  alert("🌿 Bienvenido/a a Zweite Liebe: la segunda vida de la moda de lujo 🌿");
});

// Contador de visitas (operador de incremento y localStorage)
let visitas = localStorage.getItem("visitas");
if (!visitas) {
  visitas = 0;
}
visitas++; // operador de incremento
localStorage.setItem("visitas", visitas);

console.log("Número de visitas a la página:", visitas);

// Mostrar mensaje con operadores de comparación
if (visitas === 1) {
  alert("¡Es tu primera visita! Gracias por conocernos 💚");
} else if (visitas < 5) {
  alert(`Gracias por visitarnos de nuevo (${visitas} veces). ¡Nos alegra verte! 👗`);
} else {
  alert(`¡Wow! Ya has visitado esta página ${visitas} veces 😍`);
}

// Función para validar un campo adicional del formulario
function validarMensaje() {
  const mensaje = document.getElementById("mensaje").value.trim();

  if (mensaje.length < 10) {
    alert("📝 Tu mensaje es muy corto. Cuéntanos un poco más, por favor.");
    return false; // corta el envío
  } else {
    return true;
  }
}

// Interceptar el envío del formulario para aplicar nuestra función
const formulario = document.querySelector("form");
formulario.addEventListener("submit", function(event) {
  if (!validarMensaje()) {
    event.preventDefault(); // detiene el envío si no pasa la validación
  } else {
    alert("💌 ¡Gracias por contactarnos! Pronto te responderemos.");
  }
});

// Pequeña animación con bucles (for y break)
function mostrarFrasesInspiradoras() {
  const frases = [
    "La moda sostenible nunca pasa de moda.",
    "Cada prenda tiene una segunda oportunidad.",
    "Compra con conciencia, viste con propósito."
  ];

  // Mostramos cada frase con un bucle for
  for (let i = 0; i < frases.length; i++) {
    console.log(frases[i]);
    if (i === 2) break; // usamos break para detener el bucle
  }
}

mostrarFrasesInspiradoras();

// Ejemplo de while: simulamos una cuenta regresiva
let cuenta = 3;
while (cuenta > 0) {
  console.log(`Preparando página en ${cuenta}...`);
  cuenta--;
}
console.log("Página lista para explorar 💫");
