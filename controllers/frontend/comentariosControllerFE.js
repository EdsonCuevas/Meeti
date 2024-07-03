const Comentarios = require('../../models/Comentarios')
const Meeti = require('../../models/Meeti')

exports.agregarComentarios = async (req, res, next) => {
    // Obtener comentario
    const { comentario } = req.body

    // Crear comentario en la bd
    await Comentarios.create({
        mensaje: comentario,
        usuarioId: req.user.id,
        meetiId: req.params.id
    })

    // Redireccionar a la misma page
    res.redirect('back')
    next()
}

exports.eliminarComentario = async (req, res, next) => {
    // Tomar el id del  comentario
    const { comentarioId } = req.body

    // Consultar el comentario
    const comentario = await Comentarios.findOne({ where: { id: comentarioId } })

    // Verficiar si existe el comentario
    if (!comentario) {
        res.status(404).send('Acción no válida')
        return next()
    }

    // Consultar el meeti del comentario
    const meeti = await Meeti.findOne({ where: { id: comentario.meetiId } })

    // Verificar que el creador solo lo pueda borrar
    if (comentario.usuarioId === req.user.id || meeti.usuarioId === req.user.id) {
        await Comentarios.destroy({ where: { id: comentario.id } })
        res.status(200).send('Eliminado Correctamente')
        return next()
    } else {
        res.status(403).send('Acción no válida')
        return next()
    }


}