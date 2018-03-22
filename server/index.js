'use strict'

var express = require('express')
var bodyParser = require('body-parser')
var db = require('../db')
var multer = require('multer')
var helpers = require('./helpers')
var mysql = require('mysql')


require('dotenv').config()

var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

connection.connect()
console.log('Server is Listening')

module.exports = express()
    .set('view engine', 'ejs')
    .set('views', 'view')
    .use(bodyParser.urlencoded({
        extended: true
    }))
    .use(bodyParser.json())
    .use(express.static('static'))
    .use('/image', express.static('./db/image'))
    // TODO: Serve the images in `db/image` on `/image`.
    .get('/', all)
    .get('/upload', upload)
    /* TODO: Other HTTP methods. */
    .post('/', add)
    .get('/:id', get)
    // .put('/:id', set)
    // .patch('/:id', change)
    .delete('/:id', remove)
    .listen(1902)

function all(req, res, next) {
    connection.query('SELECT * FROM animals', done)

    function done(err, data) {
        if (err) {
            next(err)
        } else {
            res.render('list.ejs', {
                data: data
            })
        }
    }
}

function get(req, res, next) {
    var id = req.params.id
    var badRequest = isNaN(id)
    console.log(badRequest)

    connection.query('SELECT * FROM animals WHERE id = ?', id, done)

    function done(err, data) {
        if (err) {
            console.error(err)

        } else if (id.length != 5 || badRequest) {
            result = {
                errors: [
                    {
                        id: 400,
                        title: 'Bad Request',
                        description: 'Bad Request',
                        detail: 'detail'
                }
        ]
            }
            res.render('error.ejs', Object.assign({}, result, helpers))
            return
        } else if (data.length === 0) {
            // 404 not found
            result = {
                errors: [
                    {
                        id: 404,
                        title: 'Page Not Found',
                        description: 'This animal does not exist',
                        detail: 'detail'
                }
        ]
            }
            res.format({
                json: () => res.json(result),
                html: () => res.render('error.ejs', Object.assign({}, result, helpers))
            })
            return
        } else {
            var result = {
                data: data[0]
            }
            res.render('detail.ejs', Object.assign({}, result, helpers))

        }
    }
}

function upload(req, res) {
    res.render('upload.html')
}


function remove(req, res) {
    var id = req.params.id
    connection.query('DELETE FROM animals WHERE id = ?', id, done)

    function done(err) {
        if (err) {
            console.error(err)
        } else {
            res.json({staus: 'ok'})
        }
    }
}

function add(req, res) {
    var input

    connection.query('INSERT INTO animals SET ?', input = {
        name: req.body.name,
        type: req.body.type,
        place: req.body.place,
        description: req.body.description,
        sex: req.body.sex,
        age: parseInt(req.body.age, 10),
        size: req.body.size,
        length: req.body.length,
        vaccinated: req.body.vaccinated == 1,
        declawed: req.body.declawed,
        coat: req.body.coat,
        primaryColor: req.body.primaryColor,
        secondaryColor: req.body.secondaryColor,
        weight: parseInt(req.body.weight, 10),
        date: req.body.intake
    }, done)

    if (input.type === 'dog' || input.type === 'rabbit') {
        input.declawed = undefined
    } else if (input.type === 'cat' || input.type != undefined) {
        input.declawed = 'true'
    } else {
        input.declawed = undefined
    }

    if (input.secondaryColor === '' || input.secondaryColor === undefined) {
        input.secondaryColor = undefined
    }

    function done(err, data) {
        if (err) {
            result = {
                errors: [
                    {
                        id: 422,
                        title: 'Uprocessable Entity',
                        description: 'Uprocessable Entity',
                        detail: 'detail'
                                }
                        ]
            }
            res.render('error.ejs', Object.assign({}, result, helpers))
        } else {
            console.log(err)
            res.redirect('/' + data.insertId)
        }
    }
}
