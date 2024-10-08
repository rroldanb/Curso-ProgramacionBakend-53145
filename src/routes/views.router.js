const UsersViewsController = require("../controllers/views/users.views.controller.js");
const ProductsViewsController = require("../controllers/views/products.views.controller.js");
const CartsViewsController = require("../controllers/views/carts.views.controller.js");
const SessionsController  = require("../controllers/sessions.controller.js");
const TicketsViewsController = require("../controllers/views/tickets.views.controller.js");




const { isLoggedIn,authorization } = require("../middlewares/auth.middleware.js");

const usersviewsController = new UsersViewsController();
const productsViewsController = new ProductsViewsController();
const cartsViewsController = new CartsViewsController();
const sessionsController = new SessionsController();
const ticketsViewsController = new TicketsViewsController();

const { Router } = require("express");
const router = Router();

router.get("/", authorization(["public"]), isLoggedIn, productsViewsController.renderHome);
router.get("/products", authorization(["user", "premium", "admin"]),isLoggedIn,productsViewsController.renderProducts);
router.get("/products/:pid", authorization(["public"]),isLoggedIn,productsViewsController.renderProduct);
router.get("/mockingproducts", authorization(["public"]), isLoggedIn, productsViewsController.mockingProducts);
router.get("/realtimeproducts", authorization(["premium", "admin"]), isLoggedIn,productsViewsController.realTimeProducts);

router.get("/carts",authorization(["user", "premium"]),isLoggedIn,cartsViewsController.renderCarts);
router.get("/carts/:cid",authorization(["user", "premium"]),isLoggedIn,cartsViewsController.renderCart);

router.get("/carts/:cid/purchase",authorization(["user", "premium"]),cartsViewsController.purchase);


router.get("/carts/:cid/tickets",authorization(["user", "premium"]),cartsViewsController.renderTickets);
router.get("/carts/:cid/tickets/:tid",authorization(["user", "premium"]),cartsViewsController.renderTickets);

router.get("/tickets",authorization(["user", "premium"]),ticketsViewsController.renderTickets);
router.get("/tickets/:tid",authorization(["user", "premium"]),ticketsViewsController.renderTicket);

router.get("/reset-password", authorization(["public"]), usersviewsController.resetPassword);
router.get("/chat", authorization(["user", "premium"]), isLoggedIn, usersviewsController.renderChat);
router.get('/profile/:uid', authorization(['user', 'premium', 'admin']), usersviewsController.userProfile);
router.get('/users', authorization(['admin']), usersviewsController.listUsers);

router.get("/current", authorization(["user", "admin"]), sessionsController.currentUser);

router.get("/login", authorization(["public"]), (req, res) => {res.render("login");});
router.get("/register", authorization(["public"]), (req, res) => {res.render("register");});

module.exports = {
  router,
};
