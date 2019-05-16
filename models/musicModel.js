const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let musicSchema = new Schema({
    name: { type: String },   // 歌名
    singer: { type: String }, // 歌手
    cover: { type: String },  // 封面
    source: { type: String },  // 歌曲url
    likes: { type: Array, default: [] },  // 喜欢人数
    uploader: { type: String, ref: 'user' }, //上传者
}, {
    timestamps: true
});

module.exports.musicModel = mongoose.model('music', musicSchema);