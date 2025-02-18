const Categorias = require('../models/Categorias')
const Grupos = require('../models/Grupos')
const Meeti = require('../models/Meeti')

const moment = require('moment')
const Sequelize = require('sequelize')
const Usuarios = require('../models/Usuarios')
const Op = Sequelize.Op

exports.home = async (req, res) => {

    // Promise para consultas
    const consultas = []
    consultas.push(Categorias.findAll({}))
    consultas.push(Meeti.findAll({
        atrributes: ['slug', 'titulo', 'fecha', 'hora'],
        where: {
            fecha: { [Op.gte]: moment(new Date()).format("YYYY-MM-DD") }
        },
        limit: 3,
        order: [
            ['fecha', 'ASC']
        ],
        include: [
            { model: Grupos, attributes: ['imagen'] },
            { model: Usuarios, attributes: ['nombre', 'imagen'] }
        ]
    }))

    // extraer y pasar a la vista
    const [categorias, meetis] = await Promise.all(consultas)

    res.render('home', {
        nombrePagina: 'Inicio',
        categorias,
        meetis,
        moment
    })
}