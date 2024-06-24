const Categorias = require('../models/Categorias')
const Grupos = require('../models/Grupos')

exports.formNuevoGrupo = async (req, res) => {
    const categorias = await Categorias.findAll()
    res.render('nuevo-grupo', {
        nombrePagina: 'Crea un nuevo grupo',
        categorias
    })
}

// Almacena los grupos en la bd
exports.crearGrupo = async (req, res) => {

    // Sanitizar campos
    req.sanitizeBody('nombre')
    req.sanitizeBody('url')

    // Extraer los campos del formulario
    const grupo = req.body
    // Almacena el usuario autenticado como el creador del grupo
    grupo.usuarioId = req.user.id
    // Enlazar la categoria
    grupo.categoriaId = req.body.categoria

    try {
        // Almacenar en la bd
        await Grupos.create(grupo)
        req.flash('exito', 'Se ha creado el Grupo Correctamente')
        res.redirect('/administracion')
    } catch (error) {
        const erroresSequelize = error.errors.map(err => err.message)
        req.flash('error', erroresSequelize)
        res.redirect('/nuevo-grupo')
    }
}