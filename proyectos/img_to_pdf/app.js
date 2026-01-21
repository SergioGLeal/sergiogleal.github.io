const inputImagenes = document.getElementById("input-imagenes");
const btnAgregar = document.getElementById("btn-agregar");
const btnConvertir = document.getElementById("btn-convertir");
const btnOrdenarNombre = document.getElementById("btn-ordenar-nombre");
const preview = document.getElementById("preview");
const nombrePdf = document.getElementById("nombre-pdf");
const emptyState = document.getElementById("empty-state");

let imagenes = [];
let ordenAZ = true;
let sortableInstance = null;

/* ABRIR SELECTOR */
btnAgregar.addEventListener("click", () => {
    inputImagenes.click();
});

/* AGREGAR IMÁGENES */
inputImagenes.addEventListener("change", () => {
    [...inputImagenes.files].forEach(img => imagenes.push(img));
    render();
    inputImagenes.value = "";
});

/* ORDENAR POR NOMBRE (TOGGLE) */
btnOrdenarNombre.addEventListener("click", () => {
    imagenes.sort((a, b) =>
        ordenAZ
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
    );

    ordenAZ = !ordenAZ;
    actualizarBotonOrden();
    render();
});

/* ACTUALIZAR TEXTO / ICONO */
function actualizarBotonOrden() {
    btnOrdenarNombre.innerHTML = ordenAZ
        ? `<i class="fa-solid fa-arrow-down-a-z"></i> A–Z`
        : `<i class="fa-solid fa-arrow-down-z-a"></i> Z–A`;
}

/* RENDER */
function render() {
    preview.innerHTML = "";

    if (imagenes.length === 0) {
        emptyState.style.display = "flex";
        btnConvertir.disabled = true;
        destruirDrag();
        return;
    }

    emptyState.style.display = "none";

    imagenes.forEach((file, index) => {
        const item = document.createElement("div");
        item.className = "preview-item";
        item.dataset.index = index;

        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);

        const name = document.createElement("div");
        name.className = "filename";
        name.textContent = file.name;

        const btnEliminar = document.createElement("button");
        btnEliminar.innerHTML = "❌";
        btnEliminar.onclick = () => {
            imagenes.splice(index, 1);
            render();
        };

        item.append(img, name, btnEliminar);
        preview.appendChild(item);
    });

    btnConvertir.disabled = false;
    activarDrag();
}

/* DRAG & DROP (SIEMPRE ACTIVO) */
function activarDrag() {
    destruirDrag();

    sortableInstance = Sortable.create(preview, {
        animation: 180,
        onEnd: () => {
            const nuevoOrden = [];
            preview.querySelectorAll(".preview-item").forEach(item => {
                nuevoOrden.push(imagenes[item.dataset.index]);
            });
            imagenes = nuevoOrden;
            render();
        }
    });
}

function destruirDrag() {
    if (sortableInstance) {
        sortableInstance.destroy();
        sortableInstance = null;
    }
}

/* GENERAR PDF */
btnConvertir.addEventListener("click", async () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    for (let i = 0; i < imagenes.length; i++) {
        const base64 = await toBase64(imagenes[i]);
        if (i > 0) pdf.addPage();
        pdf.addImage(base64, "JPEG", 10, 10, 190, 260);
    }

    pdf.save(nombrePdf.value || "imagenes.pdf");
});

/* UTIL */
function toBase64(file) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}

/* INICIAL */
actualizarBotonOrden();
render();
