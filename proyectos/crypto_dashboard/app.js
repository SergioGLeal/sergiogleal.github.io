// =======================================================
// CONFIGURACIÓN
// =======================================================
const API_URL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd";
const tablaBody = document.getElementById("tabla-body");
const inputBusqueda = document.getElementById("input-busqueda");

let datos = [];
let grafica = null; // Para evitar crear muchas gráficas

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
function mostrarTabla(lista) {
    tablaBody.innerHTML = "";

    lista.forEach((coin, index) => {
        const fila = document.createElement("tr");
        fila.classList.add("fade-in-row");

        fila.innerHTML = `
            <td>${index + 1}</td>
            <td class="moneda">
                <img src="${coin.image}">
                ${coin.name} (${coin.symbol.toUpperCase()})
            </td>
            <td>$${coin.current_price.toLocaleString()}</td>
            <td class="${coin.price_change_percentage_24h >= 0 ? "subio" : "bajo"}">
                ${coin.price_change_percentage_24h.toFixed(2)}%
            </td>
            <td>$${coin.market_cap.toLocaleString()}</td>
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
    mostrarPanel();

    try {
        // Obtener info principal
        const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
        const data = await res.json();

        document.getElementById("titulo-detalle").innerText = data.name;
        document.getElementById("desc").innerHTML =
            (data.description?.en || "Sin descripción disponible.")
                .slice(0, 350) + "...";

        // Obtener precios para la gráfica
        const precios = await fetch(
            `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=7`
        ).then(r => r.json());

        const labels = precios.prices.map(p =>
            new Date(p[0]).toLocaleDateString()
        );
        const valores = precios.prices.map(p => p[1]);

        // Destruir gráfica previa si existe
        if (grafica) grafica.destroy();

        // Crear gradiente profesional
        const ctx = document.getElementById("grafica").getContext("2d");
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, "rgba(74,46,255,0.7)");
        gradient.addColorStop(1, "rgba(74,46,255,0.05)");

        grafica = new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Precio últimos 7 días",
                    data: valores,
                    borderColor: "#4A2EFF",
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.35,
                    borderWidth: 3,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                animation: { duration: 900 },
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { ticks: { color: "#666" } },
                    y: { ticks: { color: "#666" } }
                }
            }
        });

    } catch (error) {
        console.error("Error cargando detalles", error);
    }
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
