const Categorias = require('../models/Categorias')
const Grupos = require('../models/Grupos')
const multer = require('multer')
const shortid = require('shortid')

const { v4: uuidv4 } = require('uuid');

const fs = require('fs')

const configuracionMulter = {
    limits: { fileSize: 100000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname + '/../public/uploads/grupos')
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

    // Leer la imagen
    if (req.file) {
        grupo.imagen = req.file.filename
    }

    grupo.id = uuidv4()

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

exports.formEditarGrupo = async (req, res) => {
    const consultas = []
    consultas.push(Grupos.findByPk(req.params.grupoId))
    consultas.push(Categorias.findAll())

    // Promise con awair
    const [grupo, categorias] = await Promise.all(consultas)

    res.render('editar-grupo', {
        nombrePagina: `Editar Grupo : ${grupo.nombre}`,
        categorias,
        grupo
    })
}

exports.editarGrupo = async (req, res, next) => {

    const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id } })

    // si no existe ese grupo o no es el dueño
    if (!grupo) {
        req.flash('error', 'Operación no válida')
        res.redirect('/administracion')
        return next()
    }

    const { nombre, descripcion, categoria, url } = req.body

    //asignar los valores
    grupo.nombre = nombre
    grupo.descripcion = descripcion
    grupo.categoriaId = categoria
    grupo.url = url

    //guardar en la bd
    await grupo.save()
    req.flash('exito', 'Cambios Almacenados Correctamente')
    res.redirect('/administracion')
}

exports.formEditarImagen = async (req, res) => {
    const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id } })

    res.render('imagen-grupo', {
        nombrePagina: `Editar Imagen Grupo : ${grupo.nombre}`,
        grupo
    })
}

// Modifica la imagen en la bd y elimina la anterior
exports.editarImagen = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id } })

    // el grupo existe y el valido
    if (!grupo) {
        req.flash('error', 'Operación no válida')
        res.redirect('/administracion')
        return next()
    }

    // Si hay imagen anterior y nueva, se debe borrar la anterior
    if (req.file && grupo.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`

        // Eliminar archivo con filesystem
        fs.unlink(imagenAnteriorPath, (error) => {
            if (error) {
                console.log(error)
            }
            return
        })
    }

    // Si hay una imagen nueva, la guardamos
    if (req.file) {
        grupo.imagen = req.file.filename
    }
    await grupo.save()
    req.flash('exito', 'Cambios Almacenados Correctamente')
    res.redirect('/administracion')
}

// Muestra el formulario para eliminar un grupo
exports.formEliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id } })

    if (!grupo) {
        req.flash('error', 'Operación no válida')
        res.redirect('/administracion')
        return next()
    }

    // todo bien, ejecutar la vista
    res.render('eliminar-grupo', {
        nombrePagina: `Eliminar Grupo : ${grupo.nombre}`
    })
}

// Elimina el grupo e imagen
exports.eliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id } })

    // Si hay una imagen, se elimina
    if (grupo.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`

        // Eliminar archivo con filesystem
        fs.unlink(imagenAnteriorPath, (error) => {
            if (error) {
                console.log(error)
            }
            return
        })
    }

    // Eliminar el grupo completo
    await Grupos.destroy({
        where: {
            id: req.params.grupoId
        }
    })

    // Redireccionar
    req.flash('exito', 'Grupo Eliminado')
    res.redirect('/administracion')
}