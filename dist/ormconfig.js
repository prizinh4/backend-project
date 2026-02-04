"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSourceOptions = void 0;
const user_entity_1 = require("./users/user.entity");
exports.dataSourceOptions = {
    type: 'postgres',
    replication: {
        master: {
            host: process.env.DB_HOST || 'localhost',
            port: 5432,
            username: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASS || 'postgres',
            database: process.env.DB_NAME || 'backend_project',
        },
        slaves: [
            {
                host: process.env.DB_REPLICA_HOST || process.env.DB_HOST || 'localhost',
                port: 5432,
                username: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASS || 'postgres',
                database: process.env.DB_NAME || 'backend_project',
            },
        ],
    },
    entities: [user_entity_1.User],
    synchronize: process.env.APP_INSTANCE === '1' || !process.env.APP_INSTANCE,
};
//# sourceMappingURL=ormconfig.js.map