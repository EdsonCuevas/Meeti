const Grupos = require('../models/Grupos')
const Meeti = require('../models/Meeti')

// Muestra el formulario para nuevos meeti
exports.formNuevoMeeti = async (req, res) => {
    const grupos = await Grupos.findAll({ where: { usuarioId: req.user.id } })
    res.render('nuevo-meeti', {
        nombrePagina: 'Crear Nuevo Meeti',
        grupos
    })
}

// Inserta nuevos meeti en la db
exports.crearMeeti = async (req, res) => {
    // obtener los datos del formularios
    const meeti = req.body

    // asignar el usuario creador del meeti
    meeti.usuarioId = req.user.id

    // almacena la ubicacion con un point
    const point = { type: 'Point', coordinates: [parseFloat(req.body.lat), parseFloat(req.body.lng)] }
    meeti.ubicacion = point

    // cupo opciones
    if (req.body.cupo === '') {
        meeti.cupo = 0
    }
    // almacenar en la bd
    try {
        await Meeti.create(meeti)
        req.flash('exito', 'Se ha creado el Meeti Correctamente')
        res.redirect('/administracion')
    } catch (error) {
        const erroresSequelize = error.errors.map(err => err.message)
        req.flash('error', erroresSequelize)
        res.redirect('/nuevo-meeti')
    }
}

// Sanitiza los meeti
exports.sanitizarMeeti = (req, res, next) => {
    req.sanitizeBody('titulo')
    req.sanitizeBody('invitado')
    req.sanitizeBody('cupo')
    req.sanitizeBody('fecha')
    req.sanitizeBody('hora')
    req.sanitizeBody('direccion')
    req.sanitizeBody('ciudad')
    req.sanitizeBody('estado')
    req.sanitizeBody('pais')
    req.sanitizeBody('lat')
    req.sanitizeBody('lng')
    req.sanitizeBody('grupoId')

    next()
}