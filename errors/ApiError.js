class ApiError extends Error {
  constructor(status, message) {
    super();
    this.status = status;
    this.message = message;
  }
  static badRequest(res, errorMessage) {
    console.log(errorMessage.message);
    return res.status(400).send({
      friendlyMsg: errorMessage.friendlyMsg,
    });
  }
  static unauthorized(res, errorMessage) {
    console.log(errorMessage.message);
    return res.status(401).send({
      friendlyMsg: errorMessage.friendlyMsg,
    });
  }
  static forbidden(res, errorMessage) {
    console.log(errorMessage.message);
    return res.status(403).send({
      friendlyMsg: errorMessage.friendlyMsg,
    });
  }
  static notFound(res, errorMessage) {
    console.log(errorMessage.message);
    return res.status(404).send({
      friendlyMsg: errorMessage.friendlyMsg,
    });
  }
  static internal(res, errorMessage) {
    console.log(errorMessage.message);
    return res.status(500).send({
      friendlyMsg: errorMessage.friendlyMsg,
    });
  }
}

module.exports = ApiError;
