import { join, parse } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';

//La variable V1 va a almacenar los productos que estan en  productos.json
let productosV1;

//Esta funcion lee el archivo productos.json y guarda los datos en la variable declarada anteriormente
const leerArchivosJson = async()=>{
    try{
        const ruta = join('api','v1','productos.json');
        const datos = await readFile(ruta, 'utf-8');
        productosV1 = JSON.parse(datos)
    }catch(error){
        console.log(error)
    }
}

//Esta funcio obtiene el id del último producto y le suma 1 para luego asignarlo al producto que se va a agregar
const obtenerID = async()=>{
    await leerArchivosJson();
    try{
        return (productosV1.productos[productosV1.productos.length -1].id + 1);
    }catch{ //En el cazo de que no haya ningun producto va a dar error, entonces le asignamos 1 
        return 1;
    }
}

//Esta funcio devuelve todos los productos que esten almacenados en la variable productosV1
const gestionarProductos = async(respuesta)=>{
    await leerArchivosJson();
    if(productosV1){
        respuesta.setHeader('Access-Control-Allow-Origin', '*')
        respuesta.setHeader('Content-Type', 'application/json;charset=utf-8')
        respuesta.statusCode=200
        respuesta.end(JSON.stringify(productosV1))
    }else{
        respuesta.setHeader('Content-Type', 'text/plain;charset=utf-8')
        respuesta.setHeader('Access-Control-Allow-Origin', '*')
        respuesta.statusCode=404
        respuesta.end("No fue encontrado el recurso");
    }
}

//La siguiente funcion devuelve un producto puntual buscandolo con el id proporcionado en la url
const gestionarProducto = async(peticion, respuesta)=>{
    await leerArchivosJson();
    const id = parse(peticion.url).base; //esto obtiene el id de la url
    const producto = productosV1.productos.find((producto) =>{
        return Number(producto.id) === Number(id);
    }); // Con esto buscamos el producto en la variable utilizando el id y lo almacenamos en la variable producto
    if(producto){ //Si se encuentra el producto se envia la respuesta al cliente
        const respuestaJSON = `{
                "productos":[
                    ${JSON.stringify(producto)}
                ]
            }`;
        respuesta.setHeader('Content-Type', 'application/json;charset=utf-8');
        respuesta.setHeader('Access-Control-Allow-Origin', '*');
        respuesta.statusCode = 200;
        respuesta.end(respuestaJSON);
    }else{
        respuesta.setHeader('Content-Type', 'text/plain;charset=utf-8');
        respuesta.setHeader('Access-Control-Allow-Origin', '*');
        respuesta.statusCode = 404;
        respuesta.end('No se encuentra el producto');
    }
}

//Esta funcion agrega un nuevo producto al archivo productos.json
const agregarProducto = async(peticion, respuesta)=>{
    await leerArchivosJson();
    let datosDelCuerpo = '';
    // Escuchamos el evento 'data' de la petición para obtener los datos del cuerpo de la petición y almacenarlos en la variable datosDelCuerpo
    peticion.on('data', (pedacitos)=>{
        datosDelCuerpo += pedacitos;
    })
    peticion.on('error', (error)=>{
        console.error(error);
        respuesta.setHeader('Content-Type', 'text/plain');
        respuesta.statusCode = 500;
        respuesta.end("Error del servidor")
    })
    // Escuchamos el evento 'end' de la petición para agregar el nuevo producto al archivo productos.json
    peticion.on('end', async()=>{
        try{
            const rutaJson = join('api', 'v1', 'productos.json')
            const datosProducto = JSON.parse(datosDelCuerpo)
            if ( //Corroboro de que los datos que enviaron no esten vacios
                (datosProducto.nombre &&
                datosProducto.marca &&
                datosProducto.categoria &&
                datosProducto.stock !== undefined)
            ) {
                const id = await obtenerID();
                const nuevoProducto = {
                    id: id,
                    nombre: datosProducto.nombre,
                    marca: datosProducto.marca,
                    categoria: datosProducto.categoria,
                    stock: datosProducto.stock
                };
                productosV1.productos.push(nuevoProducto) // Agregamos el nuevo producto a productosV1 con el método push
                await writeFile(rutaJson, JSON.stringify(productosV1)) //Escribo los nuevos datos en productos.json 
                respuesta.setHeader('Access-Control-Allow-Origin', '*');
                respuesta.statusCode=201
                respuesta.end();
            }else { //Si los datos enviados no son validos se envian estos datos. Para que desde el front puedan avisar que los datos ingresados no son correctos
                respuesta.setHeader('Content-Type', 'text/plain');
                respuesta.setHeader('Access-Control-Allow-Origin', '*');
                respuesta.statusCode = 400;
                respuesta.end("Los datos del producto están incompletos o son inválidos");
            }
        }catch(error){
            console.error(error)
            respuesta.setHeader('Content-Type', 'text/plain')
            respuesta.setHeader('Access-Control-Allow-Origin', '*');
            respuesta.statusCode=500;
            respuesta.end("No se pudo agregar el producto")
        }
    })
}
//La siguiente funcion modifica un producto segun el id que se obtiene de la url
const modificarProducto = async(peticion, respuesta)=>{
    await leerArchivosJson();
    const id = parse(peticion.url).base
    const producto = productosV1.productos.find((producto)=>{
        return Number(id) === Number(producto.id)
    })
    if(producto){
        let datosDelCuerpo = ''
        peticion.on('data',(pedacitos)=>{
            datosDelCuerpo += pedacitos
        })
        peticion.on('error',(error)=>{
            console.error(error)
            respuesta.statusCode = 500
            respuesta.setHeader('Content-Type','text/plain')
            respuesta.end('Error del servidor')
        })
        peticion.on('end',async ()=>{
            try{
                const rutaJSON = join('api', 'v1', 'productos.json')
                const cambiarProducto = JSON.parse(datosDelCuerpo)

                //validar que los datos no esten vacios:
                if (
                    cambiarProducto.nombre &&
                    cambiarProducto.marca &&
                    cambiarProducto.categoria &&
                    cambiarProducto.stock !== undefined
                ){const productos = productosV1.productos.map((producto)=>{
                        if(parseInt(producto.id) === parseInt(id)){
                            return {
                                id: parseInt(id),
                                nombre: cambiarProducto.nombre,
                                marca: cambiarProducto.marca,
                                categoria: cambiarProducto.categoria,
                                stock: cambiarProducto.stock
                            };
                        }else{
                            return producto;
                        }
                    })
                    productosV1.productos = productos; // Actualizamos el producto en el arreglo
                    await writeFile(rutaJSON,JSON.stringify(productosV1)) //Escribimos el dato modificado en productos.json
                    respuesta.setHeader('Access-Control-Allow-Origin', '*');
                    respuesta.statusCode = 201
                    respuesta.end()
                }else { //Si los datos enviados no son validos se envian estos datos. Para que desde el front puedan avisar que los datos ingresados no son correctos
                    respuesta.setHeader('Content-Type', 'text/plain');
                    respuesta.setHeader('Access-Control-Allow-Origin', '*');
                    respuesta.statusCode = 400;
                    respuesta.end('Datos incompletos o inválidos');
                }
            }catch(error){
                console.log(error)
                respuesta.setHeader('Content-Type','text/plain')
                respuesta.setHeader('Access-Control-Allow-Origin', '*');
                respuesta.statusCode = 500
                respuesta.end('Error en el servidor')
            }
        })
    } else {
        respuesta.setHeader('Content-Type', 'text/plain;charset=utf-8');
        respuesta.setHeader('Access-Control-Allow-Origin', '*');
        respuesta.statusCode = 404;
        respuesta.end('No se encuentra el producto');
    }
}

//La siguente funcion borra un producto en particular mediante el id que esta en la url
const borrarProducto = async (peticion, respuesta) => {
    await leerArchivosJson();
    const id = parse(peticion.url).base
    const nuevosProductos = productosV1.productos.filter((producto)=>{ //con filter filtramos los productos que no coinciden con el id
       return Number(producto.id) !== Number(id) //El método Number() se usa para asegurarse de que los valores se comparen como números en lugar de como cadenas
    })
    
    try{
        const rutaJson = join('api', 'v1', 'productos.json')
        // Creo un objeto con los productos actualizados para luego poder escribirlos en el archivo productos.json
        const respuestaJSON = { 
            "productos": nuevosProductos
        };
        if (JSON.stringify(productosV1) != JSON.stringify(respuestaJSON)){ //si respuestaJSON es distinto a los produtos que estan en productosV1 se actualiza el archivo json
            await writeFile(rutaJson, JSON.stringify(respuestaJSON))
            respuesta.setHeader('Access-Control-Allow-Origin', '*');
            respuesta.statusCode=201
            respuesta.end();
        }else{
            respuesta.setHeader('Content-Type', 'text/plain;charset=utf-8');
            respuesta.setHeader('Access-Control-Allow-Origin', '*');
            respuesta.statusCode = 404;
            respuesta.end('No se encuentra el producto');
        }
    }catch(error){
        console.error(error)
        respuesta.statusCode=500
        respuesta.setHeader('Content-Type', 'text/plain')
        respuesta.setHeader('Access-Control-Allow-Origin', '*');
        respuesta.end("Error en el servidor");
    }
}

//La siguiente funcion maneja todos los errores en los que el statusCode sea 404 (Cuando no encuentre la ruta)
const gestionar404 = async (respuesta)=>{
    respuesta.setHeader('Content-Type', 'text/plain;charset=utf-8');
    respuesta.setHeader('Access-Control-Allow-Origin', '*');
    respuesta.statusCode = 404;
    respuesta.end('No se encuentra la ruta');
}

//Funcion otroMetodo devuelve un mensaje de error cuando no se encuentra el metodo solicitado
const otroMetodo = (respuesta)=>{
    respuesta. setHeader('Content-Type', 'text/plain')
    respuesta.setHeader('Access-Control-Allow-Origin', '*');
    respuesta.statusCode=200
    respuesta.end(`{
        "productos":[]
    }`)
}

//La siguiente funcion maneja las peticiones de tipo OPTION
const gestionarOPTION = async (respuesta) => {
    try {
        respuesta.setHeader('Access-Control-Allow-Origin', '*');
        respuesta.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        respuesta.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        respuesta.statusCode = 201
        respuesta.end()
    } catch (error) {
        console.error(error)
        respuesta.statusCode=500
        respuesta.setHeader('Content-Type', 'text/plain')
        respuesta.end("Error en el servidor");
    }
} 

export { gestionarProductos, gestionarProducto, agregarProducto, gestionar404, modificarProducto, borrarProducto, otroMetodo, gestionarOPTION}