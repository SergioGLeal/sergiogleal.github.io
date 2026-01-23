const formulario = document.getElementById("formulario");
const listaTareasTodo = document.getElementById("lista-tareas-todo");
const listaTareasInProgress = document.getElementById("lista-tareas-in-progress");
const listaTareasDone = document.getElementById("lista-tareas-done");

const listas = {
    todo: listaTareasTodo,
    "in-progress": listaTareasInProgress,
    done: listaTareasDone
};

document.addEventListener("DOMContentLoaded", () => {
    mostrarTareas();
    inicializarDragAndDrop();
});

formulario.addEventListener("submit", agregarTarea);

function agregarTarea(e) {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value.trim();
    const prioridad = document.getElementById("prioridad").value;

    if (!titulo) return;

    const tarea = {
        id: Date.now(),
        titulo,
        prioridad,
        status: "todo" // Empieza en To Do
    };

    const tareas = obtenerTareas();
    tareas.push(tarea);
    guardarTareas(tareas);

    formulario.reset();
    mostrarTareas();
}

function mostrarTareas() {
    Object.values(listas).forEach(lista => lista.innerHTML = "");

    const tareas = obtenerTareas();

    tareas.forEach(tarea => {
        const li = crearTareaElemento(tarea);
        listas[tarea.status].appendChild(li);
    });
}

function crearTareaElemento(tarea) {
    const li = document.createElement("li");
    li.classList.add("task-item");
    li.draggable = true;
    li.dataset.id = tarea.id;
    li.dataset.status = tarea.status;

    li.innerHTML = `
        <div class="task-info">
            <strong>${tarea.titulo}</strong>
            <span class="prioridad ${tarea.prioridad.toLowerCase()}">Prioridad: ${tarea.prioridad}</span>
        </div>
        <div class="botones">
            <button onclick="editarTarea(${tarea.id})"><i class="bi bi-pencil-square"></i></button>
            <button onclick="eliminarTarea(${tarea.id})"><i class="bi bi-trash"></i></button>
        </div>
    `;

    return li;
}

function editarTarea(id) {
    const tareas = obtenerTareas();
    const tarea = tareas.find(t => t.id === id);
    const nuevoTitulo = prompt("Editar tarea:", tarea.titulo);
    if (nuevoTitulo !== null && nuevoTitulo.trim()) {
        tarea.titulo = nuevoTitulo.trim();
        guardarTareas(tareas);
        mostrarTareas();
    }
}

function eliminarTarea(id) {
    let tareas = obtenerTareas();
    tareas = tareas.filter(t => t.id !== id);
    guardarTareas(tareas);
    mostrarTareas();
}

function inicializarDragAndDrop() {
    Object.values(listas).forEach(lista => {
        lista.addEventListener("dragover", e => e.preventDefault());
        lista.addEventListener("drop", e => {
            e.preventDefault();
            const id = e.dataTransfer.getData("text/plain");
            const tarea = obtenerTareas().find(t => t.id == id);
            if (tarea) {
                tarea.status = e.target.closest(".kanban-column").dataset.status;
                guardarTareas(obtenerTareas());
                mostrarTareas();
            }
        });
    });

    document.querySelectorAll(".task-item").forEach(item => {
        item.addEventListener("dragstart", e => {
            e.dataTransfer.setData("text/plain", item.dataset.id);
        });
    });
}

// Helpers localStorage
function obtenerTareas() {
    return JSON.parse(localStorage.getItem("tareas")) || [];
}

function guardarTareas(tareas) {
    localStorage.setItem("tareas", JSON.stringify(tareas));
}