const inputImagenes = document.getElementById("input-imagenes");
const btnConvertir = document.getElementById("btn-convertir");

btnConvertir.addEventListener("click", async () => {
    if (inputImagenes.files.length === 0) {
        alert("Selecciona al menos una imagen");
        return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    const archivos = Array.from(inputImagenes.files);

    for (let i = 0; i < archivos.length; i++) {
        const imgData = await cargarImagen(archivos[i]);

        const anchoPDF = pdf.internal.pageSize.getWidth();
        const altoPDF = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, "JPEG", 0, 0, anchoPDF, altoPDF);

        if (i < archivos.length - 1) {
            pdf.addPage();
        }
    }

    pdf.save("imagenes.pdf");
});

function cargarImagen(archivo) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(archivo);
    });
}
