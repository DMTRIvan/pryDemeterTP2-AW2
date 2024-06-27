const contenedorMensaje = document.getElementById('mensaje-accion');

const mostrarMensajeOk = (mensaje) => {
    contenedorMensaje.textContent = mensaje;
    contenedorMensaje.style.display = 'block';
    contenedorMensaje.classList.add('mensaje-accion-ok');
};

const mostrarMensajeAlerta = (mensaje) => {
    contenedorMensaje.textContent = mensaje;
    contenedorMensaje.style.display = 'block';
    contenedorMensaje.classList.add('mensaje-accion-alerta');
};

const registrarProducto = () => {
    const formulario = document.getElementById('formulario')
// Agrega un evento de escucha al formulario para el evento 'submit'
    formulario.addEventListener('submit', async(evento)=>{

        // Previene el comportamiento predeterminado del formulario de enviar datos y recargar la página
        evento.preventDefault()

        // Creo un nuevo objeto FormData utilizando los datos del formulario
        const datosCrudos = new FormData(formulario)

        // Convierte los datos crudos del formulario en un objeto JavaScript utilizando Object.fromEntries
        const datosFormulario = Object.fromEntries(datosCrudos)

        // Realiza una solicitud HTTP mediante la API fetch()   
        const respuesta = await fetch(formulario.action, {
            headers:{
                'Content-Type':'application/json'
            },
            method: formulario.method,
            
            // Convierte los datos del formulario en formato JSON y los envía como cuerpo de la solicitud
            body:JSON.stringify(datosFormulario)
        })
        //window.location.href = 'index.html';
        if (respuesta.ok) {
            mostrarMensajeOk('Producto dado de alta');
            formulario.reset();
        } else {
            // El código 400 hace referencia a
            // que el usuario no envio todos los datos
            // Esto lo deben verificar uds. del lado del servidor
            if (respuesta.status === 400) {
                mostrarMensajeAlerta('Datos incompletos');
            } else {
                mostrarMensajeAlerta('Error desconocido');
            }
        }

    })
};

// ---------------------------------------------------------
// Invocar funciones ---------------------------------------
// ---------------------------------------------------------
registrarProducto();
// Animaciones
contenedorMensaje.addEventListener('animationend', () => {
    // contenedorMensaje.classList.add('mensaje-accion-alerta');
    contenedorMensaje.style.display = 'none';
});