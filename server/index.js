'use strict'

var express = require('express')
var bodyParser = require('body-parser')
var db = require('../db')
var helpers = require('./helpers')

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

function all(req, res) {
    var result = {
        errors: [],
        data: db.all()
    }

    /* Use the following to support just HTML:  */
    /* Support both a request for JSON and a request for HTML  */
    res.format({
        json: () => res.json(result),
        html: () => res.render('list.ejs', Object.assign({}, result, helpers))
    })
}

function get(req, res) {
    var id = req.params.id
    var has
    var result = {
        errors: [],
        data: undefined
    }
    try {
        has = db.has(id)
    } catch (err) {
        // 400 invalid id
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
        res.format({
            json: () => res.json(result),
            html: () => res.render('error.ejs', Object.assign({}, result, helpers))
        })
        return

    }

    if (has) {
        result.data = db.get(id)
        // 200 ok
        res.format({
            json: () => res.json(result),
            html: () => res.render('detail.ejs', Object.assign({}, result, helpers))
        })

    } else if (db.removed(id)) {
        result = {
            errors: [
                {
                    id: 410,
                    title: 'Gone',
                    description: 'This animal was removed',
                    detail: 'detail'
                }
        ]
        }
        res.format({
            json: () => res.json(result),
            html: () => res.render('error.ejs', Object.assign({}, result, helpers))
        })

    } else {
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

    }
}

function upload(req, res) {
    res.render('upload.html')
}


function remove(req, res) {
    var id = req.params.id
    var has
    var result = {
        errors: [],
        data: undefined
    }
    try {
        has = db.has(id)
    } catch (err) {
        // 400 invalid id
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
        res.format({
            json: () => res.json(result),
            html: () => res.render('error.ejs', Object.assign({}, result, helpers))
        })

    }

    if (has) {
        result.data = db.remove(id)
        result = {
            errors: [
                {
                    id: 204,
                    title: 'No Content',
                    description: 'No Content',
                    detail: 'detail'
                }
        ]
        }
        // 204 No Content
        res.format({
            json: () => res.json(result),
            html: () => res.render('error.ejs', Object.assign({}, result, helpers))
        })

    } else {
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

    }
}

function add(req, res) {
    var result = {
        errors: [],
        data: undefined
    }
    var addAnimal = {
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
        intake: req.body.intake
    }
    if (addAnimal.type === 'dog' || addAnimal.type === 'rabbit') {
        addAnimal.declawed = undefined
    } else if (addAnimal.type === 'cat' || addAnimal.type != undefined) {
        addAnimal.declawed = 'true'
    } else {
        addAnimal.declawed = undefined
    }

    if (addAnimal.secondaryColor === '' || addAnimal.secondaryColor === undefined) {
        addAnimal.secondaryColor = undefined
    }


    try {
        var newAnimal = db.add(addAnimal)
        res.format({
            json: () => res.json(result),
            html: () => res.redirect('/' + newAnimal.id)
        })
        console.log('added')
    } catch (err) {
        console.log(addAnimal)
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
        res.format({
            json: () => res.json(result),
            html: () => res.render('error.ejs', Object.assign({}, result, helpers))
        })



    }
}
