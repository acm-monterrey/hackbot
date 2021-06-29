const { Schema, model } = require('mongoose')

const mentor = Schema({
    userID: String,
    username: String,
    skills: Array,
    status: Boolean,
    description: String,
})

module.exports = model('mentor', mentor)