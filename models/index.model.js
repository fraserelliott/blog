const User = require("./user.model");
const Post = require("./post.model");
const Tag = require("./tag.model");

// Using a junction table PostTags so tags can be retrieved. This junction table maps the post"s id to potentially multiple tag ids.
Post.belongsToMany(Tag, {
    through: "PostTags",
    as: "tags",
    foreignKey: "post_id",
    otherKey: "tag_id",
    onDelete: "CASCADE"
});

Tag.belongsToMany(Post, {
    through: "PostTags",
    as: "posts",
    foreignKey: "tag_id",
    otherKey: "post_id",
    onDelete: "CASCADE"
});

module.exports = {
    User, Post, Tag
};