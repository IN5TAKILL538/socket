import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

app.use(cors());
app.use(express.json());

let queue = []; 
let employees = {}; // { empleadoID: turno }
let lastTurnNumber = 0;
let lastCalledTurn = null;

// Función para generar un nuevo turno con continuidad
const generateTurn = () => {
  lastTurnNumber++;
  return `A${String(lastTurnNumber).padStart(3, '0')}`;
};

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  // Enviar estado inicial
  socket.emit('update-queue', queue);
  socket.emit('update-employees', employees);
  socket.emit('update-last-turn', lastCalledTurn);

  // Cuando un cliente inicia sesión, se genera un turno
  socket.on('new-turn', () => {
    const newTurn = generateTurn();
    queue.push(newTurn);
    io.emit('update-queue', queue);
  });

  // Cuando un empleado toma un turno
  socket.on('take-turn', (employeeId) => {
    if (queue.length > 0) {
      const turn = queue.shift();
      employees[employeeId] = turn;
      lastCalledTurn = turn;
      io.emit('update-queue', queue);
      io.emit('update-employees', employees);
      io.emit('update-last-turn', lastCalledTurn);
    }
  });

  // Cuando un empleado termina un turno
  socket.on('end-turn', (employeeId) => {
    delete employees[employeeId];
    io.emit('update-employees', employees);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Agregar esto después de las líneas de configuración app.use
app.use(express.static('public'));

// Opcional: Ruta para manejar todas las solicitudes y devolver index.html



const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
