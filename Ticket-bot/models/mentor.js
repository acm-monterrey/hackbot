const { Schema, model } = require('mongoose')

const mentor = Schema({
    username: String,
    skills: Array,
    status: Boolean,
    description: String,
})

module.exports = model('mentor', mentor)