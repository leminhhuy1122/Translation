class AppError extends Error {
    constructor(message, code = 'INTERNAL_ERROR', statusCode = 500) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}

export { AppError };
export default AppError;
