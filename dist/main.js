"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
require("./metrics/prometheus");
const app_module_1 = require("./app.module");
const prometheus_1 = require("./metrics/prometheus");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    app.use((req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
            var _a;
            const duration = (Date.now() - start) / 1000;
            const route = ((_a = req.route) === null || _a === void 0 ? void 0 : _a.path) || req.path;
            prometheus_1.httpRequestDuration.labels(req.method, route, res.statusCode).observe(duration);
            prometheus_1.httpRequestTotal.labels(req.method, route, res.statusCode).inc();
        });
        next();
    });
    app.use((req, _res, next) => {
        const instance = process.env.HOSTNAME || 'unknown-instance';
        console.log(`[${instance}] ${req.method} ${req.url}`);
        next();
    });
    await app.listen(3000, () => {
        console.log('Server running on http://localhost:3000');
    });
}
bootstrap().catch((err) => {
    console.error('Bootstrap error:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map