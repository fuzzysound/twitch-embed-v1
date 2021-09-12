class MissingParameterError extends Error {
  constructor(msg) {
    super(msg);
    this.name = "MissingParameterError";
  }
}

class MissingElementError extends Error {
  constructor(msg) {
    super("Could not find the provided element: " + msg);
    this.name = "MissingElementError";
  }
}

export { MissingParameterError, MissingElementError };
