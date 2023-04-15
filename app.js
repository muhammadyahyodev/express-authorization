const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const config = require("config");
const mongoose = require("mongoose");
const routes = require("./routes/index.routes");
const PORT = config.get("port") || 7070;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use(routes);

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
