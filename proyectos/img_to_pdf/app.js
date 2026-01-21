const input = document.getElementById("inputImagenes");
const preview = document.getElementById("preview");
const btnGenerar = document.getElementById("btnGenerar");
const nombrePdfInput = document.getElementById("nombrePdf");

let imagenes = [];

input.addEventListener("change", () => {
  [...input.files].forEach(file => imagenes.push(file));
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
    ghostClass: "dragging"
  });
}

btnGenerar.addEventListener("click", async () => {
  if (!imagenes.length) return alert("Agrega imágenes");

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  for (let i = 0; i < imagenes.length; i++) {
    const imgData = await toBase64(imagenes[i]);
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "JPEG", 10, 10, 190, 260);
  }

  pdf.save(nombrePdfInput.value || "imagenes.pdf");
});

function toBase64(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}
