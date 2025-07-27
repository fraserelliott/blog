export function createPostElement(post, className) {
    const postEl = document.createElement("div");
    postEl.className = className;
    postEl.innerHTML = `<div class="post-inner flex flex-column">${postInnerHTML(post)}</div>`;
    postEl.dataset.id = post.id;
    return postEl;
}

function postInnerHTML(post) {
    let tagsString = post.tags.map(tag => tag.name).join(", ");
    if (tagsString)
        tagsString = `<h3 class="bold italics text-align-center">${tagsString}</h3>`;

    let imageString = "";
    if (post.imageUrl)
        imageString = `<div class="text-align-center"><img src="${post.imageUrl}" height="150"></div>`

    return `
        <a href="${post.repoLink}" target="_blank"><h1>${post.title}</h1></a>
        ${tagsString}
        ${imageString}
        <p class="flex-grow-1 overflow-hidden">${post.content}</p>`;
}

export function updatePostElement(postEl, post) {
    const inner = postEl.querySelector(".post-inner");
    if (inner)
        inner.innerHTML = postInnerHTML(post);
}