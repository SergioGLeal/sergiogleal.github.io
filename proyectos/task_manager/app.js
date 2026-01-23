const formulario = document.getElementById("formulario");
const contenedor = document.getElementById("tareas");

document.addEventListener("DOMContentLoaded", renderizar);
formulario.addEventListener("submit", agregar);

function agregar(e) {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const prioridad = document.getElementById("prioridad").value;

    const tareas = obtener();
    tareas.push({
        id: Date.now(),
        titulo,
        prioridad
    });

    guardar(tareas);
    formulario.reset();
    renderizar();
}

function renderizar() {
    contenedor.innerHTML = "";
    obtener().forEach(t => contenedor.appendChild(crearCard(t)));
}

function crearCard(tarea) {
    const div = document.createElement("div");
    div.className = `card ${tarea.prioridad}`;

    div.innerHTML = `
        <h3>${tarea.titulo}</h3>
        <small>Prioridad: ${tarea.prioridad}</small>
        <div class="acciones">
            <button onclick="editar(${tarea.id})">
                <i class="fas fa-pen"></i>
            </button>
            <button onclick="eliminar(${tarea.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    return div;
}

function editar(id) {
    const tareas = obtener();
    const tarea = tareas.find(t => t.id === id);
    const nuevo = prompt("Editar tarea", tarea.titulo);

    if (nuevo) {
        tarea.titulo = nuevo;
        guardar(tareas);
        renderizar();
    }
}

function eliminar(id) {
    guardar(obtener().filter(t => t.id !== id));
    renderizar();
}

function obtener() {
    return JSON.parse(localStorage.getItem("tareas")) || [];
}

function guardar(tareas) {
    localStorage.setItem("tareas", JSON.stringify(tareas));
}
