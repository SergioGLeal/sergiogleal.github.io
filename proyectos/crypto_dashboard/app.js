// =======================================================
// CONFIGURACIÓN
// =======================================================
const API_URL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd";
const tablaBody = document.getElementById("tabla-body");
const inputBusqueda = document.getElementById("input-busqueda");

let datos = [];
let grafica = null; // Para evitar crear muchas gráficas

// Agrega estas variables al inicio
let ordenAscendente = true;
let columnaActual = '';

// Función para ordenar (Agrégala antes de cargarDatos)
function ordenar(columna) {
    ordenAscendente = columnaActual === columna ? !ordenAscendente : true;
    columnaActual = columna;

    datos.sort((a, b) => {
        let valA = a[columna];
        let valB = b[columna];

        // Manejo de strings (nombres)
        if (typeof valA === 'string') {
            return ordenAscendente 
                ? valA.localeCompare(valB) 
                : valB.localeCompare(valA);
        }
        // Manejo de números
        return ordenAscendente ? valA - valB : valB - valA;
    });

    mostrarTabla(datos);
}

// =======================================================
// SKELETON LOADER (Efecto de carga profesional)
// =======================================================
function mostrarSkeleton() {
    tablaBody.innerHTML = "";

    for (let i = 0; i < 10; i++) {
        tablaBody.innerHTML += `
            <tr class="skeleton-row">
                <td class="skeleton skeleton-text"></td>
                <td class="skeleton skeleton-text"></td>
                <td class="skeleton skeleton-text"></td>
                <td class="skeleton skeleton-text"></td>
                <td class="skeleton skeleton-text"></td>
            </tr>
        `;
    }
}

// =======================================================
// OBTENER DATOS PRINCIPALES
// =======================================================
async function cargarDatos() {
    mostrarSkeleton();

    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Error al obtener datos");

        datos = await res.json();
        mostrarTabla(datos);

    } catch (error) {
        tablaBody.innerHTML = `<tr><td colspan="5">Error al obtener datos</td></tr>`;
        console.error(error);
    }
}

// =======================================================
// MOSTRAR TABLA
// =======================================================
// Modifica la función mostrarTabla para incluir data-labels
function mostrarTabla(lista) {
    tablaBody.innerHTML = "";

    lista.forEach((coin, index) => {
        const cambio = coin.price_change_percentage_24h ?? 0;
        const fila = document.createElement("tr");
        fila.classList.add("fade-in-row");

        fila.innerHTML = `
            <td data-label="#">${coin.market_cap_rank}</td>
            <td data-label="Moneda" class="moneda">
                <img src="${coin.image}">
                ${coin.name} (${coin.symbol.toUpperCase()})
            </td>
            <td data-label="Precio">$${coin.current_price.toLocaleString()}</td>
            <td data-label="Cambio 24h" class="${cambio >= 0 ? "subio" : "bajo"}">
                ${cambio.toFixed(2)}%
            </td>
            <td data-label="Market Cap">$${coin.market_cap.toLocaleString()}</td>
        `;

        fila.onclick = () => mostrarDetalles(coin.id);
        tablaBody.appendChild(fila);
    });
}

// =======================================================
// BUSCADOR
// =======================================================
inputBusqueda.addEventListener("input", () => {
    const texto = inputBusqueda.value.toLowerCase();
    const filtrado = datos.filter(c =>
        c.name.toLowerCase().includes(texto) ||
        c.symbol.toLowerCase().includes(texto)
    );
    mostrarTabla(filtrado);
});

// =======================================================
// MOSTRAR DETALLES Y GRÁFICA
// =======================================================
async function mostrarDetalles(id) {
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
    const data = await res.json();

    document.getElementById("titulo-detalle").innerText = data.name;
    document.getElementById("desc").innerHTML = data.description.en.slice(0, 300) + "...";

    document.getElementById("detalles").classList.remove("oculto");
}


// =======================================================
// MOSTRAR / OCULTAR PANEL DETALLES
// =======================================================
function mostrarPanel() {
    const panel = document.getElementById("detalles");
    panel.classList.remove("oculto");
    panel.classList.add("fade-in-panel");
}

document.getElementById("cerrar").onclick = () => {
    const panel = document.getElementById("detalles");
    panel.classList.add("oculto");
};

// =======================================================
// INICIAR
// =======================================================
cargarDatos();
