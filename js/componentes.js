// =========================================================
// Componentes compartidos por todas las páginas.
// El carrito, los avisos y el detalle de producto solo
// funcionan con JavaScript, así que se insertan desde aquí
// en lugar de repetir su HTML en cada archivo.
// =========================================================

const CARRITO = `
  <dialog class="drawer drawer-end carrito" id="carrito" aria-labelledby="carritoTitulo">
    <div class="drawer-header">
      <h2 class="drawer-title fs-xl" id="carritoTitulo">Tu carrito <span class="fg-3 fs-md" id="carritoCantidad"></span></h2>
      <button class="btn-close" type="button" data-bs-dismiss="drawer" aria-label="Cerrar carrito"></button>
    </div>
    <div class="drawer-body">
      <div class="carrito-vacio" id="carritoVacio">
        <i class="bi bi-bag-heart" aria-hidden="true"></i>
        <p class="fw-semibold mb-0">Tu carrito está vacío</p>
        <p class="fg-3 fs-sm">Agrega algo dulce del catálogo.</p>
        <a class="btn btn-outline theme-primary" href="catalogo.html">Ver catálogo</a>
      </div>
      <ul class="list-group list-group-flush" id="carritoLista"></ul>
    </div>
    <div class="drawer-footer carrito-pie" id="carritoPie" hidden>
      <div class="meta-descuento" id="metaDescuento">
        <p class="meta-texto" id="metaTexto"></p>
        <div class="meta-pista" aria-hidden="true"><div class="meta-barra" id="metaBarra"></div></div>
      </div>
      <dl class="totales">
        <div><dt>Subtotal</dt><dd id="carritoSubtotal"></dd></div>
        <div class="fila-descuento" id="filaDescuento" hidden><dt>Descuento 10 %</dt><dd id="carritoDescuento"></dd></div>
        <div class="fila-total"><dt>Total</dt><dd id="carritoTotal"></dd></div>
      </dl>
      <p class="fg-3 fs-xs mb-0">El costo de delivery se coordina por WhatsApp según tu distrito.</p>
      <a class="btn btn-solid theme-success btn-lg w-100" id="btnWhatsApp" href="#" target="_blank" rel="noopener">
        <i class="bi bi-whatsapp" aria-hidden="true"></i> Pedir por WhatsApp
      </a>
      <button class="btn btn-text theme-secondary btn-sm" type="button" id="btnVaciar">Vaciar carrito</button>
    </div>
  </dialog>

  <div class="toast-container position-fixed bottom-0 end-0 avisos" id="avisos"></div>`;

const DETALLE = `
  <dialog class="dialog dialog-lg detalle" id="detalleProducto" aria-labelledby="detalleTitulo">
    <div class="dialog-header">
      <p class="producto-categoria mb-0" id="detalleCategoria"></p>
      <button class="btn-close" type="button" data-bs-dismiss="dialog" aria-label="Cerrar"></button>
    </div>
    <div class="dialog-body">
      <div class="row g-7">
        <div class="md:col-6">
          <div class="producto-media detalle-media" id="detalleMedia"></div>
        </div>
        <div class="md:col-6 detalle-info">
          <h2 class="detalle-titulo" id="detalleTitulo"></h2>
          <p class="detalle-precio mb-0"><span id="detallePrecio"></span> <span class="fg-3 fs-sm" id="detallePorcion"></span></p>
          <p class="detalle-stock" id="detalleStock"></p>
          <p class="fg-2" id="detalleDescripcion"></p>
          <h3 class="detalle-subtitulo">Ingredientes</h3>
          <ul class="detalle-ingredientes" id="detalleIngredientes"></ul>

          <div class="detalle-compra" id="detalleCompra">
            <div class="cantidad" role="group" aria-label="Cantidad">
              <button class="btn btn-subtle theme-secondary btn-icon" type="button" id="detalleMenos" aria-label="Quitar uno"><i class="bi bi-dash" aria-hidden="true"></i></button>
              <input class="form-control" type="number" id="detalleCantidad" value="1" min="1" aria-label="Cantidad" readonly>
              <button class="btn btn-subtle theme-secondary btn-icon" type="button" id="detalleMas" aria-label="Agregar uno"><i class="bi bi-plus" aria-hidden="true"></i></button>
            </div>
            <button class="btn btn-solid theme-primary flex-grow-1" type="button" id="detalleAgregar">
              <i class="bi bi-bag-plus" aria-hidden="true"></i> Agregar al carrito
            </button>
          </div>
          <p class="detalle-agotado" id="detalleAgotado" hidden>
            <i class="bi bi-clock-history" aria-hidden="true"></i> Se agotó por hoy. Vuelve mañana temprano o escríbenos para separarlo.
          </p>
        </div>
      </div>
    </div>
  </dialog>`;

// Degradado de las ilustraciones de productos (un solo id en toda la página)
const DEFS_SVG = `
  <svg class="defs-svg" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="brillo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity=".35"/>
        <stop offset=".6" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
    </defs>
  </svg>`;

export function insertarComponentes({ conDetalle = false } = {}) {
  const pie = document.querySelector("footer.pie");
  pie.insertAdjacentHTML("afterend", CARRITO + (conDetalle ? DETALLE : "") + DEFS_SVG);
}
