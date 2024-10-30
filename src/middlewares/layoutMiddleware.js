function layoutMiddleware(req, res, next) {
  res.locals.layout = "layout";
  next();
}

module.exports = { layoutMiddleware };
