const { getDate } = require("./modules/utils");
const { MESSAGE, FILE_DNE, INTERNAL_ERROR } = require("./lang/en/en");
const fs = require("fs");
const http = require("http");

// route related constants
const DATE_ROUTE = "getDate";
const WRITE_FILE_ROUTE = "writeFile";
const READ_FILE_ROUTE = "readFile";
const NAME_PARAM = "?name";
const TEXT_PARAM = "?text";
const ROUTE_SIZE = 3;
const PORT = 8080;
const FILE_NAME = "file.txt";
const CT_HTML = "text/html";
const CT_TEXT = "text/plain";
const ENC_UTF8 = "utf8";

class Server {
  static instance = null;

  constructor() {
    if (Server.instance !== null) {
      return Server.instance;
    }
    this.initRoute();
    Server.instance = this;
  }

  // setup the server routes and initialize handlers
  initRoute() {
    http
      .createServer((req, res) => {
        // get request url split by '/'
        const fullPath = req.url.split("/");

        if (fullPath.length !== ROUTE_SIZE) {
          return;
        }

        const route = fullPath[1];

        if (route === DATE_ROUTE) {
          Server.handleGetDate(fullPath, res);
        } else if (route === WRITE_FILE_ROUTE) {
          Server.handleWriteFile(fullPath, res);
        } else if (route === READ_FILE_ROUTE) {
          Server.handleReadFile(fullPath, res);
        } else {
          return;
        }
      })
      .listen(PORT, () => {
        console.log("🚀 Server is running at http://127.0.0.1:" + PORT);
      });
  }

  static handleGetDate(fullPath, res) {
    const queryParam = fullPath[ROUTE_SIZE - 1].split("=");

    if (queryParam.length !== 2 || queryParam[0] !== NAME_PARAM) {
      return;
    }

    const date = getDate();
    const name = queryParam[1];
    const msg = MESSAGE.replace("%1", name).replace("%2", date);

    res.writeHead(200, { "Content-Type": CT_HTML });
    res.end('<p style="color:blue;">' + msg + "</p>");
  }

  static handleWriteFile(fullPath, res) {
    const queryParam = fullPath[ROUTE_SIZE - 1].split("=");

    if (queryParam.length !== 2 || queryParam[0] !== TEXT_PARAM) {
      return;
    }

    const text = queryParam[1];

    fs.appendFile(FILE_NAME, text + "\n", (err) => {
      if (err) {
        res.writeHead(500, { "Content-Type": CT_TEXT });
        res.end(INTERNAL_ERROR);
        return;
      }
      res.writeHead(204);
      res.end();
    });
  }

  static handleReadFile(fullPath, res) {
    const fileName = fullPath[ROUTE_SIZE - 1];
    if (fileName === "") {
      return;
    }

    fs.readFile(fileName, ENC_UTF8, (err, data) => {
      if (err) {
        const msg = FILE_DNE.replace("%1", fileName);
        res.writeHead(404, { "Content-Type": CT_TEXT });
        res.end(msg);
        return;
      }
      res.writeHead(200, { "Content-Type": CT_TEXT });
      res.end(data);
    });
  }
}

const server = new Server();
