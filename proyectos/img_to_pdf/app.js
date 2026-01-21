const input = document.getElementById("input-imagenes");
const btnAgregar = document.getElementById("btn-agregar");
const preview = document.getElementById("preview");
const btnConvertir = document.getElementById("btn-convertir");
const nombrePdf = document.getElementById("nombre-pdf");

let imagenes = [];

btnAgregar.onclick = () => input.click();

input.addEventListener("change", () => {
    imagenes.push(...Array.from(input.files));
    input.value = ""; // evita reemplazo
    renderPreview();
    btnConvertir.disabled = imagenes.length === 0;
});

function renderPreview() {
    preview.innerHTML = "";

    imagenes.forEach((img, index) => {
        const reader = new FileReader();

        reader.onload = () => {
            const div = document.createElement("div");
            div.className = "preview-item";

            div.innerHTML = `
                <img src="${reader.result}">
                <span class="filename">${img.name}</span>
                <span class="drag">⠿</span>
                <button title="Eliminar">&times;</button>
            `;

            div.querySelector("button").onclick = () => {
                imagenes.splice(index, 1);
                renderPreview();
                btnConvertir.disabled = imagenes.length === 0;
            };

            preview.appendChild(div);
        };

        reader.readAsDataURL(img);
    });

    Sortable.create(preview, {
        animation: 150,
        handle: ".drag",
        onEnd: (evt) => {
            const [moved] = imagenes.splice(evt.oldIndex, 1);
            imagenes.splice(evt.newIndex, 0, moved);
        }
    });
}

btnConvertir.onclick = async () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    for (let i = 0; i < imagenes.length; i++) {
        const imgData = await cargarImagen(imagenes[i]);
        const w = pdf.internal.pageSize.getWidth();
        const h = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, "JPEG", 0, 0, w, h);
        if (i < imagenes.length - 1) pdf.addPage();
    }

    const nombre = nombrePdf.value.trim() || "imagenes";
    pdf.save(`${nombre}.pdf`);
};

function cargarImagen(archivo) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(archivo);
    });
}
