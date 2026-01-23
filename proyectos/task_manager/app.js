const formulario = document.getElementById("formulario");
const listaTareas = document.getElementById("lista-tareas");

document.addEventListener("DOMContentLoaded", mostrarTareas);
formulario.addEventListener("submit", agregarTarea);

// CREATE
function agregarTarea(e) {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const prioridad = document.getElementById("prioridad").value;

    const tarea = {
        id: Date.now(),
        titulo,
        prioridad
    };

    const tareas = obtenerTareas();
    tareas.push(tarea);
    guardarTareas(tareas);

    formulario.reset();
    mostrarTareas();
}

// READ
function mostrarTareas() {
    listaTareas.innerHTML = "";

    const tareas = obtenerTareas();

    tareas.forEach(tarea => {
        const li = document.createElement("li");

        li.innerHTML = `
            <div class="tarea-info">
                <strong>${tarea.titulo}</strong>
                <span class="prioridad">Prioridad: ${tarea.prioridad}</span>
            </div>
            <div class="botones">
                <button onclick="editarTarea(${tarea.id})">✏️</button>
                <button onclick="eliminarTarea(${tarea.id})">🗑️</button>
            </div>
        `;

        listaTareas.appendChild(li);
    });
}

// UPDATE
function editarTarea(id) {
    let tareas = obtenerTareas();
    const tarea = tareas.find(t => t.id === id);

    const nuevoTitulo = prompt("Editar tarea:", tarea.titulo);
    if (nuevoTitulo !== null && nuevoTitulo.trim() !== "") {
        tarea.titulo = nuevoTitulo;
        guardarTareas(tareas);
        mostrarTareas();
    }
}

// DELETE
function eliminarTarea(id) {
    let tareas = obtenerTareas();
    tareas = tareas.filter(t => t.id !== id);
    guardarTareas(tareas);
    mostrarTareas();
}

// localStorage helpers
function obtenerTareas() {
    return JSON.parse(localStorage.getItem("tareas")) || [];
}

function guardarTareas(tareas) {
    localStorage.setItem("tareas", JSON.stringify(tareas));
}
