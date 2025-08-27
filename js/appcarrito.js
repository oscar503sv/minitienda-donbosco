const TASA_IMPUESTO = 0.13;

// Selectores
const carrito = document.querySelector('#carrito');
const listaProductos = document.querySelector('#lista-productos');
const contenedorCarrito = document.querySelector('#lista-carrito tbody');
const productosGrid = document.querySelector('#productos-grid');
let productosCarrito = []; 

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Verificar que products esté definido
    if (typeof products === 'undefined') {
        console.error('Error: El archivo products.js no está cargado correctamente');
        return;
    }
    // Limpiar el grid de productos antes de cargar
    productosGrid.innerHTML = '';

    // Recuperar carrito del localStorage si existe
    const carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || [];
    productosCarrito = carritoGuardado;
    
    // Cargar productos
    cargarProductos();
    
    // Actualizar carrito después de cargar productos
    actualizarCarritoHTML();
    
    // Agregar event listeners después de todo
    cargarEventListeners();
});

// Función para cargar productos
function cargarProductos() {
    products.forEach(producto => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
            <div class="card">
                <img src="${producto.image}" alt="${producto.name}">
                <div class="info-card">
                    <h4>${producto.name}</h4>
                    <p class="brand">${producto.brand}</p>
                    <div class="precio">
                        <span class="original-price">${producto.originalPrice}</span>
                        <span class="discount-price">Ahora ${producto.discountPrice}</span>
                    </div>
                    <button class="button button-primary agregar-carrito" data-id="${producto.id}">
                        Agregar Al Carrito
                    </button>
                </div>
            </div>
        `;
        productosGrid.appendChild(div);
    });
}

function cargarEventListeners() {
    productosGrid.addEventListener('click', agregarProducto);
    carrito.addEventListener('click', manejarEventosCarrito);
}

function manejarEventosCarrito(e) {
    e.preventDefault();
    
    if (e.target.classList.contains('borrar-producto')) {
        eliminarProducto(e);
    } else if (e.target.classList.contains('aumentar')) {
        const productoId = parseInt(e.target.getAttribute('data-id'));
        modificarCantidad(productoId, 1);
    } else if (e.target.classList.contains('disminuir')) {
        const productoId = parseInt(e.target.getAttribute('data-id'));
        modificarCantidad(productoId, -1);
    }
}

function modificarCantidad(productoId, cambio) {
    const productoEnCarrito = productosCarrito.find(item => item.id === productoId);
    const productoData = products.find(p => p.id === productoId);
    
    if (!productoEnCarrito || !productoData) return;
    
    const nuevaCantidad = productoEnCarrito.cantidad + cambio;
    
    if (nuevaCantidad <= 0) {
        // Si la cantidad llega a 0, eliminar el producto
        productosCarrito = productosCarrito.filter(item => item.id !== productoId);
        mostrarNotificacion('Producto eliminado del carrito', 'error');
    } else {
        // Actualizar cantidad
        productoEnCarrito.cantidad = nuevaCantidad;
        mostrarNotificacion(`Cantidad actualizada: ${nuevaCantidad}`, 'exito');
    }
    
    actualizarCarritoHTML();
    guardarCarritoEnStorage();
}

function agregarProducto(e) {
    e.preventDefault();
    if (!e.target.classList.contains('agregar-carrito')) return;

    const productoCard = e.target.closest('.card');
    if (!productoCard) return;
    
    const producto = obtenerDatosProducto(productoCard);
    if (!producto) {
        console.error('No se pudo obtener la información del producto');
        return;
    }
    
    actualizarCarrito(producto);
    // Añade efecto visual al botón
    const boton = e.target;
    boton.style.transform = 'scale(0.95)';
    setTimeout(() => {
        boton.style.transform = '';
    }, 100);

    // Mostrar notificación
    mostrarNotificacion(`Producto ${producto.titulo} agregado al carrito`, 'exito');
}

function obtenerDatosProducto(productoCard) {
    const id = productoCard.querySelector('.button').getAttribute('data-id');
    const productoData = products.find(p => p.id === parseInt(id));
    
    if (!productoData) {
        console.error('Producto no encontrado');
        return null;
    }
    
    return {
        imagen: productoData.image,
        titulo: productoData.name,
        precio: productoData.discountPrice,
        id: productoData.id,
        cantidad: 1
    };
}

function actualizarCarrito(producto) {
    const productoData = products.find(p => p.id === producto.id);
    if (!productoData) return;

    const productoExistente = productosCarrito.find(item => item.id === producto.id);
    
    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        productosCarrito.push(producto);
    }

    actualizarCarritoHTML();
    guardarCarritoEnStorage();
}

function eliminarProducto(e) {
    e.preventDefault();
    if (!e.target.classList.contains('borrar-producto')) return;

    const productoId = parseInt(e.target.getAttribute('data-id'));
    productosCarrito = productosCarrito.filter(producto => producto.id !== productoId);
    
    actualizarCarritoHTML();
    actualizarStockVisual();
    guardarCarritoEnStorage();

    // Mostrar notificación
    mostrarNotificacion('Producto eliminado del carrito', 'error');
}

function actualizarCarritoHTML() {
    contenedorCarrito.innerHTML = '';
    
    productosCarrito.forEach(producto => {
        const precioNumerico = parseFloat(producto.precio.replace('$', ''));
        const subtotalProducto = precioNumerico * producto.cantidad;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <img src="${producto.imagen}" alt="${producto.titulo}">
            </td>
            <td>${producto.titulo}</td>
            <td>${producto.precio}</td>
            <td>
                <div class="cantidad-control">
                    <button class="cantidad-btn disminuir" data-id="${producto.id}">-</button>
                    <span>${producto.cantidad}</span>
                    <button class="cantidad-btn aumentar" data-id="${producto.id}">+</button>
                </div>
            </td>
            <td>$${subtotalProducto.toFixed(2)}</td>
            <td>
                <a href="#" class="borrar-producto" data-id="${producto.id}">&times;</a>
            </td>
        `;
        contenedorCarrito.appendChild(row);
    });

    // Calcular y mostrar totales
    // Actualizar el footer del carrito
    const footerCarrito = document.getElementById('carrito-footer');
    footerCarrito.innerHTML = '';

    if (productosCarrito.length > 0) {
        const subtotal = productosCarrito.reduce((total, producto) => {
            const precio = parseFloat(producto.precio.replace('$', ''));
            return total + (precio * producto.cantidad);
        }, 0);

        const iva = subtotal * TASA_IMPUESTO;
        const total = subtotal + iva;

        footerCarrito.innerHTML = `
            <div class="carrito-totales">
                <div class="totales-desglose">
                    <div class="total-item">
                        <span>Subtotal:</span>
                        <span>$${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="total-item">
                        <span>IVA (${(TASA_IMPUESTO * 100).toFixed(0)}%):</span>
                        <span>$${iva.toFixed(2)}</span>
                    </div>
                    <div class="total-item total-final">
                        <span>Total:</span>
                        <span>$${total.toFixed(2)}</span>
                    </div>
                </div>
                <div class="carrito-acciones">
                    <button id="vaciar-carrito" class="button button-small">Vaciar</button>
                </div>
            </div>
        `;

        // Actualizar event listener para el botón vaciar
        document.getElementById('vaciar-carrito').addEventListener('click', vaciarCarrito);
    }
}



function vaciarCarrito() {
    productosCarrito = [];
    actualizarCarritoHTML();
    guardarCarritoEnStorage();
    mostrarNotificacion('Carrito vaciado', 'error');
}

function guardarCarritoEnStorage() {
    localStorage.setItem('carrito', JSON.stringify(productosCarrito));
}




