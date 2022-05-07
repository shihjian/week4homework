const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Node.js 直播班",
    description: "紀錄直播班所使用到的API",
  },
  host: "localhost:3000",
  schemes: ["http", "https"],
  // 代token方式
  securityDefinitions: {
    apiKeyAuth: {
        type:'apiKey',
        in:'headers',
        name:'authorization',
        description:'請加上APU TOKEN',
    }
  }
};

// 輸出位置
const outputFile = "./swagger-output.json";

//偵測進入點
const endpointFiles = ["./app.js"];

swaggerAutogen(outputFile,endpointFiles,doc);
