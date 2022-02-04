const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Postock's Node Express API with Swagger",
        version: "0.1.0",
        description:
          "This is a simple CRUD API application made with Express and documented with Swagger",
        license: {
          name: "MIT",
          url: "https://spdx.org/licenses/MIT.html",
        },
        contact: {
          name: "poapper",
          url: "https://club.poapper.com/",
          email: "poapper@gmail.com",
        },
      },
      host: 'localhost:8080',
      basePath: '/',
    },
    apis: ["./routes/*.js", "./swagger/*"],
  };
  
  const specs = swaggerJsdoc(options);

  module.exports = {
      swaggerUi,
      specs
  };