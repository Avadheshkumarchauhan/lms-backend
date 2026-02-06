class ApiError extends Error{
    constructor(messege,statusCode){
        super(messege);
        this.statusCode = statusCode;
        this.success = false;
        Error.captureStackTrace(this,this.constructor)
    }
}

export default ApiError;