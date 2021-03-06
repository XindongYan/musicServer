const { userModel } = require('../models/userModel');
const { musicModel } = require('../models/musicModel');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

module.exports = {

  musicList: async (ctx, next) => {
    try {
      const { id } = ctx.params;
      let result = void 0;
      
      if (id) {
        result = await userModel.findById({ _id: id }).exec();
        result = result.toObject().likes;
        console.log(result);
      } else {
        result = await musicModel.find({});
      }

      ctx.body = {
        code: 200,
        result
      }
    } catch (error) {
      console.log(error)
      ctx.body = {
        code: 500,
        msg: error.message
      }
    };
  },

  searchMusic: async (ctx, next) => {
    const { name } = ctx.params;
    let music = void 0;

    try {
      if (!name) {
        music = await musicModel.find({});
      } else {
        music = await musicModel.find({ name: { $regex: name } }).exec();
      }
      ctx.body = {
        code: 200,
        music
      }
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: error.message
      }
    }
  },

  freeze: async (ctx, next) => {
    const { id } = JSON.parse(ctx.params);

    try {
      let user = await userModel.findOneAndUpdate({ _id: id, enable: true }, { $set: { enable: false } });
      if (!user) {
        user = await userModel.findOneAndUpdate({ _id: id, enable: false }, { $set: { enable: true } });
        if (!user) {
          throw '用户数据错误'
        }
      }
      ctx.body = {
        code: 200,
        msg: '设置成功'
      }
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: error.message
      }
    }
  },

  commit_list: async (ctx, next) => {
    let { id } = JSON.parse(ctx.params);

    try {
      const result = await userModel.findById({ _id: id }).exec();
      ctx.body = {
        code: 200,
        result: result.toObject().commit
      };
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: error.message
      }
    }
  },

  commit: async (ctx, next) => {
    const params = JSON.parse(ctx.params);
    let { id, score, description, name } = params;

    console.log(score);

    try {
      await userModel.findByIdAndUpdate({ _id: id, enable: true }, { $push: { commit: { score: score, commit: description, name: name } } });
      ctx.body = {
        code: 200,
        msg: '添加成功'
      }
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: '点评失败'
      }
    }
  },

  removeLike: async (ctx, next) => {
    // 音乐id
    let { id, source } = JSON.parse(ctx.params);

    try {

      await musicModel.findByIdAndUpdate({ _id: id }, { $pull: { likes: ctx.session.user.id } });
      await userModel.findByIdAndUpdate({ _id: ctx.session.user.id }, { $pull: { likes: { source: source } } });
      ctx.body = {
        code: 200,
        msg: '已取消喜欢'
      }
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: error.message
      }
    }
  },

  like: async (ctx, next) => {

    // 音乐id
    let { id } = JSON.parse(ctx.params);

    try {
      let music = await musicModel.findById({ _id: id }).exec();
      music = music.toObject();

      await userModel.findByIdAndUpdate({ _id: ctx.session.user.id, enable: true }, { $push: { likes: music } }, { new: true });
      await musicModel.findByIdAndUpdate({ _id: id }, { $push: { likes: ctx.session.user.id } })

      ctx.body = {
        code: 200,
        msg: '添加收藏成功'
      }
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: '收藏失败'
      }
    }
  },

  users: async (ctx, next) => {
    const user = await userModel.findById({ _id: ctx.session.user.id }, 'username').exec();
    console.log(user);
    if (user.username !== 'admin') {
      ctx.body = {
        code: 401
      }
    } else {
      const users = await userModel.find({}).exec()
      ctx.body = {
        code: 200,
        users
      }
    }
  },

  searchUser: async (ctx, next) => {
    const { username } = ctx.params;
    let user = void 0;

    try {
      if (username) {
        user = await userModel.findOne({ username }).exec();
      } else {
        user = await userModel.find({ }).exec();
      }
      ctx.body = {
        code: 200,
        user
      }
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: error.message
      }
    }
  },

  TaMessage: async (ctx, next) => {
    const { id } = ctx.params;

    try {
      const user = await userModel.findById({ _id: id }, 'likes commit').exec();
      const music = await musicModel.find({ uploader: id }).exec();

      ctx.body = {
        code: 200,
        user, music
      }
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: error.message
      }
    }
  },  

  signOut: async (ctx, next) => {
    ctx.session = null;
    ctx.body = {
      code: 200
    }
  },

  login: async (ctx, next) => {
    const { username, password } = JSON.parse(ctx.params);
    const secret = 'machine';

    const hash = crypto.createHmac('sha256', secret)
      .update(password)
      .digest('hex');

    try {
      let user = await userModel.findOne({ username, password: hash, enable: true });
      if (!user) {
        throw '登录信息有误'
      };
      ctx.session.user = { id: user._id, avatar: 'http://127.0.0.1:3000' + user.avatar };
      ctx.body = {
        code: 200,
        user: {
          avatar: 'http://127.0.0.1:3000' + user.avatar,
          id: user._id,
        },
        msg: '登陆成功'
      }
    } catch (error) {
      ctx.body = {
        code: 400,
        msg: error
      }
    }
  },

  register: async (ctx, next) => {
    const { username, password, _id } = JSON.parse(ctx.params);
    console.log(ctx.params);
    const secret = 'machine';

    const hash = crypto.createHmac('sha256', secret)
      .update(password)
      .digest('hex');

    try {
      const user = await userModel.findByIdAndUpdate({ _id }, { $set: { username, password: hash } }).exec();
      ctx.session.user = { id: user._id, avatar: 'http://127.0.0.1:3000' + user.avatar };
      ctx.body = {
        code: 200,
        msg: '注册成功',
        user: {
          avatar: 'http://127.0.0.1:3000' + user.avatar,
          id: user._id,
        }
      }
    } catch (error) {
      console.log(error);
      ctx.body = {
        code: 400,
        msg: '注册失败'
      }
    }
  },

  avatar: async (ctx, next) => {
    let content = {};

    if (ctx.req && ctx.req.file) {
      const fileMsg = ctx.req.file;

      const fileName = fileMsg.filename;

      content.avatar = `/images/${fileName}`;

      let user = new userModel(content);
      try {
        let result = await user.save();
        if (!result) {
          throw '存储失败'
        }
      } catch (error) {
        throw error
      };

      ctx.body = {
        mainImg: user.mainImg,
        _id: user._id
      }
    }
  },

  music: async (ctx, next) => {
    console.log(JSON.parse(ctx.params))
    const { name, author, _id } = JSON.parse(ctx.params);

    try {
      await musicModel.findByIdAndUpdate({ _id }, { $set: { name, singer: author, uploader: ctx.session.user.id } }).exec();
      ctx.body = {
        code: 200,
        msg: '上传成功'
      }
    } catch (error) {
      console.log(error);
      ctx.body = {
        code: 400,
        msg: '上传失败'
      }
    }
  },

  uploadMusic: async (ctx, next) => {
    let content = {};

    if (ctx.request && ctx.request.files) {
      const path = ctx.request.files.music.path;
      const split = path.split('_');
      const fileName = 'upload_' + split[split.length - 1];

      content.source = `/music/${fileName}`;

      let music = new musicModel(content);
      try {
        let result = await music.save();
        if (!result) {
          throw '存储失败'
        }
        ctx.body = {
          _id: music._id
        }
      } catch (error) {
        console.log(error.message);
        ctx.body = {
          code: 500,
          msg: error.message
        }
      };
      
    }
  }

}