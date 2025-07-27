export function createPostElement(post, className) {
    let tagsString = post.tags.map(tag => tag.name).join(", ");
    if (tagsString)
        tagsString = `<strong>${tagsString}</strong><br>`;

    const postEl = document.createElement("div");
    postEl.className = className;
    postEl.innerHTML = `
        <div class='post-inner'>
        <a href='${post.repoLink}' target='_blank'><h1>${post.title}</h1></a>
        <p>${post.content}</p>
        ${tagsString}
        </div>`;
    postEl.dataset.id = post.id;
    return postEl;
}

export function updatePostElement(postEl, post) {
    console.log("Updating post element:",  postEl);
    console.log("Post:",  post);
    const inner = postEl.querySelector(".post-inner");
    if (inner)
        inner.innerHTML = postInnerHTML(post);
}