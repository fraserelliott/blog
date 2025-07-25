const User = require("./user.model");
const Post = require("./post.model");
const Tag = require("./tag.model");

// Using a junction table PostTags so tags can be retrieved. This junction table maps the post"s id to potentially multiple tag ids.
Post.belongsToMany(Tag, {
    through: "PostTags",
    as: "tags",
    foreignKey: "postId",
    onDelete: "CASCADE"
});

Tag.belongsToMany(Post, {
    through: "PostTags",
    as: "posts",
    foreignKey: "tagId",
    onDelete: "CASCADE"
});

module.exports = {
    User, Post, Tag
};