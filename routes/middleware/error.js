class HttpError extends Error {
  constructor(msg = 'Invalid Request', status = 400) {
    super(msg);
    this.status = status;
  }

  toJSON() {
    return {
      status: this.status,
      message: this.message
    };
  }
}

module.exports = HttpError;
