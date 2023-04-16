const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const config = require("config");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const routes = require("./routes/index.routes");
const PORT = config.get("port") || 7070;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Nodejs, Expressjs, MongoDB, Mongoose, Swagger",
      version: "1.0.0",
      description: "API documentation for an ExpressJS application",
    },
    servers: [
      {
        url: "http://localhost:8080/api",
      },
    ],
  },
  apis: ["./routes/*.js", "./controllers/*.js"], // User folder yaratish bilan bog'liq
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use("/api", routes);

async function start() {
  try {
    await mongoose.connect(config.get("dbUri"));
    app.listen(PORT, () => {
      console.log(`\nServer has been started in ${PORT} port...`);
    });
  } catch (error) {
    logger.error(error.message);
  }
}

start();
