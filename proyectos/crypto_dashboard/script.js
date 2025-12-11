/* script.js - CryptoTracker Pro
   Incluye: fetch, paginación, búsqueda, orden, top3, favoritos, comparador, tema
*/

const API = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=250&page=1";
let datos = [];            // datos crudos
let view = [];             // datos filtrados / ordenados para mostrar
let currentPage = 1;
let perPage = 10;
let currentSort = { col: "market_cap_rank", asc: true };
let favorites = JSON.parse(localStorage.getItem("ct_favorites") || "[]");
let compareSelection = []; // ids seleccionados para comparar

// ELEMENTOS
const contenido = document.getElementById("contenido");
const buscarInput = document.getElementById("buscar");
const pagination = document.getElementById("pagination");
const perPageSelect = document.getElementById("perPage");
const topCards = document.getElementById("topCards");
const compareBtn = document.getElementById("compareBtn");

// THEME
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

// DETALLES & COMPARADOR
const detalles = document.getElementById("detalles");
const detalleNombre = document.getElementById("detalle-nombre");
const detallePrecio = document.getElementById("detalle-precio");
const detalleInfo = document.getElementById("detalle-info");
const detalleLink = document.getElementById("detalle-link");
const comparador = document.getElementById("comparador");
const comparadorInner = document.getElementById("comparadorInner");

// Inicializar
document.addEventListener("DOMContentLoaded", init);

function init() {
    // tema por defecto: claro
    const tema = localStorage.getItem("ct_theme") || "light";
    setTheme(tema);

    // eventos
    buscarInput.addEventListener("input", onSearch);
    perPageSelect.addEventListener("change", e => { perPage = parseInt(e.target.value); currentPage = 1; render(); });
    compareBtn.addEventListener("click", toggleComparador);
    document.getElementById("cerrar")?.addEventListener("click", () => hideDetalles());
    document.getElementById("cerrarComparador")?.addEventListener("click", () => hideComparador());
    themeToggle.addEventListener("click", toggleTheme);

    // ordenar al clic en headers
    document.querySelectorAll("thead th.sortable").forEach(th => {
        th.addEventListener("click", () => {
            const col = th.dataset.col;
            if (currentSort.col === col) currentSort.asc = !currentSort.asc;
            else { currentSort.col = col; currentSort.asc = true; }
            currentPage = 1;
            sortView();
            render();
        });
    });

    // cargar datos
    cargarDatos();
}

/* ========== Fetch y Preparación ========== */
async function cargarDatos() {
    try {
        showLoadingRows();
        const res = await fetch(API);
        if (!res.ok) throw new Error("Error al obtener datos");
        datos = await res.json();
        // inicial view
        view = [...datos];
        renderTopCards();
        sortView();
        render();
    } catch (e) {
        contenido.innerHTML = `<tr><td colspan="7">Error al cargar datos: ${e.message}</td></tr>`;
        console.error(e);
    }
}

/* ========== RENDER PRINCIPAL ========== */
function render() {
    // filtrar por búsqueda
    const q = buscarInput.value.trim().toLowerCase();
    view = datos.filter(d => d.name.toLowerCase().includes(q) || d.symbol.toLowerCase().includes(q));

    // ordenar
    sortView();

    // paginar
    const total = view.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * perPage;
    const pageItems = view.slice(start, start + perPage);

    // render filas
    contenido.innerHTML = "";
    pageItems.forEach(item => {
        const tr = document.createElement("tr");
        tr.className = "fade-row";
        tr.innerHTML = `
            <td>${item.market_cap_rank}</td>
            <td class="moneda">
                <img src="${item.image}" alt="${item.name}">
                <div>
                    <div style="font-weight:700">${item.name}</div>
                    <div style="font-size:12px;color:#667085">${item.symbol.toUpperCase()}</div>
                </div>
            </td>
            <td>$${Number(item.current_price).toLocaleString()}</td>
            <td class="${item.price_change_percentage_24h >= 0 ? 'up' : 'down'}">${item.price_change_percentage_24h?.toFixed(2) ?? 'N/A'}%</td>
            <td>$${Number(item.market_cap).toLocaleString()}</td>
            <td>
                <button class="fav-btn" data-id="${item.id}" title="Agregar a favoritos">
                    <i class="${favorites.includes(item.id) ? 'fa-solid' : 'fa-regular'} fa-star"></i>
                </button>
            </td>
            <td>
                <input type="checkbox" class="compare-chk" data-id="${item.id}" ${compareSelection.includes(item.id) ? 'checked' : ''}>
            </td>
        `;
        // click en fila -> mostrar detalles
        tr.addEventListener("click", (e) => {
            // si hizo click en checkbox o estrella, no abrir detalles
            if (e.target.closest(".fav-btn") || e.target.closest(".compare-chk")) return;
            showDetalles(item);
        });

        contenido.appendChild(tr);
    });

    // paginación
    renderPagination(totalPages);

    // listeners para favoritos y checkboxes
    document.querySelectorAll(".fav-btn").forEach(btn => btn.addEventListener("click", toggleFav));
    document.querySelectorAll(".compare-chk").forEach(chk => chk.addEventListener("change", onCompareToggle));

    // actualizar contador de compare
    updateCompareButton();
}

/* ========== ORDENAR ========== */
function sortView() {
    const { col, asc } = currentSort;
    view.sort((a, b) => {
        const va = (a[col] === null || a[col] === undefined) ? -Infinity : a[col];
        const vb = (b[col] === null || b[col] === undefined) ? -Infinity : b[col];
        if (typeof va === "string") return asc ? va.localeCompare(vb) : vb.localeCompare(va);
        return asc ? va - vb : vb - va;
    });
}

/* ========== PAGINACIÓN ========== */
function renderPagination(totalPages) {
    pagination.innerHTML = "";
    // prev
    const prev = document.createElement("button");
    prev.className = "page-btn";
    prev.textContent = "«";
    prev.disabled = currentPage === 1;
    prev.addEventListener("click", () => { currentPage = Math.max(1, currentPage - 1); render(); });
    pagination.appendChild(prev);

    // páginas (mostrar máximo 7 botones)
    const maxButtons = 7;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start < maxButtons - 1) start = Math.max(1, end - maxButtons + 1);

    for (let i = start; i <= end; i++) {
        const b = document.createElement("button");
        b.className = "page-btn" + (i === currentPage ? " active" : "");
        b.textContent = i;
        b.addEventListener("click", () => { currentPage = i; render(); });
        pagination.appendChild(b);
    }

    // next
    const next = document.createElement("button");
    next.className = "page-btn";
    next.textContent = "»";
    next.disabled = currentPage === totalPages;
    next.addEventListener("click", () => { currentPage = Math.min(totalPages, currentPage + 1); render(); });
    pagination.appendChild(next);
}

/* ========== TOP 3 CARDS ========== */
function renderTopCards() {
    const top3 = [...datos].sort((a,b) => b.market_cap - a.market_cap).slice(0,3);
    topCards.innerHTML = "";
    top3.forEach(c => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
            <div class="name">${c.name}</div>
            <div class="price">$${Number(c.current_price).toLocaleString()}</div>
            <div class="pct ${c.price_change_percentage_24h >= 0 ? 'up' : 'down'}">${c.price_change_percentage_24h?.toFixed(2) ?? 'N/A'}%</div>
        `;
        div.addEventListener("click", () => showDetalles(c));
        topCards.appendChild(div);
    });
}

/* ========== DETALLES (panel) ========== */
function showDetalles(item) {
    detalleNombre.innerText = `${item.name} (${item.symbol.toUpperCase()})`;
    detallePrecio.innerText = `Precio actual: $${Number(item.current_price).toLocaleString()}`;
    detalleInfo.innerText = `Market Cap Rank: ${item.market_cap_rank} · Market Cap: $${Number(item.market_cap).toLocaleString()}`;
    detalleLink.href = `https://www.coingecko.com/en/coins/${item.id}`;
    detalles.classList.remove("oculto");
    detalles.setAttribute("aria-hidden", "false");
}

function hideDetalles() {
    detalles.classList.add("oculto");
    detalles.setAttribute("aria-hidden", "true");
}

/* ========== FAVORITOS ========== */
function toggleFav(e) {
    e.stopPropagation();
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    if (favorites.includes(id)) {
        favorites = favorites.filter(x => x !== id);
    } else {
        favorites.push(id);
    }
    localStorage.setItem("ct_favorites", JSON.stringify(favorites));
    render(); // re-render para actualizar iconos
}

/* ========== BUSCAR ========== */
function onSearch() {
    currentPage = 1;
    render();
}

/* ========== LOADING (filas esqueleto) ========== */
function showLoadingRows() {
    contenido.innerHTML = "";
    for (let i=0;i<10;i++) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>&nbsp;</td><td style="height:18px">&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td></td><td></td>`;
        tr.style.opacity = "0.25";
        contenido.appendChild(tr);
    }
}

/* ========== COMPARADOR ========== */
function onCompareToggle(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    if (e.currentTarget.checked) {
        if (compareSelection.length >= 2) {
            // no permitir más de 2
            e.currentTarget.checked = false;
            alert("Solo puedes seleccionar hasta 2 criptomonedas para comparar.");
            return;
        }
        compareSelection.push(id);
    } else {
        compareSelection = compareSelection.filter(x => x !== id);
    }
    updateCompareButton();
}

function updateCompareButton() {
    compareBtn.textContent = `Comparar (${compareSelection.length}/2)`;
}

function toggleComparador() {
    if (compareSelection.length < 1) { alert("Selecciona al menos 1 cripto para comparar."); return; }
    // mostrar comparador con las 1 o 2 seleccionadas
    comparadorInner.innerHTML = "";
    const items = datos.filter(d => compareSelection.includes(d.id));
    items.forEach(it => {
        const box = document.createElement("div");
        box.className = "compare-card";
        box.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px">
                <img src="${it.image}" style="width:36px;height:36px;border-radius:50%">
                <div>
                    <div style="font-weight:700">${it.name} (${it.symbol.toUpperCase()})</div>
                    <div style="font-size:13px;color:#64748b">Rank: ${it.market_cap_rank}</div>
                </div>
            </div>
            <hr style="margin:8px 0">
            <div>Precio: $${Number(it.current_price).toLocaleString()}</div>
            <div>%24h: <span class="${it.price_change_percentage_24h>=0?'up':'down'}">${it.price_change_percentage_24h?.toFixed(2) ?? 'N/A'}%</span></div>
            <div>Market Cap: $${Number(it.market_cap).toLocaleString()}</div>
        `;
        comparadorInner.appendChild(box);
    });
    comparador.classList.remove("oculto");
}

function hideComparador() {
    comparador.classList.add("oculto");
}

/* ========== THEME (claro por defecto) ========== */
function setTheme(t) {
    if (t === "dark") {
        document.documentElement.style.setProperty("--bg", "#0b1220");
        document.documentElement.style.setProperty("--text", "#e6eef8");
        document.body.classList.add("dark");
        themeIcon.className = "fa-solid fa-sun";
    } else {
        document.body.classList.remove("dark");
        themeIcon.className = "fa-regular fa-moon";
    }
    localStorage.setItem("ct_theme", t);
}

function toggleTheme() {
    const current = localStorage.getItem("ct_theme") || "light";
    const next = current === "light" ? "dark" : "light";
    setTheme(next);
}

/* ========== UTILS / INIT RENDER ========== */
// inicial render será llamado luego de fetch: render() dentro de cargarDatos
