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

  <div class="toast-container position-fixed top-0 end-0 avisos" id="avisos"></div>`;

// Botones flotantes: WhatsApp (con burbuja) y volver arriba (con progreso circular).
// Llevan Tooltip de Bootstrap 6.
const FLOTANTES = (whatsapp) => `
  <aside class="flotantes" aria-label="Accesos rápidos">
    <button class="flotante volver-arriba" type="button" id="volverArriba" aria-label="Volver arriba"
            data-bs-toggle="tooltip" data-bs-placement="left" data-bs-title="Volver arriba">
      <svg class="volver-progreso" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21"/></svg>
      <i class="bi bi-arrow-up" aria-hidden="true"></i>
    </button>
    <div class="whatsapp-flotante">
      <div class="burbuja" id="burbujaWhatsApp" role="status" hidden>
        <button class="btn-close" type="button" id="cerrarBurbuja" aria-label="Cerrar mensaje"></button>
        <b>¿Te ayudamos con tu pedido?</b>
        <span>Escríbenos y te respondemos en minutos.</span>
      </div>
      <a class="flotante whatsapp" href="https://wa.me/${whatsapp}?text=Hola%20Kuyay%2C%20quisiera%20hacer%20una%20consulta"
         target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp"
         data-bs-toggle="tooltip" data-bs-placement="left" data-bs-title="Escríbenos por WhatsApp">
        <i class="bi bi-whatsapp" aria-hidden="true"></i>
      </a>
    </div>
  </aside>`;

// Chocolate que gotea sobre el pie de página (decorativo)
const CHOCOLATE = `
  <svg class="chocolate" viewBox="0 0 1200 90" preserveAspectRatio="none" aria-hidden="true">
    <path class="chocolate-capa" d="M0 0H1200V22C1180 22 1172 30 1160 30S1140 24 1120 24 1096 34 1080 34 1060 22 1040 22 1010 26 990 26 966 20 950 20 930 28 912 28 884 22 866 22 846 32 828 32 806 22 790 22 760 26 740 26 716 20 700 20 680 30 660 30 640 22 620 22 590 26 570 26 548 20 530 20 512 32 494 32 470 22 452 22 424 26 404 26 384 20 366 20 346 30 326 30 306 22 286 22 260 26 240 26 218 20 200 20 182 30 164 30 140 22 120 22 92 26 72 26 52 20 36 20 16 28 0 28Z"/>
    <path class="gota-larga g1" d="M150 24c0 0 -7 2 -7 22a7 7 0 0 0 14 0c0-20-7-22-7-22z"/>
    <path class="gota-larga g2" d="M420 24c0 0 -6 2 -6 30a6 6 0 0 0 12 0c0-28-6-30-6-30z"/>
    <path class="gota-larga g3" d="M690 26c0 0 -8 2 -8 16a8 8 0 0 0 16 0c0-14-8-16-8-16z"/>
    <path class="gota-larga g4" d="M905 26c0 0 -6 2 -6 36a6 6 0 0 0 12 0c0-34-6-36-6-36z"/>
    <path class="gota-larga g5" d="M1110 26c0 0 -7 2 -7 20a7 7 0 0 0 14 0c0-18-7-20-7-20z"/>
    <circle class="gota-cae c1" cx="420" cy="62" r="4"/>
    <circle class="gota-cae c2" cx="905" cy="68" r="4"/>
  </svg>`;

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

          <!-- Pestañas (Nav underline + Tab de Bootstrap 6) -->
          <nav class="nav nav-underline detalle-pestanas" role="tablist" aria-label="Información del producto">
            <button class="nav-link active" type="button" role="tab" id="pestanaDescripcion" data-bs-toggle="tab" data-bs-target="#panelDescripcion" aria-controls="panelDescripcion" aria-selected="true">Descripción</button>
            <button class="nav-link" type="button" role="tab" id="pestanaIngredientes" data-bs-toggle="tab" data-bs-target="#panelIngredientes" aria-controls="panelIngredientes" aria-selected="false">Ingredientes</button>
            <button class="nav-link" type="button" role="tab" id="pestanaAlergenos" data-bs-toggle="tab" data-bs-target="#panelAlergenos" aria-controls="panelAlergenos" aria-selected="false">Alérgenos</button>
          </nav>
          <div class="tab-content detalle-paneles">
            <div class="tab-pane active" id="panelDescripcion" role="tabpanel" aria-labelledby="pestanaDescripcion" tabindex="0">
              <p class="fg-2 mb-3" id="detalleDescripcion"></p>
              <!-- Popover de Bootstrap 6 -->
              <button class="btn btn-subtle theme-accent btn-sm" type="button" id="detalleConservar"
                      data-bs-toggle="popover" data-bs-placement="top" data-bs-title="¿Cómo conservarlo?" data-bs-content="">
                <i class="bi bi-snow2" aria-hidden="true"></i> ¿Cómo conservarlo?
              </button>
            </div>
            <div class="tab-pane" id="panelIngredientes" role="tabpanel" aria-labelledby="pestanaIngredientes" tabindex="0">
              <ul class="detalle-ingredientes" id="detalleIngredientes"></ul>
              <p class="fg-3 fs-xs mb-0" id="detalleIngredientesAyuda"><i class="bi bi-info-circle" aria-hidden="true"></i> Pasa el mouse o enfoca los ingredientes peruanos para saber qué son.</p>
            </div>
            <div class="tab-pane" id="panelAlergenos" role="tabpanel" aria-labelledby="pestanaAlergenos" tabindex="0">
              <ul class="detalle-alergenos" id="detalleAlergenos"></ul>
            </div>
          </div>

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

export function insertarComponentes({ conDetalle = false, whatsapp } = {}) {
  const pie = document.querySelector("footer.pie");
  pie.insertAdjacentHTML("afterbegin", CHOCOLATE);
  pie.insertAdjacentHTML("afterend", CARRITO + (conDetalle ? DETALLE : "") + FLOTANTES(whatsapp) + DEFS_SVG);
}
