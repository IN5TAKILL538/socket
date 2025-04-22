import  express from 'express'
import cors from 'cors'
import http from 'http'
import * as io from "socket.io"
//const { socketController } = require('../sockets/controller');
import { socketController } from '../sockets/server.js';

class Server {

    constructor() {
        this.app    = express();
        this.port   = process.env.PORT;
        this.server = http.createServer( this.app );
        this.io     = new io.Server( this.server );//io toda la info de los sockets conectados.

        this.paths = {};

        // Middlewares
        this.middlewares();

        // Rutas de mi aplicación
        this.routes();

        // Sockets
        this.sockets();
    }

    middlewares() {

        // CORS
        this.app.use( cors() );

        // Directorio Público
        this.app.use( express.static('public') );

    }

    routes() {
        
        // this.app.use( this.paths.auth, require('../routes/auth'));
        
    }

    sockets() {

        this.io.on('connection', socketController );

    }

    listen() {
        this.server.listen( this.port, () => {
            console.log('Servidor corriendo en puerto', this.port );
        });
    }

}




export {Server};