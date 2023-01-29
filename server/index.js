const Koa = require('koa');
const http = require('http');
const convert = require('koa-convert');
const json = require('koa-json');
const bodyparser = require('koa-bodyparser')();
const logger = require('koa-logger');
const cors = require('@koa/cors');
const router = require('koa-router')();
const serve = require('koa-static');
const views = require('koa-views');
const session = require('koa-session');

const user = require('./routes/user');
const group = require('./routes/group');
const github = require('./routes/github');

const pollingGroups = require('./pollingGroups');

const {
  errorHandler,
  extendCtx
} = require('./middleware/api');

const config = require('./config');
const { assert, Errors } = require('./utils/validator');

assert(config.node, Errors.ERR_IS_REQUIRED('config.node'));
assert(config.node.origin, Errors.ERR_IS_REQUIRED('config.node.origin'));
assert(config.github, Errors.ERR_IS_REQUIRED('config.github'));
assert(config.github.client_id, Errors.ERR_IS_REQUIRED('config.github.client_id'));
assert(config.github.client_secret, Errors.ERR_IS_REQUIRED('config.github.client_secret'));

const app = new Koa();
const port = 9000;
 
app.use(convert(bodyparser));
app.use(convert(json()));
app.use(convert(logger()));
app.use(cors({
  credentials: true
}));
app.use(views(__dirname + '/build'));
app.use(serve('build', {
  maxage: 365 * 24 * 60 * 60,
  gzip: true
}));
app.keys = ['e1b657856a2134217e5f2e4b15527a32'];
app.use(session({
  key: 'session',
  maxAge: 86400000,
  overwrite: true,
  httpOnly: true,
  signed: true,
  rolling: false,
  renew: false,
}, app));
app.proxy = true;

router.all('(.*)', errorHandler);
router.all('(.*)', extendCtx);

router.use('/favicon.ico', async (ctx) => ctx.body = true);
router.use('/api/users', user.routes(), user.allowedMethods());
router.use('/api/groups', group.routes(), group.allowedMethods());
router.use('/api/github', github.routes(), github.allowedMethods());

router.use('(.*)', async ctx => ctx.render('index'));

app.use(router.routes(), router.allowedMethods());

app.on('error', function (err) {
  console.log(err)
});

const server = http.createServer(app.callback());
server.listen(port, () => {
  console.log(`Node.js v${process.versions.node}`);
  console.log(`Server run at ${port}`);
  pollingGroups();
});
