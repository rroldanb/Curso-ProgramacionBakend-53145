const ProductsManager = require("../dao/ProductsMongo.manager.js");
const { cartsModel } = require("./models/carts.model.js");

class CartsManager {

  constructor() {
    this.model = cartsModel
  }


  getCarts = async () => await this.model.find()

  async getCartById(cid) {
    const cart = await this.model.findById(cid).lean();
    if (!cart) {
      console.log("Error: No existe un carrito con id:", cid);
      return { error: `Carrito con ID ${cid} no encontrado`, status: 400 };
    }
    return cart;
  }

  async createCart() {
    const products = [];
    const result = await this.model.create({ products });
    const cartId = result._id.toString();

    console.log("Carrito creado con ID:", cartId);
    return cartId;
  }

  async addProductToCart(cid, pid) {
    const productsManager = new ProductsManager();

    const validPid = await productsManager.validaId(pid);
    if (!validPid) {
      console.log(`Producto con ID ${pid} no encontrado`);
      return `Producto con ID ${pid} no encontrado`;
    }

    const cart = await this.model.findById(cid);

    if (!cart) {
      console.log("Error: No existe un carrito con id:", cid);
      return { error: `Carrito con ID ${cid} no encontrado`, status: 400 };
    }

    const existingProductIndex = cart.products.findIndex(
      (cartProduct) => cartProduct.pid._id.toString() === pid
    );

    if (existingProductIndex !== -1) {
      const updateResult = await this.model.updateOne(
        { _id: cid, "products.pid": pid },
        { $inc: { "products.$.quantity": 1 } }
      );
      console.log(
        "Cantidad del producto actualizado en el carrito correctamente."
      );
      return updateResult;
    } else {
      const updateResult = await this.model.updateOne(
        { _id: cid },
        { $push: { products: { pid: pid, quantity: 1 } } }
      );
      console.log("Producto agregado al carrito correctamente.");
      return updateResult;
    }
  }

  async emptyCart(cid) {
    const cart = await this.model.findById(cid);
    if (!cart) {
      console.log("Error: No existe un carrito con id:", cid);
      return { error: `Carrito con ID ${cid} no encontrado`, status: 400 };
    }
    const updateResult = await this.model.updateOne(
      { _id: cid },
      { $set: { products: [] } }
    );
    console.log("Carrito vaciado correctamente.");
    return updateResult;
  }

  async deleteProductFromCart(cid, pid) {
    const cart = await this.model.findById(cid);

    if (!cart) {
      console.log("Error: No existe un carrito con id:", cid);
      return { error: `Carrito con ID ${cid} no encontrado`, status: 400 };
    }

    const existingProductIndex = cart.products.findIndex(
      (cartProduct) => cartProduct.pid._id.toString() === pid
    );

    if (existingProductIndex !== -1) {
      cart.products.splice(existingProductIndex, 1);

      const updateResult = await this.model.updateOne(
        { _id: cid },
        { $set: { products: cart.products } }
      );
      console.log("Producto elminado del carrito correctamente.");
      return updateResult;
    } else {
      console.log(`Producto con id ${pid} no encontrado en el carrito.`);
      return {
        error: `Producto con ID ${pid} no encontrado en el carrito`,
        status: 400,
      };
    }
  }

  async addProductsToCart(cid, newProducts) {
    const cart = await this.model.findById(cid);
    if (!cart) {
      console.log("Error: No existe un carrito con id:", cid);
      return { error: `Carrito con ID ${cid} no encontrado`, status: 400 };
    }
    const updateResult = await this.model.updateOne(
      { _id: cid },
      { $set: { products: newProducts } }
    );
    console.log("Productos agregados correctamente.");
    return updateResult;
  }

  async updateProductQuantity(cid, pid, newQuantity) {
    const cart = await this.model.findById(cid);

    if (!cart) {
      console.log("Error: No existe un carrito con id:", cid);
      return { error: `Carrito con ID ${cid} no encontrado`, status: 400 };
    }

    const existingProductIndex = cart.products.findIndex(
      (cartProduct) => cartProduct.pid._id.toString() === pid
    );

    if (existingProductIndex !== -1) {
      const updateResult = await this.model.updateOne(
        { _id: cid, "products.pid": pid },
        { $set: { "products.$.quantity": newQuantity } }
      );
      console.log("Cantidad del producto actualizada correctamente.");
      return updateResult;
    } else {
      console.log(`Producto con id ${pid} no encontrado en el carrito.`);
      return {
        error: `Producto con ID ${pid} no encontrado en el carrito`,
        status: 400,
      };
    }
  }
}

module.exports = CartsManager;