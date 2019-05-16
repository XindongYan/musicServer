const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let userSchema = new Schema({
    username: { type: String },
    password: { type: String },
    avatar: { type: String },
    likes: { type: Array, default: [] }, // 喜欢的歌, [{ name: '', score: 7.9, cover: '', source: '', commit: '' }]
    commit: { type: Array, default: [] }, //评论
    type: { type: String, default: 'user' }, // master or user
    enable: { type: Boolean, default: true }
}, {
    timestamps: true
});

module.exports.userModel = mongoose.model('user', userSchema);