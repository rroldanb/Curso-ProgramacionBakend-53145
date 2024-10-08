const { Router } = require("express");
const { ProductsController } = require("../../controllers/products.controller");
const { authorization } = require('../../middlewares/auth.middleware')

const router = Router();

const {getProducts, getProduct, createProduct, updateProduct, deleteProduct} = new ProductsController()

router.get("/",     authorization(['public']),    getProducts)
router.get("/:pid", authorization(['public']),    getProduct)
router.post("/",    authorization(['premium', 'admin']),     createProduct)
router.put("/:pid", authorization(['premium','admin']),     updateProduct)
router.delete("/:pid", authorization(['premium','admin']),  deleteProduct)

module.exports = {
  router,
};
