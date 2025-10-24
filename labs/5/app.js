// ChatGPT used for project structure and help with database set up with MariaDB

require('dotenv').config();
const http = require('http');
const mariadb = require('mariadb');
const EnText = require('./lang/en/en.js');

class App {
  // define our constants for DB, HTTP, table, regex, and port
  static get CONST() {
    return {
      db: {
        defaultHost: 'localhost',
        defaultUser: 'root',
        defaultPassword: '',
        defaultName: 'clinic',
        poolLimit: 5
      },
      http: {
        headerContentType: 'Content-Type',
        contentTypeJson: 'application/json',
        statusOK: 200,
        statusBadRequest: 400,
        statusNotFound: 404,
        statusServerError: 500,
        maxBodyBytes: 1_000_000,
        pathApiSqlBase: '/api/v1/sql/',
        corsOrigin: '*',
        allowMethods: 'GET, POST, OPTIONS',
        allowHeaders: 'Content-Type',
        statusNoContent: 204
      },
      table: {
        name: 'patient'
      },
      regex: {
        insert: /^\s*INSERT\s+INTO\s+`?patient`?/i,
        select: /^\s*SELECT\b/i,
        fromPatient: /FROM\s+`?patient`?/i
      },
      port: parseInt(process.env.PORT || '3000', 10)
    };
  }

  // gather environment variables or use defaults
  static get ENV() {
    return {
      host: process.env.DB_HOST || App.CONST.db.defaultHost,
      user: process.env.DB_USER || App.CONST.db.defaultUser,
      password: process.env.DB_PASSWORD || App.CONST.db.defaultPassword,
      name: process.env.DB_NAME || App.CONST.db.defaultName
    };
  }

  // start the application
  static async start() {
    let pool = null;
    try {
      // ensure database and table exist
      pool = await Database.ensureDatabaseAndTable(
        App.ENV.host,
        App.ENV.user,
        App.ENV.password,
        App.ENV.name,
        App.CONST.db.poolLimit,
        App.tableDDL()
      );
      console.log(`${EnText.keys.init.listening} http://localhost:${App.CONST.port}`);
    } catch (err) {
      // handle initialization errors
      console.error(`${EnText.keys.init.initFailed}:`, err);
      process.exit(1);
      return;
    }

    // create HTTP server using a promise to handle requests
    const server = http.createServer(async (req, res) => {
      const parsedUrl = new URL(req.url, 'http://localhost');
      const path = parsedUrl.pathname;
      const apiSqlRoot = App.CONST.http.pathApiSqlBase.endsWith('/')
        ? App.CONST.http.pathApiSqlBase.slice(0, -1)
        : App.CONST.http.pathApiSqlBase;

      let responded = false;
      const match = req.url.match(/\/api\/v1\/sql\/?(.*)$/);
      const hasApi = !!match;
      const tail = hasApi ? match[1] : '';
      const respond = (status, payload) => {
        if (responded) {
          console.warn('Duplicate response suppressed', { method: req.method, url: req.url, status });
          return;
        }
        responded = true;
        console.log('Responding', { method: req.method, url: req.url, status });
        App.respondJson(res, status, payload);
      };

      if (req.method === 'OPTIONS') {
        respond(App.CONST.http.statusNoContent, {});
        return;
      }

      if (req.method === 'GET' && hasApi && tail.length > 0) {
        const decoded = decodeURIComponent(tail).replace(/^"|"$/g, '');
        const type = SqlValidator.typeFor(decoded);
        if (type !== 'SELECT') {
          respond(App.CONST.http.statusBadRequest, { error: EnText.keys.sql.onlyPatientAllowed });
          return;
        }
        let conn = null;
        try {
          conn = await pool.getConnection();
          const rows = await conn.query(decoded);
          respond(App.CONST.http.statusOK, { success: true, rows, message: EnText.keys.result.ok });
        } catch (e) {
          respond(App.CONST.http.statusServerError, { error: String(e) });
        } finally {
          if (conn) {
            conn.release();
          }
        }
        return;
      }

      if (req.method === 'POST' && hasApi && tail.length === 0) {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString('utf8');
          if (body.length > App.CONST.http.maxBodyBytes) {
            req.connection.destroy();
          }
        });

        req.on('end', async () => {
          const contentType = ((req.headers[App.CONST.http.headerContentType] || '').split(';')[0]).trim();
          let sql = '';
          try {
            if (contentType === App.CONST.http.contentTypeJson) {
              const parsed = JSON.parse(body || '{}');
              sql = parsed.sql || parsed.query || '';
            } else {
              sql = body;
            }
          } catch (_e) {
            respond(App.CONST.http.statusBadRequest, { error: EnText.keys.http.invalidJson });
            return;
          }

          if (typeof sql === 'string' && sql.trim().startsWith('{')) {
            try {
              const parsed = JSON.parse(sql);
              sql = parsed.sql || parsed.query || '';
            } catch (_ignored) {
              // leave sql as-is; validator will reject malformed payloads
            }
          }

          const type = SqlValidator.typeFor(sql);
          console.log({ sql, type });
          if (type === null) {
            respond(App.CONST.http.statusBadRequest, { error: EnText.keys.sql.onlyPatientAllowed });
            return;
          }

          let conn = null;
          let result;
          try {
            conn = await pool.getConnection();
            result = await conn.query(sql);
          } catch (e) {
            console.error('SQL handler error:', e);
            respond(App.CONST.http.statusServerError, { error: String(e) });
            return;
          } finally {
            if (conn) {
              conn.release();
            }
          }

          if (type === 'SELECT') {
            respond(App.CONST.http.statusOK, { success: true, rows: result, message: EnText.keys.result.ok });
          } else {
            respond(App.CONST.http.statusOK, {
              success: true,
              result: {
                affectedRows: result.affectedRows ?? null,
                insertId: result.insertId ?? null,
                info: result.info ?? null
              },
              message: EnText.keys.result.ok
            });
          }
        });
        return;
      }

      respond(App.CONST.http.statusNotFound, { error: EnText.keys.http.notFound });
    });

    server.listen(App.CONST.port);
  }
  // utility method to respond with body in JSON format
  static respondJson(res, statusCode, payload) {
    const headers = {
      [App.CONST.http.headerContentType]: App.CONST.http.contentTypeJson,
      'Access-Control-Allow-Origin': App.CONST.http.corsOrigin,
      'Access-Control-Allow-Methods': App.CONST.http.allowMethods,
      'Access-Control-Allow-Headers': App.CONST.http.allowHeaders
    };

    if (statusCode === App.CONST.http.statusNoContent) {
      res.writeHead(statusCode, headers);
      res.end();
      return;
    }

    res.writeHead(statusCode, headers);
    res.end(JSON.stringify(payload, App.replaceBigInt));
  }

  static replaceBigInt(_key, val) {
    if (typeof val === 'bigint') {
      return val.toString();
    }
    return val;
  }

  // define the table DDL for patient table
  static tableDDL() {
    const tn = App.CONST.table.name;
    return `
      CREATE TABLE IF NOT EXISTS \`${tn}\` (
        patientid INT(11) NOT NULL PRIMARY KEY,
        name VARCHAR(100),
        dateOfBirth DATETIME
      ) ENGINE=InnoDB;
    `;
  }
}

// validate SQL queries
class SqlValidator {
  static typeFor(sql) {
    if (typeof sql !== 'string' || sql.trim().length === 0) {
      return null;
    }
    const trimmed = sql.trim();
    if (App.CONST.regex.insert.test(trimmed)) {
      return 'INSERT';
    }
    if (App.CONST.regex.select.test(trimmed) && App.CONST.regex.fromPatient.test(trimmed)) {
      return 'SELECT';
    }
    return null;
  }
}

// database operations
class Database {
  static async ensureDatabaseAndTable(host, user, password, dbName, poolLimit, createTableSql) {
    const adminConn = await mariadb.createConnection({ host, user, password });
    try {
      await adminConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    } finally {
      await adminConn.end();
    }

    const pool = mariadb.createPool({
      host,
      user,
      password,
      database: dbName,
      connectionLimit: poolLimit
    });

    const conn = await pool.getConnection();
    try {
      await conn.query(createTableSql);
    } finally {
      conn.release();
    }

    return pool;
  }
}

App.start();