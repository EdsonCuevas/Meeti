const passport = require('passport')

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
})

//Revisa si el user esta autenticado o no
exports.usuarioAutenticado = (req, res, next) => {
    // Si el usuario esta autenticado
    if (req.isAuthenticated()) {
        return next()
    }

    // SI NO ESTA AUTENTICADO
    return res.redirect('/iniciar-sesion')
}

// Cerrar Sesion
exports.cerrarSesion = (req, res, next) => {
    req.logout(function (err) {
    })
    req.flash('exito', 'Cerraste Sesión Correctamente')
    res.redirect('iniciar-sesion')
    next()
} 