const { router: viewsRouter } = require("./views.router.js");
const { router: productsRouter } = require("./api/products.router.js");
const { router: cartsRouter } = require("./api/carts.router.js");
const { sessionsRouter } = require("./api/sessions.router.js");

const { Router } = require("express");
const router = Router();

router.use("/", viewsRouter);
router.use("/api/products", productsRouter);
router.use("/api/carts", cartsRouter);

router.use("/sessions", sessionsRouter);
router.use("/api/sessions", sessionsRouter);

router.use((req, res, next) => {
  res.status(404).send(`La ruta ${req.url} no está definida para este método`);
});

router.use((error, req, res, next) => {
  console.log(error);
  res.status(500).send("Error 500 en el server");
});

module.exports = {
  router,
};
