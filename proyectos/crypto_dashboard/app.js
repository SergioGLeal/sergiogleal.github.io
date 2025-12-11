const API = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd";
let datos = [];
let ordenActual = true; // true = ascendente, false = descendente

document.addEventListener("DOMContentLoaded", () => {
    cargarDatos();

    document.getElementById("buscar").addEventListener("input", filtrar);

    const headers = document.querySelectorAll("th");
    headers.forEach(th => {
        th.addEventListener("click", () => {
            ordenarPorColumna(th.dataset.col);
        });
    });

    document.getElementById("cerrar").addEventListener("click", () => {
        document.getElementById("detalles").classList.add("oculto");
    });
});

async function cargarDatos() {
    const res = await fetch(API);
    datos = await res.json();
    mostrarTabla(datos);
}

function mostrarTabla(lista) {
    const tabla = document.getElementById("contenido");
    tabla.innerHTML = "";

    lista.forEach(moneda => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td class="moneda">
                <img src="${moneda.image}">
                ${moneda.name}
            </td>
            <td>$${moneda.current_price.toLocaleString()}</td>
            <td class="${moneda.price_change_percentage_24h >= 0 ? 'subio' : 'bajo'}">
                ${moneda.price_change_percentage_24h.toFixed(2)}%
            </td>
            <td>$${moneda.market_cap.toLocaleString()}</td>
        `;

        fila.addEventListener("click", () => mostrarDetalles(moneda));
        tabla.appendChild(fila);
    });
}

function mostrarDetalles(moneda) {
    document.getElementById("detalle-nombre").innerText = moneda.name;
    document.getElementById("detalle-precio").innerText = "Precio actual: $" + moneda.current_price.toLocaleString();
    document.getElementById("detalle-descripcion").innerText =
        moneda.symbol.toUpperCase() + " | Ranking: " + moneda.market_cap_rank;

    document.getElementById("detalles").classList.remove("oculto");
}

function filtrar() {
    const texto = document.getElementById("buscar").value.toLowerCase();
    const filtrado = datos.filter(m =>
        m.name.toLowerCase().includes(texto) ||
        m.symbol.toLowerCase().includes(texto)
    );
    mostrarTabla(filtrado);
}

function ordenarPorColumna(col) {
    ordenActual = !ordenActual;

    datos.sort((a, b) => {
        if (ordenActual) return a[col] > b[col] ? 1 : -1;
        else return a[col] < b[col] ? 1 : -1;
    });

    mostrarTabla(datos);
}
