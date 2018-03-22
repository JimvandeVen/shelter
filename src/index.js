'use strict'
/* eslint-env browser */
/* eslint-disable semi */

var moment = require('moment')

var times = document.getElementsByTagName('time')
var length = times.length
var index = -1
var time

while (++index < length) {
    time = times[index]
    time.textContent = moment(time.dateTime, 'YYYY-MM-DD').fromNow()
    time.title = time.dateTime
}

var remove = document.querySelectorAll('.remove')

if (remove.length) {
    remove.forEach(function(button) {
        button.addEventListener('click', onremove)
    })
}

function onremove(ev) {
    var button = ev.target
    var id = button.dataset.id

    fetch('/' + id, {method: 'delete'})
        .then(onresponse)
        .then(onload, onfail)

    function onresponse(res) {
        return res.json()
    }

    function onload() {
        window.location = '/'
    }

    function onfail() {
        throw new Error('Could not delete!')
    }
}
