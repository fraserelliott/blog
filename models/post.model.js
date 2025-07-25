const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/connection");

class Post extends Model {}

Post.init(
    {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        featured: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        repoLink: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        sequelize,
        freezeTableName: true,
        underscored: true,
        modelName: "posts"
    }
);

module.exports = Post;