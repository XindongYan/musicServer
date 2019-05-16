require('./mongoose/connection')();

const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const session = require('koa-session');
const { upload } = require('./utils/upload');
const { body } = require('./utils/music');

const path = require('path')

const params = require('./middleware/params');

const index = require('./controller');
const cors = require('koa2-cors');

const app = new Koa();

app.use(cors({
  credentials: true,
}));

// 解析POST请求
app.use(bodyParser({
  enableTypes: ['json', 'form', 'text'],
  extendTypes: {
      text: ['text/xml', 'application/xml']
  },
}));

app.use(params());

app.keys = ['music'];

const CONFIG = {
    key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    maxAge: 86400000,
    overwrite: true, /** (boolean) can overwrite or not (default true) */
    httpOnly: true, /** (boolean) httpOnly or not (default true) */
    signed: true, /** (boolean) signed or not (default true) */
    rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. default is false **/
  };

app.use(session(CONFIG, app));

app.use(require('koa-static')(path.join(__dirname, './public')));

const userRouter1 = new Router();

// 注册
userRouter1.all('/api/register', index.register);

// 上传更新
userRouter1.all('/api/login', index.login);

// 上传头像图片
userRouter1.all('/api/uploadImg', upload.single('image'), index.avatar);

app.use(userRouter1.routes());

// app.use(async function (ctx, next) {
//   console.log(ctx.session);
//   if (!ctx.session || !ctx.session.user) {
//       ctx.body = {
//           code: 401
//       }
//   } else {
//       await next();
//   }
// });

const router = new Router();

// 取消喜欢
router.all('/api/removeLike', index.removeLike);

// 获取评分
router.all('/api/commit/list', index.commit_list);

// 添加评分
router.all('/api/commit', index.commit);

// 获取用户信息
router.all('/api/users', index.users);

// 收藏音乐
router.all('/api/like', index.like);

// 获取音乐列表
router.all('/api/music/list', index.musicList);

// 上传音乐信息
router.all('/api/uploadFile', index.music);

// 上传音乐
router.all('/api/uploadMusic', body, index.uploadMusic);

app.use(router.routes());

const port = 3000;

app.listen(port);
console.log(`server port ${port}!`);