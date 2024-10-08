const { connect } = require("mongoose");
const { logger } = require("./logger.config");

exports.connectDB = () => {
  connect(process.env.MONGO_URL)
    .then(() => logger.info("Base de datos conectada"))
    .catch((err) =>
      logger.error(`Error conectando a la base de datos, ${err}`)
    );
};
