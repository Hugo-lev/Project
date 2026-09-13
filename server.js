const http = require("http");

const mongodb = require("mongodb");

let db;
const connectionString = "mongodb+srv://savdospace99_db_user:s13vurcv1RJ15rTA@Reja.jhccpn0.mongodb.net/myDatabase";


mongodb.connect(
  connectionString,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err, client) => {
    if (err) console.log("Error on connection MongoDB");
    else {
      console.log("MongoDB connection succeed");

      module.exports = client;
      const app = require(`./app`);
      const server = http.createServer(app);
      let PORT = 3000;
      server.listen(PORT, function () {
        console.log(
          `The server is running successfully on port: ${PORT}, http://localhost:${PORT}`,
        );
      });
    }
  },
);
