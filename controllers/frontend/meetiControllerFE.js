const Meeti = require('../../models/Meeti')
const Grupos = require('../../models/Grupos')
const Usuarios = require('../../models/Usuarios')
const Sequelize = require('sequelize')
const Categorias = require('../../models/Categorias')
const Comentarios = require('../../models/Comentarios')
const moment = require('moment')
const Op = Sequelize.Op

exports.mostrarMeeti = async (req, res) => {
    const meeti = await Meeti.findOne({ where: { slug: req.params.slug }, include: [{ model: Grupos }, { model: Usuarios, atrributes: ['id', 'nombre', 'imagen'] }] })

    if (!meeti) {
        res.redirect('/')
    }

    // Consultar por meetis cercanos
    const ubicacion = Sequelize.literal(`ST_GeomFromText( 'POINT( ${meeti.ubicacion.coordinates[0]} ${meeti.ubicacion.coordinates[1]} )' )`)

    // ST_DISTANCE_Sphere = Retorna una linea en metros
    const distancia = Sequelize.fn('ST_DistanceSphere', Sequelize.col('ubicacion'), ubicacion);


    // Encontrar meetis cercanos
    const cercanos = await Meeti.findAll({
        order: distancia, // Los ordena del mas cercano al mas lejano
        where: Sequelize.where(distancia, { [Op.lte]: 2000 }), // 2000 metros o 2km
        limit: 3,
        offset: 1,
        include: [{ model: Grupos }, { model: Usuarios, atrributes: ['id', 'nombre', 'imagen'] }]
    })

    // Consultar despues de verificar que existe el meeti
    const comentarios = await Comentarios.findAll({
        where: { meetiId: meeti.id }, include: [
            {
                model: Usuarios,
                atrributes: ['id', 'nombre', 'imagen']
            }
        ]
    })

    res.render('mostrar-meeti', {
        nombrePagina: meeti.titulo,
        meeti,
        comentarios,
        cercanos,
        moment
    })
}

exports.confirmarAsistencia = async (req, res) => {

    const { accion } = req.body

    if (accion === 'confirmar') {
        // agrega el usuario
        try {
            await Meeti.update(
                { 'interesados': Sequelize.fn('array_append', Sequelize.col('interesados'), req.user.id) },
                { 'where': { 'slug': req.params.slug } }
            );
            res.send('Has confirmado tu asistencia');
        } catch (error) {
            console.error(error);
            res.status(500).send('Hubo un error al confirmar tu asistencia');
        }

    } else {
        // Cancelar la asistencia del user
        try {
            await Meeti.update(
                { 'interesados': Sequelize.fn('array_remove', Sequelize.col('interesados'), req.user.id) },
                { 'where': { 'slug': req.params.slug } }
            );
            res.send('Has cancelado tu asistencia');
        } catch (error) {
            console.error(error);
            res.status(500).send('Hubo un error al cancelado tu asistencia');
        }
    }

}

// Muestra el listado de asistentes
exports.mostrarAsistentes = async (req, res) => {
    const meeti = await Meeti.findOne({ where: { slug: req.params.slug }, atrributes: ['interesados'] })

    // extraer interesados
    const { interesados } = meeti

    const asistentes = await Usuarios.findAll({
        atrributes: ['nombre', 'imagen'],
        where: { id: interesados }
    })

    // pasar los datos a la vista
    res.render('asistentes-meeti', {
        nombrePagina: 'Listado de Asistentes',
        asistentes
    })
}

// Muesta los meetis por categoria
exports.mostrarCategoria = async (req, res, next) => {
    const categoria = await Categorias.findOne({ where: { slug: req.params.slug }, atrributes: ['id', 'nombre'] })
    const meetis = await Meeti.findAll({
        order: [
            ['fecha', 'ASC'],
            ['hora', 'ASC']
        ],
        include: [{
            model: Grupos,
            where: { categoriaId: categoria.id }
        },
        {
            model: Usuarios
        }
        ]
    })

    res.render('categoria', {
        nombrePagina: `Categoria: ${categoria.nombre}`,
        meetis,
        moment
    })

    console.log(categoria.id)
}