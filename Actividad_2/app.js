
const iconos = [
  "images/icon1.jpg",
  "images/icon2.jpg",
  "images/icon3.jpg",
  "images/icon4.jpg",
  "images/icon5.jpg",
  "images/icon6.jpg",
  "images/icon7.jpg",
  "images/icon8.jpg"
];


class Tarea {
  constructor(nombre, completa = false, icono) {
    this.id = Date.now();
    this.nombre = nombre;
    this.completa = completa;
    this.icono = icono;
  }

  editar(nuevoNombre) {
    this.nombre = nuevoNombre;
  }

  cambiarEstado() {
    this.completa = !this.completa;
  }
}



// ===== Clase GestorDeTareas =====
class GestorDeTareas {
  constructor() {
    this.tareas = JSON.parse(localStorage.getItem("tareas")) || [];
    this.lista = document.getElementById("lista-tareas");
    this.render();
  }

  guardarEnLocalStorage() {
    localStorage.setItem("tareas", JSON.stringify(this.tareas));
  }

  agregarTarea(nombre) {
    const iconoAleatorio = iconos[Math.floor(Math.random() * iconos.length)];
    const tarea = new Tarea(nombre, false, iconoAleatorio);
    this.tareas.push(tarea);
    this.guardarEnLocalStorage();
    this.render();
  }

  eliminarTarea(id) {
    this.tareas = this.tareas.filter(tarea => tarea.id !== id);
    this.guardarEnLocalStorage();
    this.render();
  }

  editarTarea(id) {
    const tarea = this.tareas.find(t => t.id === id);
    const nuevoNombre = prompt("Editar tarea:", tarea.nombre);

    if (nuevoNombre && nuevoNombre.trim() !== "") {
      tarea.editar(nuevoNombre);
      this.guardarEnLocalStorage();
      this.render();
    }
  }

  cambiarEstado(id) {
    const tarea = this.tareas.find(t => t.id === id);
    tarea.cambiarEstado();
    this.guardarEnLocalStorage();
    this.render();
  }

  render() {
    this.lista.innerHTML = "";

    this.tareas.forEach(tarea => {
      const li = document.createElement("li");
      li.className = tarea.completa ? "completa" : "";

      li.innerHTML = `
      <img src="${tarea.icono}" class="icono">  
      <span>${tarea.nombre}</span>
        <div>
          <button onclick="gestor.cambiarEstado(${tarea.id})">✔</button>
          <button onclick="gestor.editarTarea(${tarea.id})">Editar</button>
          <button onclick="gestor.eliminarTarea(${tarea.id})">Eliminar</button>
        </div>
      `;

      this.lista.appendChild(li);
    });
  }
}

// ===== Inicialización =====
const gestor = new GestorDeTareas();

const inputTarea = document.getElementById("nueva-tarea");
const btnAgregar = document.getElementById("agregar-tarea");
const mensajeError = document.getElementById("mensaje-error");

btnAgregar.addEventListener("click", () => {
  const texto = inputTarea.value.trim();

  if (texto === "") {
    mensajeError.textContent = "No puedes agregar una tarea vacía.";
    return;
  }

  mensajeError.textContent = "";
  gestor.agregarTarea(texto);
  inputTarea.value = "";
});
