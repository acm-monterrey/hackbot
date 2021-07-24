const { Schema, model } = require('mongoose')

const mentor = Schema({
    discordId: String,
    name: String,
    username: String,
    skills: Array,
    status: Boolean,
    description: String,
}, { collection : 'mentors'})

module.exports = model('mentor', mentor)