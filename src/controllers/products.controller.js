const { ProductsService } = require("../services/index");

function generatePaginationLinks(pagLinksParams) {
  let { urlParam, totalPages, nextPage, prevPage, hasNextPage, hasPrevPage } =
    pagLinksParams;
  let currentUrl = urlParam;
  let prevLink, nextLink, firstLink, lastLink;
  let urlBase = currentUrl;

  if (currentUrl.includes("?")) {
    const partesUrl = currentUrl.split("?");
    urlBase = partesUrl[0];
    const parametros = partesUrl[1];
    const paresParametros = parametros.split("&");

    if (nextPage !== null) {
      const nuevosParametros = paresParametros.map((par) => {
        const [clave, valor] = par.split("=");
        if (clave === "numPage") {
          return `${clave}=${nextPage}`;
        }
        return par;
      });
      nextLink = urlBase + "?" + nuevosParametros.join("&");
    } else {
      nextLink = null;
    }

    if (prevPage !== null) {
      const nuevosParametros = paresParametros.map((par) => {
        const [clave, valor] = par.split("=");
        if (clave === "numPage") {
          return `${clave}=${prevPage}`;
        }
        return par;
      });
      prevLink = urlBase + "?" + nuevosParametros.join("&");
    } else {
      prevLink = null;
    }

    const primerosParametros = paresParametros.filter(
      (par) => !par.startsWith("numPage=")
    );
    firstLink = urlBase + "?numPage=1&" + primerosParametros.join("&");

    const ultimosParametros = paresParametros.filter(
      (par) => !par.startsWith("numPage=")
    );
    lastLink =
      urlBase + "?numPage=" + totalPages + "&" + ultimosParametros.join("&");
  }

  if (
    nextLink === undefined ||
    prevLink === undefined ||
    firstLink === undefined ||
    lastLink === undefined
  ) {
    nextLink = hasNextPage ? urlBase + "?numPage=" + nextPage : null;
    prevLink = hasPrevPage ? urlBase + "?numPage=" + prevPage : null;
    firstLink = urlBase + "?numPage=1";
    lastLink = urlBase + "?numPage=" + totalPages;
    // urlBase=urlBase
  }

  return { nextLink, prevLink, firstLink, lastLink, urlBase };
}

class ProductsController {
  constructor() {
    this.productsService = new ProductsService();
  }

  getProducts = async (req, res) => {
    let {
      numPage = 1,
      limit = 10,
      category = null,
      availableOnly = null,
      orderByPrice = null,
      urlParam = "/",
    } = req;

    availableOnly = availableOnly ? availableOnly === "true" : null;
    numPage = parseInt(numPage);
    limit = parseInt(limit);
    let orderBy = null;
    if (orderByPrice === "asc") {
      orderBy = 1;
    } else if (orderByPrice === "desc") {
      orderBy = -1;
    }

    const filter = {};
    if (category) filter.category = category;
    if (typeof availableOnly === "boolean") filter.status = availableOnly;

    const options = {
      limit,
      page: numPage,
      lean: true,
      sort: orderBy ? { price: orderBy } : {},
    };

    try {
      const result = await this.productsService.getProducts(filter, options);
      // const urlParam = req.originalUrl;

      const pagLinksParams = {
        urlParam,
        totalPages: result.totalPages,
        nextPage: result.nextPage,
        prevPage: result.prevPage,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      };
      const { nextLink, prevLink } = generatePaginationLinks(pagLinksParams);

      res.send({
        status: "success",
        payload: result.docs,
        totalPages: result.totalPages,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        nextLink,
        prevLink,
        totalDocs: result.totalDocs,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Error al obtener los productos" });
    }
  };

  getProduct = async (req, res) => {
    const { pid } = req.params;
    try {
      const producto = await this.productsService.getProductById(pid);
      if (producto) {
        res.json(producto);
      } else {
        res.status(404).json({ error: `Producto con ID ${pid} no encontrado` });
      }
    } catch (error) {
      console.log(error);
      res
        .status(400)
        .json({ error: "Error al obtener el producto, pid no válido" });
    }
  };

  createProduct = async (req, res) => {
    try {
      const nuevoProducto = req.body;
      const camposObligatorios = [
        "title",
        "description",
        "code",
        "price",
        "stock",
        "category",
      ];
      for (const campo of camposObligatorios) {
        if (!nuevoProducto[campo]) {
          return res
            .status(400)
            .json({ error: `El campo '${campo}' es obligatorio` });
        }
      }

      if (isNaN(nuevoProducto.price)) {
        return res
          .status(400)
          .json({ error: `El campo price debe ser numérico` });
      }

      if (isNaN(nuevoProducto.stock)) {
        return res
          .status(400)
          .json({ error: `El campo stock debe ser numérico` });
      }

      if (await this.productsService.validaCode(nuevoProducto.code)) {
        return res
          .status(400)
          .json({
            error: `El código del producto ${nuevoProducto.code} ya existe`,
          });
      }

      if (!nuevoProducto.thumbnails) {
        nuevoProducto.thumbnails = [];
      } else if (typeof nuevoProducto.thumbnails === "string") {
        nuevoProducto.thumbnails = [nuevoProducto.thumbnails];
      } else if (!Array.isArray(nuevoProducto.thumbnails)) {
        return res
          .status(400)
          .json({
            error:
              "El campo 'thumbnails' debe ser un string o un array de strings",
          });
      } else {
        const invalidThumbnails = nuevoProducto.thumbnails.filter(
          (thumbnail) => typeof thumbnail !== "string"
        );
        if (invalidThumbnails.length > 0) {
          return res
            .status(400)
            .json({
              error:
                "Algunos elementos de 'thumbnails' no son cadenas de texto válidas.",
            });
        }
      }

      if (typeof nuevoProducto.status !== "boolean") {
        nuevoProducto.status = true;
      }

      const result = await this.productsService.addProduct(nuevoProducto);
      const stringLastID = result._id.toString();

      req.io.emit("Server:addProduct", { ...nuevoProducto, _id: stringLastID });

      res.status(201).json({ mensaje: "Producto agregado correctamente" });
    } catch (error) {
      console.error("Error al agregar el producto:", error);
      res
        .status(400)
        .json({ error: "Error al agregar el producto", mensaje: error.errmsg });
    }
  };

  updateProduct = async (req, res) => {
    const { pid } = req.params;
    const updatedFields = req.body;

    try {
      const updateable = await this.productsService.validaId(pid);
      if (!updateable) {
        return res
          .status(400)
          .json({ error: `No existe un producto con id: ${pid}` });
      }

      if (updatedFields.code) {
        const existeCode = await this.productsService.validaCode(
          updatedFields.code
        );
        if (existeCode) {
          delete updatedFields.code;
        }
      }

      if (updatedFields.thumbnails) {
        if (typeof updatedFields.thumbnails === "string") {
          updatedFields.thumbnails = [updatedFields.thumbnails];
        } else if (!Array.isArray(updatedFields.thumbnails)) {
          delete updatedFields.thumbnails;
        } else {
          const invalidThumbnails = updatedFields.thumbnails.filter(
            (thumbnail) => typeof thumbnail !== "string"
          );
          if (invalidThumbnails.length > 0) {
            delete updatedFields.thumbnails;
          }
        }
      }

      if (typeof updatedFields.status !== "boolean") {
        updatedFields.status = true;
      }

      if (updatedFields.price && isNaN(updatedFields.price)) {
        delete updatedFields.price;
      }

      if (updatedFields.stock && isNaN(updatedFields.stock)) {
        delete updatedFields.stock;
      }

      const product = await this.productsService.getProductById(pid);
      const docKeys = Object.keys(product._doc);
      const validFields = {};
      for (const key in updatedFields) {
        if (docKeys.includes(key)) {
          validFields[key] = updatedFields[key];
        }
      }

      await this.productsService.updateProduct(pid, validFields);
      const updatedProduct = await this.productsService.getProductById(pid);
      req.io.emit("Server:productUpdate", updatedProduct);

      res
        .status(200)
        .json({ mensaje: `Producto con ID ${pid} actualizado correctamente` });
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      res.status(500).json({ error: "Error al actualizar el producto" });
    }
  };

  deleteProduct = async (req, res) => {
    const { pid } = req.params;

    try {
      const existeId = await this.productsService.validaId(pid);
      if (!existeId) {
        return res
          .status(400)
          .json({ error: `No existe un producto con id: ${pid}` });
      }

      await this.productsService.deleteProduct(pid);
      const products = await this.productsService.getProducts(
        {},
        { lean: true }
      );

      req.io.emit("Server:loadProducts", products);
      res
        .status(200)
        .json({ mensaje: `Producto con ID ${pid} eliminado correctamente` });
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      res.status(500).json({ error: "Error al eliminar el producto" });
    }
  };
}

module.exports = { ProductsController };
