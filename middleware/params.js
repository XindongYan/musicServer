module.exports = () => {
  return async (ctx, next) => {
    if (ctx.method === 'POST') {
      ctx.params = ctx.request.body;
    } else {
      ctx.params = ctx.query;
    };

    await next();
  };
};