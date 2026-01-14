// src/errors/index.ts
var ONDCError = class extends Error {
  constructor(message, code, details) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = "ONDCError";
  }
};
var SignatureError = class extends ONDCError {
  constructor(message, details) {
    super(message, "SIGNATURE_ERROR", details);
    this.name = "SignatureError";
  }
};
var ValidationError = class extends ONDCError {
  constructor(message, details) {
    super(message, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
};

export {
  ONDCError,
  SignatureError,
  ValidationError
};
//# sourceMappingURL=chunk-ENZDRWLG.js.map