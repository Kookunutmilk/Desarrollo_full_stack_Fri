const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const SECRET = 'clave_secreta';

app.use(bodyParser.json());

/* ===== FUNCIONES ARCHIVOS ===== */

async function obtenerTareas() {
    try {
        const data = await fs.readFile('tareas.json', 'utf8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

async function guardarTareas(tareas) {
    await fs.writeFile('tareas.json', JSON.stringify(tareas, null, 2));
}

async function obtenerUsuarios() {
    try {
        const data = await fs.readFile('usuarios.json', 'utf8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

async function guardarUsuarios(usuarios) {
    await fs.writeFile('usuarios.json', JSON.stringify(usuarios, null, 2));
}

/* ===== AUTENTICACION ===== */

function autenticarToken(req, res, next) {

    const token = req.headers['authorization'];

    if (!token) return res.status(401).send('Acceso denegado');

    jwt.verify(token, SECRET, (err, user) => {

        if (err) return res.status(403).send('Token inválido');

        req.user = user;
        next();
    });
}

/* ===== REGISTER ===== */

app.post('/register', async (req, res) => {

    const { username, password } = req.body;

    const usuarios = await obtenerUsuarios();

    if (usuarios.find(u => u.username === username)) {
        return res.status(400).send('Usuario ya existe');
    }

    const hash = await bcrypt.hash(password, 10);

    usuarios.push({ username, password: hash });

    await guardarUsuarios(usuarios);

    res.status(201).send('Usuario registrado');
});

/* ===== LOGIN ===== */

app.post('/login', async (req, res) => {

    const { username, password } = req.body;

    const usuarios = await obtenerUsuarios();

    const usuario = usuarios.find(u => u.username === username);

    if (!usuario) return res.status(400).send('Usuario no encontrado');

    const valido = await bcrypt.compare(password, usuario.password);

    if (!valido) return res.status(401).send('Contraseña incorrecta');

    const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });

    res.json({ token });
});

/* ===== RUTAS TAREAS ===== */

app.get('/tareas', autenticarToken, async (req, res) => {
    const tareas = await obtenerTareas();
    res.json(tareas);
});

app.post('/tareas', autenticarToken, async (req, res) => {

    const tareas = await obtenerTareas();

    const nuevaTarea = {
        id: Date.now(),
        ...req.body
    };

    tareas.push(nuevaTarea);

    await guardarTareas(tareas);

    res.status(201).json(nuevaTarea);
});

app.put('/tareas/:id', autenticarToken, async (req, res) => {

    const tareas = await obtenerTareas();
    const id = parseInt(req.params.id);

    const index = tareas.findIndex(t => t.id === id);

    if (index === -1) return res.status(404).send('Tarea no encontrada');

    tareas[index] = { ...tareas[index], ...req.body };

    await guardarTareas(tareas);

    res.send('Tarea actualizada');
});

app.delete('/tareas/:id', autenticarToken, async (req, res) => {

    let tareas = await obtenerTareas();
    const id = parseInt(req.params.id);

    tareas = tareas.filter(t => t.id !== id);

    await guardarTareas(tareas);

    res.send('Tarea eliminada');
});

/* ===== ERRORES ===== */

app.use((req, res) => {
    res.status(404).send('Ruta no encontrada');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Error en el servidor');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
