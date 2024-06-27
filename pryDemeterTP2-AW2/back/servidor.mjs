import { createServer } from 'node:http';
import { gestionarProductos, gestionarProducto, agregarProducto, gestionar404, modificarProducto, borrarProducto, otroMetodo, gestionarOPTION } from './funciones.mjs';

const PUERTO = 3000;

const servidor = createServer(async (peticion, respuesta)=>{
    if(peticion.method === 'GET'){
        if(peticion.url === "/productos"){
            gestionarProductos(respuesta) //Si el metodo es GET y la url es productos llamo esta funcion
        }
        else if(peticion.url.match('/productos')){ //Uso el match para verificar si la URL contiene la cadena "productos" en alguna parte
            gestionarProducto(peticion, respuesta) //Se llama esta funcion que va a buscar por id un producto
        }
        else {
            gestionar404(respuesta)
        }
    }else if(peticion.method === 'POST'){
        if(peticion.url === "/productos"){
            agregarProducto(peticion, respuesta)
        }
        else{
            gestionar404(respuesta) 
        }    
    }else if(peticion.method === 'PUT') {
        if(peticion.url.match('/productos')){
            modificarProducto(peticion, respuesta) 
        }else{
            gestionar404(respuesta)
        }
    }else if(peticion.method === 'OPTIONS') { //El metodo OPTIONS lo pide el navegador para obtener detalles sobre los encabezados admitidos y otras opciones de configuración.
        if(peticion.url.match('/productos')){
            gestionarOPTION(respuesta)
        }else{
            gestionar404(respuesta)
        }
    }else if(peticion.method === 'DELETE'){
        if(peticion.url.match('/productos') ){
            borrarProducto(peticion, respuesta)
        }
        else {
            gestionar404(respuesta) 
        }
    }else{ // Si la petición no es de tipo GET, POST, PUT, OPTIONS o DELETE se llama a la función otroMetodo
        otroMetodo(respuesta) 
    }
})


//mejorar:
servidor.listen(PUERTO, ()=>{
    console.log(`http://localhost:${PUERTO}/productos`);
});