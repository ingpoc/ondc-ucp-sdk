declare class ONDCError extends Error {
    code: string;
    details?: Record<string, unknown> | undefined;
    constructor(message: string, code: string, details?: Record<string, unknown> | undefined);
}
declare class SignatureError extends ONDCError {
    constructor(message: string, details?: Record<string, unknown>);
}
declare class ValidationError extends ONDCError {
    constructor(message: string, details?: Record<string, unknown>);
}

export { ONDCError, SignatureError, ValidationError };
