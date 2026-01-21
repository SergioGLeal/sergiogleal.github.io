const inputImagenes = document.getElementById("input-imagenes");
const preview = document.getElementById("preview");
const btnConvertir = document.getElementById("btn-convertir");
const nombrePdfInput = document.getElementById("nombre-pdf");

let imagenes = [];

inputImagenes.addEventListener("change", () => {
    imagenes = Array.from(inputImagenes.files);
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
}

btnConvertir.addEventListener("click", async () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    for (let i = 0; i < imagenes.length; i++) {
        const imgData = await cargarImagen(imagenes[i]);

        const w = pdf.internal.pageSize.getWidth();
        const h = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, "JPEG", 0, 0, w, h);

        if (i < imagenes.length - 1) {
            pdf.addPage();
        }
    }

    const nombre = nombrePdfInput.value.trim() || "imagenes";
    pdf.save(`${nombre}.pdf`);
});

function cargarImagen(archivo) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(archivo);
    });
}
