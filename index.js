const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const expressValidator = require('express-validator')
const router = require('./routes')
const passport = require('./config/passport')
const expressEjsLayouts = require('express-ejs-layouts')

// Variables de Desarrollo
require('dotenv').config({ path: 'variables.env' })

// Configuracion y Modelo BD
const db = require('./config/db')
require('./models/Usuarios')
require('./models/Categorias')
require('./models/Grupos')
require('./models/Meeti')
db.sync().then(() => console.log('DB Conectada')).catch((error) => console.log(error))

// Aplicacion Main
const app = express()

// Body Parser, leer formulario
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Express Validator. validacion con funciones
app.use(expressValidator())

//Habilitar EJS como Templete Engine
app.use(expressEjsLayouts)
app.set('view engine', 'ejs')

//Ubicacion de las vistas
app.set('views', path.join(__dirname, './views'))

// Archivos estaticos
app.use(express.static('public'))

// Habilitar cookie parser
app.use(cookieParser())

// Crear la sesion
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false
}))

// Inicializar passport
app.use(passport.initialize())
app.use(passport.session())

// Agrega Flash Messages
app.use(flash())

// Middleware (usuario logueado, flash messages, fecha actual)
app.use((req, res, next) => {
    res.locals.usuario = { ...req.user } || null
    res.locals.mensajes = req.flash()
    const fecha = new Date()
    res.locals.year = fecha.getFullYear()

    next()
})

//Agrega el routing
app.use('/', router())

//Agrega el puerto
app.listen(process.env.PORT, () => {
    console.log('El server esta funcionando')
})