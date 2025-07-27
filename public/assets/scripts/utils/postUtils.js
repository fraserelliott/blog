export function createPostElement(post, className) {
    const postEl = document.createElement("div");
    postEl.className = className;
    postEl.innerHTML = `<div class='post-inner'>${postInnerHTML(post)}</div>`;
    postEl.dataset.id = post.id;
    return postEl;
}

function postInnerHTML(post) {
    let tagsString = post.tags.map(tag => tag.name).join(", ");
    if (tagsString)
        tagsString = `<strong>${tagsString}</strong><br>`;

    return `
        <a href='${post.repoLink}' target='_blank'><h1>${post.title}</h1></a>
        <p>${post.content}</p>
        ${tagsString}`;
}

export function updatePostElement(postEl, post) {
    const inner = postEl.querySelector(".post-inner");
    if (inner)
        inner.innerHTML = postInnerHTML(post);
}