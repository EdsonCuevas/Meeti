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

    // Cerrar Sesion
    router.get('/cerrar-sesion',
        authController.usuarioAutenticado,
        authController.cerrarSesion
    )

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
    router.post('/nuevo-meeti',
        authController.usuarioAutenticado,
        meetiController.sanitizarMeeti,
        meetiController.crearMeeti
    )

    // Editar Meeti
    router.get('/editar-meeti/:id',
        authController.usuarioAutenticado,
        meetiController.formEditarMeeti
    )
    router.post('/editar-meeti/:id',
        authController.usuarioAutenticado,
        meetiController.editarMeeti
    )

    //Eliminar Meeti
    router.get('/eliminar-meeti/:id',
        authController.usuarioAutenticado,
        meetiController.formEliminarMeeti
    )
    router.post('/eliminar-meeti/:id',
        authController.usuarioAutenticado,
        meetiController.eliminarMeeti
    )

    // Editar Info Perfil
    router.get('/editar-perfil',
        authController.usuarioAutenticado,
        usuariosController.formEditarPerfil
    )
    router.post('/editar-perfil',
        authController.usuarioAutenticado,
        usuariosController.editarPerfil
    )

    // Cambiar Password
    router.get('/cambiar-password',
        authController.usuarioAutenticado,
        usuariosController.formCambiarPassword
    )
    router.post('/cambiar-password',
        authController.usuarioAutenticado,
        usuariosController.cambiarPassword
    )

    // Imagen Perfil
    router.get('/imagen-perfil',
        authController.usuarioAutenticado,
        usuariosController.formSubirImagenPerfil
    )
    router.post('/imagen-perfil',
        authController.usuarioAutenticado,
        usuariosController.subirImagen,
        usuariosController.guardarImagenPerfil
    )

    return router
}