const inputImagenes = document.getElementById("input-imagenes");
const btnAgregar = document.getElementById("btn-agregar");
const btnConvertir = document.getElementById("btn-convertir");
const preview = document.getElementById("preview");
const nombrePdf = document.getElementById("nombre-pdf");

let imagenes = [];

/* ABRIR SELECTOR */
btnAgregar.addEventListener("click", () => {
    inputImagenes.click();
});

/* AGREGAR IMÁGENES (SIN REEMPLAZAR) */
inputImagenes.addEventListener("change", () => {
    [...inputImagenes.files].forEach(img => imagenes.push(img));
    render();
    inputImagenes.value = "";
});

/* RENDER */
function render() {
    preview.innerHTML = "";

    imagenes.forEach((file, index) => {
        const item = document.createElement("div");
        item.className = "preview-item";

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

    btnConvertir.disabled = imagenes.length === 0;

    Sortable.create(preview, {
        animation: 180
    });
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
