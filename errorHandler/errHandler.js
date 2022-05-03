//參考 bugbug777 做法

const errHandler = (res, statusNumber, errorNumber) => {
  let message = "";
  const errorMessageList = {
    400: {
      2001: "姓名與內容不得為空",
      2002: "ID異常，請重試",
      2003: "編輯失敗",
    },
  };

  if (statusNumber && errorNumber)
    message = errorMessageList[statusNumber][errorNumber];

  res.status(statusNumber).json({
    status: "false",
    message: message,
  });
};

module.exports = errHandler;