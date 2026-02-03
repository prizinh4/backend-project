"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const ormconfig_1 = require("./ormconfig");
async function bootstrap() {
    if (!ormconfig_1.AppDataSource.isInitialized) {
        await ormconfig_1.AppDataSource.initialize();
        console.log('Database initialized');
    }
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    await app.listen(3000, () => {
        console.log('Server running on http://localhost:3000');
    });
}
bootstrap().catch((err) => {
    console.error('Bootstrap error:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map