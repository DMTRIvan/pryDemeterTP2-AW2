const traerProductos = async () => {
    try {
        const contenedor = document.getElementById('productos')
        const datosProductos = await fetch('http://localhost:3000/productos')
        const datosJSON = await datosProductos.json()
        console.log(datosJSON);
        let HTML = '';
        datosJSON.productos.forEach((producto) => {
            HTML += `
            <article>
                <ul>
                    <li class="productos-nombre">Nombre: ${producto.nombre}</li>
                    <li class="productos-nombre">Marca: ${producto.marca}</li>
                    <li class="productos-nombre">Categoria: ${producto.categoria}</li>
                    <li class="productos-nombre">Stock: ${producto.stock}</li>
                    <a class="productos-nombre__boton" href="editar.html?id=${producto.id}">Editar</a>
                </ul>
            </article>
            `;
        })
        contenedor.innerHTML = HTML;
    } catch (error) {
        console.log(error)
    }
}
traerProductos();