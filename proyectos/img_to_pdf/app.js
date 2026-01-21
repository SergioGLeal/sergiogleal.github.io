const input = document.getElementById("inputImagenes");
const preview = document.getElementById("preview");
const btnGenerar = document.getElementById("btnGenerar");
const nombrePdfInput = document.getElementById("nombrePdf");

let imagenes = [];

input.addEventListener("change", () => {
  [...input.files].forEach(file => {
    imagenes.push(file);
  });
  render();
  input.value = "";
});

function render() {
  preview.innerHTML = "";

  imagenes.forEach((file, index) => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);

    const name = document.createElement("div");
    name.className = "filename";
    name.textContent = file.name;

    const btn = document.createElement("button");
    btn.className = "remove-btn";
    btn.textContent = "Eliminar";
    btn.onclick = () => {
      imagenes.splice(index, 1);
      render();
    };

    card.append(img, name, btn);
    preview.appendChild(card);
  });

  Sortable.create(preview, {
    animation: 200,
    onEnd: e => {
      const moved = imagenes.splice(e.oldIndex, 1)[0];
      imagenes.splice(e.newIndex, 0, moved);
    }
  });
}

btnGenerar.addEventListener("click", async () => {
  if (imagenes.length === 0) return alert("Agrega imágenes");

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  for (let i = 0; i < imagenes.length; i++) {
    const imgData = await toBase64(imagenes[i]);
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "JPEG", 10, 10, 190, 260);
  }

  const nombre = nombrePdfInput.value || "imagenes.pdf";
  pdf.save(nombre);
});

function toBase64(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}
