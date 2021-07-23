const { Schema, model } = require('mongoose')

const mentor = Schema({
    name: String,
    username: String,
    skills: Array,
    status: Boolean,
    description: String,
}, { collection : 'mentors'})

module.exports = model('mentor', mentor)