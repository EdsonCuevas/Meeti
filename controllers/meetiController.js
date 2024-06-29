const Grupos = require('../models/Grupos')
const Meeti = require('../models/Meeti')

const { v4: uuidv4 } = require('uuid');

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

    meeti.id = uuidv4()

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

// Muestra el formulario para editar un meeti
exports.formEditarMeeti = async (req, res, next) => {
    const consultas = []

    consultas.push(Grupos.findAll({ where: { usuarioId: req.user.id } }))
    consultas.push(Meeti.findByPk(req.params.id))

    // return promise
    const [grupos, meeti] = await Promise.all(consultas)

    if (!grupos || !meeti) {
        req.flash('error', 'Operacion no valida')
        res.redirect('/administracion')
        return next()
    }

    //mostrar vista
    res.render('editar-meeti', {
        nombrePagina: `Editar Meeti : ${meeti.titulo}`,
        grupos,
        meeti
    })
}

// Almacena los cambios en el meeti
exports.editarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({ where: { id: req.params.id, usuarioId: req.user.id } })

    if (!meeti) {
        req.flash('error', 'Operacion no valida')
        res.redirect('/administracion')
        return next()
    }

    // Asignar los valores
    const { grupoId, titulo, invitado, fecha, hora, cupo, descripcion, direccion, ciudad, estado, pais, lat, lng } = req.body

    meeti.grupoId = grupoId
    meeti.titulo = titulo
    meeti.invitado = invitado
    meeti.fecha = fecha
    meeti.hora = hora
    meeti.cupo = cupo
    meeti.descripcion = descripcion
    meeti.direccion = direccion
    meeti.ciudad = ciudad
    meeti.estado = estado
    meeti.pais = pais

    //asignar point (ubicacion)
    const point = {
        type: 'Point', coordinates: [parseFloat(lat), parseFloat(lng)]
    }
    meeti.ubicacion = point

    // almacenarlo en la db
    await meeti.save()
    req.flash('exito', 'Cambios Guardados Correctamente')
    res.redirect('/administracion')
}

// Mostrar el formulario para eliminar meeti
exports.formEliminarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({ where: { id: req.params.id, usuarioId: req.user.id } })

    if (!meeti) {
        req.flash('error', 'Operación no válida')
        res.redirect('/administracion')
        return next()
    }

    // todo bien, ejecutar la vista
    res.render('eliminar-meeti', {
        nombrePagina: `Eliminar Meeti : ${meeti.titulo}`
    })
}

// Eliminar Meeti de la bd
exports.eliminarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({ where: { id: req.params.id, usuarioId: req.user.id } })

    // Eliminar el meeti completo
    await Meeti.destroy({
        where: {
            id: req.params.id
        }
    })

    // Redireccionar
    req.flash('exito', 'Meeti Eliminado')
    res.redirect('/administracion')
}