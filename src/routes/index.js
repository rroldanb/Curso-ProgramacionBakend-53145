const { router: viewsRouter } = require("./views.router.js");
const { router: productsRouter } = require("./api/products.router.js");
const { router: cartsRouter } = require("./api/carts.router.js");
const { sessionsRouter } = require("./api/sessions.router.js");

const { Router } = require("express");
const mailRouter = require("./api/mail.router.js");
const usersRouter = require("./api/users.router.js");
const ticketsRouter = require("./api/tickets.router.js");
const mockingRouter = require("./api/mocking.router.js");
const loggerRouter = require("./api/logger.router.js");
const swaggerUiExpress = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const { swaggerOptions } = require("../config/swagger.config.js");
const paymentsRouter = require("./api/payment.router.js");

const router = Router();
const specs = swaggerJsDoc(swaggerOptions);

router.use("/", viewsRouter);
router.use("/api/products", productsRouter);
router.use("/api/carts", cartsRouter);
router.use('/api/payments', paymentsRouter)

router.use("/api/tickets", ticketsRouter);

router.use("/api/users", usersRouter);

router.use("/api/sessions", sessionsRouter);
router.use('/api/mocking', mockingRouter)
router.use('/api/loggertest', loggerRouter)
router.use('/loggertest', loggerRouter)

router.use("/apidocs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

router.use("/sessions", sessionsRouter);
router.use('/mail', mailRouter)


router.use((req, res, next) => {
  res.status(404).send(`La ruta ${req.url} no está definida para este método`);
});



module.exports = {
  router,
};

