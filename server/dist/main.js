"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const expressAppBootstrap = require('./express-app');
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const httpAdapter = app.getHttpAdapter();
    const expressInstance = httpAdapter.getInstance();
    await expressAppBootstrap(expressInstance);
    await app.listen(80);
}
bootstrap();
//# sourceMappingURL=main.js.map