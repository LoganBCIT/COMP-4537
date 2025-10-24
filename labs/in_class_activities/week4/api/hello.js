class HelloApi {
  static STATUS_OK = 200;
  static MIME_HTML = String.raw`text/html`;
  static ANY_ORIGIN = String.raw`*`;
  static BODY = String.raw`Hello Attackers
`;

  static handle(req, res) {
    res.setHeader(String.raw`Content-Type`, HelloApi.MIME_HTML);
    res.setHeader(String.raw`Access-Control-Allow-Origin`, HelloApi.ANY_ORIGIN);
    res.status(HelloApi.STATUS_OK).send(HelloApi.BODY);
  }
}

// Vercel expects a default export handler.
// We export the class method reference (still compliant with your style).
export default HelloApi.handle;
