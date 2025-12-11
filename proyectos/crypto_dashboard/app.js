const API_URL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd";
const tablaBody = document.getElementById("tabla-body");
const inputBusqueda = document.getElementById("input-busqueda");

let datos = [];

// Obtener datos iniciales
async function cargarDatos() {
    const res = await fetch(API_URL);
    datos = await res.json();
    mostrarTabla(datos);
}

function mostrarTabla(lista) {
    tablaBody.innerHTML = "";

    lista.forEach((coin, index) => {
        const fila = `
            <tr onclick="mostrarDetalles('${coin.id}')">
                <td>${index + 1}</td>
                <td class="moneda">
                    <img src="${coin.image}">
                    ${coin.name} (${coin.symbol.toUpperCase()})
                </td>
                <td>$${coin.current_price}</td>
                <td class="${coin.price_change_percentage_24h >= 0 ? "subio" : "bajo"}">
                    ${coin.price_change_percentage_24h.toFixed(2)}%
                </td>
                <td>$${coin.market_cap.toLocaleString()}</td>
            </tr>
        `;
        tablaBody.innerHTML += fila;
    });
}

inputBusqueda.addEventListener("input", () => {
    const texto = inputBusqueda.value.toLowerCase();
    const filtrado = datos.filter(c =>
        c.name.toLowerCase().includes(texto) ||
        c.symbol.toLowerCase().includes(texto)
    );
    mostrarTabla(filtrado);
});

async function mostrarDetalles(id) {
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
    const data = await res.json();

    document.getElementById("titulo-detalle").innerText = data.name;
    document.getElementById("desc").innerHTML = data.description.en.slice(0, 300) + "...";

    // Gráfica
    const precios = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=7`)
        .then(r => r.json());

    const labels = precios.prices.map(p => new Date(p[0]).toLocaleDateString());
    const valores = precios.prices.map(p => p[1]);

    new Chart(document.getElementById("grafica"), {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Precio últimos 7 días",
                data: valores,
                borderWidth: 2
            }]
        }
    });

    document.getElementById("detalles").classList.remove("oculto");
}

document.getElementById("cerrar").onclick = () => {
    document.getElementById("detalles").classList.add("oculto");
};

cargarDatos();
