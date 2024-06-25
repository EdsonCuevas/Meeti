const express = require('express')
const router = express.Router()

const homeController = require('../controllers/homeController')
const usuariosController = require('../controllers/usuariosController')
const authController = require('../controllers/authController')
const adminController = require('../controllers/adminController')
const gruposController = require('../controllers/gruposController')
const meetiController = require('../controllers/meetiController')

module.exports = function () {
    router.get('/', homeController.home)

    // Crear y confirmar cuentas
    router.get('/crear-cuenta', usuariosController.formCrearCuenta)
    router.post('/crear-cuenta', usuariosController.crearNuevaCuenta)
    router.get('/confirmar-cuenta/:correo', usuariosController.confirmarCuenta)

    // Iniciar Sesion
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion)
    router.post('/iniciar-sesion', authController.autenticarUsuario)

    // Panel de administracion
    router.get('/administracion',
        authController.usuarioAutenticado,
        adminController.panelAdministracion
    )

    // Nuevos Grupos
    router.get('/nuevo-grupo',
        authController.usuarioAutenticado,
        gruposController.formNuevoGrupo
    )

    router.post('/nuevo-grupo',
        authController.usuarioAutenticado,
        gruposController.subirImagen,
        gruposController.crearGrupo
    )

    // Editar un Grupo
    router.get('/editar-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.formEditarGrupo)

    router.post('/editar-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.editarGrupo)

    // Editar la Imagen de un Grupo
    router.get('/imagen-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.formEditarImagen)

    router.post('/imagen-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.subirImagen,
        gruposController.editarImagen
    )

    // Eliminar Grupos
    router.get('/eliminar-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.formEliminarGrupo
    )
    router.post('/eliminar-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.eliminarGrupo
    )

    // Nuevos Meeti
    router.get('/nuevo-meeti',
        authController.usuarioAutenticado,
        meetiController.formNuevoMeeti
    )

    return router
}