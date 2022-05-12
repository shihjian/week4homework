const appError = (httpStatus,errMessage,next)=>{
    const error = new Error(errMessage);
    error.statusCode = httpStatus;
    error.isOperational = true;

    //當接收到錯誤訊息直接跳到 aap.js 的Eexpress 捕捉錯誤位置
    next(error);
}

module.exports = appError;