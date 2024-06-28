const Usuarios = require('../models/Usuarios')
const enviarEmail = require('../handlers/emails')

const multer = require('multer')
const shortid = require('shortid')
const fs = require('fs')

const configuracionMulter = {
    limits: { fileSize: 100000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname + '/../public/uploads/perfiles')
        },
        filename: (req, file, next) => {
            const extension = file.mimetype.split('/')[1]
            next(null, `${shortid.generate()}.${extension}`)
        }
    }),
    fileFilter(req, file, next) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            // el formato es valido
            next(null, true)
        } else {
            // el formato no es valido
            next(new Error('Formato no válido'), false)
        }
    }
}

const upload = multer(configuracionMulter).single('imagen')

exports.subirImagen = (req, res, next) => {
    upload(req, res, function (error) {
        if (error) {
            if (error instanceof multer.MulterError) {
                if (error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo es muy grande')
                } else {
                    req.flash('error', error.message)
                }
            } else if (error.hasOwnProperty('message')) {
                req.flash('error', error.message)
            }
            res.redirect('back')
            return
        } else {
            next()
        }
    })
}

exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crear tu Cuenta'
    })
}

exports.crearNuevaCuenta = async (req, res) => {
    const usuario = req.body;

    req.checkBody('confirmar', 'La contraseña repetida no puede ir vacia').notEmpty()
    req.checkBody('confirmar', 'La contraseña es diferente').equals(req.body.password)

    // Leer los erroes de express
    const erroresExpress = req.validationErrors()

    try {
        await Usuarios.create(usuario);

        // Generar url de confirmación
        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`

        await enviarEmail.enviarEmail({
            usuario,
            url,
            subject: 'Confirma tu cuenta de Meeti',
            archivo: 'confirmar-cuenta'
        })

        req.flash('exito', 'Hemos enviando un email, confirma tu cuenta');
        res.redirect('/iniciar-sesion');
    } catch (error) {
        let erroresSequelize = [];
        // Extraer el msg de los errores
        const errExp = erroresExpress.map(err => err.msg)

        if (error.errors && Array.isArray(error.errors)) {
            erroresSequelize = error.errors.map(err => err.message);
        }

        if (erroresSequelize.length === 0) {
            erroresSequelize.push('Usuario ya registado');
        }

        const listaErrores = [...erroresSequelize, ...errExp]

        req.flash('error', listaErrores);
        res.redirect('/crear-cuenta');
    }
};

// Confirma la suscripcion del usuario
exports.confirmarCuenta = async (req, res, next) => {
    // Verificar que el user existe
    const usuario = await Usuarios.findOne({ where: { email: req.params.correo } })

    if (!usuario) {
        req.flash('error', 'No existe esa cuenta')
        res.redirect('/crear-cuenta')
        return next()
    }

    usuario.activo = 1
    await usuario.save()
    req.flash('exito', 'La cuenta ya se ha confirmado, ya puedes iniciar sesión')
    res.redirect('/iniciar-sesion')

}

// Formulario para iniciar sesion
exports.formIniciarSesion = (req, res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar Sesion'
    })
}

// Muestra formulario para editar perfil
exports.formEditarPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id)

    res.render('editar-perfil', {
        nombrePagina: 'Editar Perfil',
        usuario
    })
}

// Almacena en la bd los cambios al perfil
exports.editarPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id)

    req.sanitizeBody('nombre')
    req.sanitizeBody('email')
    // Leer datos del form
    const { nombre, descripcion, email } = req.body

    // asignar los valores
    usuario.nombre = nombre
    usuario.descripcion = descripcion
    usuario.email = email

    //guardar
    await usuario.save()
    req.flash('exito', 'Cambios Guardados Correctamente')
    res.redirect('/administracion')
}

// Formulario para cambiar password
exports.formCambiarPassword = (req, res) => {
    res.render('cambiar-password', {
        nombrePagina: 'Cambiar Contraseña'
    })
}

// Almacenar el nuevo password
exports.cambiarPassword = async (req, res, next) => {
    const usuario = await Usuarios.findByPk(req.user.id)

    if (!usuario.validarPassword(req.body.anterior)) {
        req.flash('error', 'La contraseña actual es incorrecta')
        res.redirect('/cambiar-password')
        return next()
    }

    const hash = usuario.hashPassword(req.body.nuevo)

    usuario.password = hash

    await usuario.save()

    req.logout(function (err) {
        console.log(err)
    })
    req.flash('exito', 'Contraseña Modificada Correctamente, vuelve a iniciar sesion')
    res.redirect('/iniciar-sesion')
}

// Formulario para subir imagen de perfil
exports.formSubirImagenPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id)

    res.render('imagen-perfil', {
        nombrePagina: 'Subir Imagen Perfil',
        usuario
    })
}

// Almacenar imagen de perfil, elimina la anterior y guarda el registro en la bd
exports.guardarImagenPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id)

    // si hay imagen anterior, eliminarla
    if (req.file && usuario.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/perfiles/${usuario.imagen}`

        // Eliminar archivo con filesystem
        fs.unlink(imagenAnteriorPath, (error) => {
            if (error) {
                console.log(error)
            }
            return
        })
    }
    //almacenarla
    if (req.file) {
        usuario.imagen = req.file.filename
    }
    // alamacenar en la bd
    await usuario.save()
    req.flash('exito', 'Cambios Almacenados Correctamente')
    res.redirect('/administracion')


}