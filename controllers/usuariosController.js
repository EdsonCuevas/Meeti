const Usuarios = require('../models/Usuarios')
const enviarEmail = require('../handlers/emails')

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
