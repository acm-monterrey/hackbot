const { Schema, model } = require('mongoose')

const mentor = Schema({
    discordId: String,
    name: String,
    username: String,
    skills: Array,
    status: Boolean,
    description: String,
}, {   
    collection: 'mentors',
    timestamps: true
})

module.exports = model('mentor', mentor)