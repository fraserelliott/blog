if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const Sequelize = require("sequelize");

const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL)
    : new Sequelize(
        process.env.DB_DATABASE,
        process.env.DB_USERNAME,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            dialect: process.env.DB_DIALECT,
            port: process.env.DB_PORT,
            logging: process.env.NODE_ENV !== "production"
        }
    );

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connection has been established successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        process.exit(1);
    }
}

module.exports = { sequelize, testConnection };