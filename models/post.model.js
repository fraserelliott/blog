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
        postedBy: {
            type: DataTypes.UUID,
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