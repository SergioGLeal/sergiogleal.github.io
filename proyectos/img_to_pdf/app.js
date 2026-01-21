const input = document.getElementById("input-imagenes");
const btnAgregar = document.getElementById("btn-agregar");
const preview = document.getElementById("preview");
const btnConvertir = document.getElementById("btn-convertir");
const nombrePdf = document.getElementById("nombre-pdf");

let imagenes = [];

btnAgregar.onclick = () => input.click();

input.addEventListener("change", () => {
    imagenes.push(...Array.from(input.files));
    input.value = ""; // MUY IMPORTANTE
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
            div.dataset.index = index;

            div.innerHTML = `
                <img src="${reader.result}">
                <span class="filename">${img.name}</span>
                <span class="drag">⠿</span>
                <button>&times;</button>
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
        onEnd: evt => {
            const [moved] = imagenes.splice(evt.oldIndex, 1);
            imagenes.splice(evt.newIndex, 0, moved);
        }
    });
}
