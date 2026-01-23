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

// Cargar al inicio
document.addEventListener("DOMContentLoaded", () => {
    mostrarTareas();
    inicializarDragAndDrop();
});

// Agregar nueva tarea
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
        status: "todo"  // siempre inicia en To Do
    };

    const tareas = obtenerTareas();
    tareas.push(tarea);
    guardarTareas(tareas);

    formulario.reset();
    mostrarTareas();
});

// Renderizar todas las tareas en sus columnas
function mostrarTareas() {
    // Limpiar todas las listas
    Object.values(listas).forEach(lista => lista.innerHTML = "");

    const tareas = obtenerTareas();

    tareas.forEach(tarea => {
        const li = crearElementoTarea(tarea);
        listas[tarea.status].appendChild(li);
    });

    // Re-inicializar drag después de renderizar (porque los elementos se recrean)
    inicializarDragAndDrop();
}

// Crear el HTML de cada tarea
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

// Editar tarea
function editarTarea(id) {
    const tareas = obtenerTareas();
    const tarea = tareas.find(t => t.id === id);
    if (!tarea) return;

    const nuevoTitulo = prompt("Editar tarea:", tarea.titulo);
    if (nuevoTitulo !== null && nuevoTitulo.trim() !== "") {
        tarea.titulo = nuevoTitulo.trim();
        guardarTareas(tareas);
        mostrarTareas();
    }
}

// Eliminar tarea
function eliminarTarea(id) {
    if (!confirm("¿Seguro que quieres eliminar esta tarea?")) return;

    let tareas = obtenerTareas();
    tareas = tareas.filter(t => t.id !== id);
    guardarTareas(tareas);
    mostrarTareas();
}

// Drag & Drop
function inicializarDragAndDrop() {
    document.querySelectorAll(".task-item").forEach(item => {
        item.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", item.dataset.id);
            item.classList.add("dragging");
        });

        item.addEventListener("dragend", () => {
            item.classList.remove("dragging");
        });
    });

    document.querySelectorAll(".kanban-column").forEach(columna => {
        columna.addEventListener("dragover", (e) => {
            e.preventDefault();
            columna.classList.add("drag-over");
        });

        columna.addEventListener("dragleave", () => {
            columna.classList.remove("drag-over");
        });

        columna.addEventListener("drop", (e) => {
            e.preventDefault();
            columna.classList.remove("drag-over");

            const id = e.dataTransfer.getData("text/plain");
            const tareas = obtenerTareas();
            const tarea = tareas.find(t => t.id == id);

            if (tarea) {
                tarea.status = columna.dataset.status;
                guardarTareas(tareas);
                mostrarTareas();
            }
        });
    });
}

// Helpers localStorage
function obtenerTareas() {
    return JSON.parse(localStorage.getItem("tareas") || "[]");
}

function guardarTareas(tareas) {
    localStorage.setItem("tareas", JSON.stringify(tareas));
}