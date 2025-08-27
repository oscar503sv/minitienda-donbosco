// Mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'exito') {
    const notif = document.createElement('div');
    notif.className = `notificacion ${tipo}`;
    notif.textContent = mensaje;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.remove();
    }, 3000);
}

function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-SV', {
        style: 'currency',
        currency: 'USD'
    }).format(precio);
}

function obtenerFechaActual() {
    return new Date().toLocaleString('es-SV', {
        dateStyle: 'full',
        timeStyle: 'short'
    });
}