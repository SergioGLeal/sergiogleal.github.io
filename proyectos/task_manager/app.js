// Elementos del DOM
const formulario = document.getElementById("formulario");
const listaTodo       = document.getElementById("lista-tareas-todo");
const listaInProgress = document.getElementById("lista-tareas-in-progress");
const listaDone       = document.getElementById("lista-tareas-done");

const listas = {
    "todo":        listaTodo,
    "in-progress": listaInProgress,
    "done":        listaDone
};

// Normalizar status para evitar inconsistencias
function normalizarStatus(status) {
    if (!status) return "todo";
    const s = status.toLowerCase().trim();
    if (s.includes("progress") || s === "in-progress") return "in-progress";
    if (s.includes("done") || s === "completed") return "done";
    return "todo";
}

// Cargar al inicio
document.addEventListener("DOMContentLoaded", () => {
    mostrarTareas();
    inicializarDragAndDrop();
});

// Agregar tarea
formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    const titulo    = document.getElementById("titulo").value.trim();
    const prioridad = document.getElementById("prioridad").value;

    if (!titulo) {
        alert("Escribe una tarea primero");
        return;
    }

    const tarea = {
        id: Date.now(),
        titulo,
        prioridad,
        status: "todo"
    };

    const tareas = obtenerTareas();
    tareas.push(tarea);
    guardarTareas(tareas);

    formulario.reset();
    mostrarTareas();
});

// Renderizar
function mostrarTareas() {
    Object.values(listas).forEach(lista => {
        if (lista) lista.innerHTML = "";
    });

    const tareas = obtenerTareas();

    tareas.forEach(tarea => {
        const statusNormal = normalizarStatus(tarea.status);
        const lista = listas[statusNormal];

        if (!lista) {
            console.warn(`No se encontró columna para status: "${tarea.status}" → usando "todo"`);
            listas["todo"]?.appendChild(crearElementoTarea(tarea));
            return;
        }

        lista.appendChild(crearElementoTarea(tarea));
    });

    inicializarDragAndDrop();
}

function crearElementoTarea(tarea) {
    const li = document.createElement("li");
    li.classList.add("task-item");
    li.draggable = true;
    li.dataset.id = tarea.id;
    li.dataset.status = tarea.status;

    li.innerHTML = `
        <div class="task-info">
            <strong>${tarea.titulo}</strong>
            <span class="prioridad ${tarea.prioridad.toLowerCase()}">
                ${tarea.prioridad}
            </span>
        </div>
        <div class="botones">
            <button onclick="editarTarea(${tarea.id})" title="Editar">
                <i class="bi bi-pencil-square"></i>
            </button>
            <button onclick="eliminarTarea(${tarea.id})" title="Eliminar">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;

    return li;
}

// Editar / Eliminar (sin cambios, pero con save + refresh)
function editarTarea(id) {
    const tareas = obtenerTareas();
    const tarea = tareas.find(t => t.id === id);
    if (!tarea) return;

    const nuevo = prompt("Editar tarea:", tarea.titulo);
    if (nuevo !== null && nuevo.trim()) {
        tarea.titulo = nuevo.trim();
        guardarTareas(tareas);
        mostrarTareas();
    }
}

function eliminarTarea(id) {
    if (!confirm("¿Eliminar esta tarea?")) return;
    let tareas = obtenerTareas();
    tareas = tareas.filter(t => t.id !== id);
    guardarTareas(tareas);
    mostrarTareas();
}

// Drag & Drop
function inicializarDragAndDrop() {
    document.querySelectorAll(".task-item").forEach(item => {
        item.addEventListener("dragstart", e => {
            e.dataTransfer.setData("text/plain", item.dataset.id);
            item.classList.add("dragging");
        });
        item.addEventListener("dragend", () => item.classList.remove("dragging"));
    });

    document.querySelectorAll(".kanban-column").forEach(col => {
        col.addEventListener("dragover", e => {
            e.preventDefault();
            col.classList.add("drag-over");
        });
        col.addEventListener("dragleave", () => col.classList.remove("drag-over"));
        col.addEventListener("drop", e => {
            e.preventDefault();
            col.classList.remove("drag-over");
            const id = e.dataTransfer.getData("text/plain");
            const tareas = obtenerTareas();
            const tarea = tareas.find(t => t.id == id);
            if (tarea) {
                tarea.status = col.dataset.status;
                guardarTareas(tareas);
                mostrarTareas();
            }
        });
    });
}

// localStorage
function obtenerTareas() {
    return JSON.parse(localStorage.getItem("tareas") || "[]");
}

function guardarTareas(tareas) {
    localStorage.setItem("tareas", JSON.stringify(tareas));
}