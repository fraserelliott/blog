export function createPostPreviewElement(post) {
    const postEl = document.createElement("div");
    postEl.className = "project-preview";
    postEl.id = `div-preview-${post.id}`;
    postEl.innerHTML = `<div class='post-inner'>${postInnerHTML(post)}</div>`;
    return postEl;
    //TODO: image via FTP upload with a uuid as the name
    //TODO: preview of project with link to full project page
}

export function updatePostElement(postEl, post) {
    const inner = postEl.querySelector(".post-inner");
    if (inner)
        inner.innerHTML = postInnerHTML(post);
}

function postInnerHTML(post) {
    let tagsString = post.tags.map(tag => tag.name).join(", ");
    if (tagsString)
        tagsString = `<strong>${tagsString}</strong><br>`;
    
    return `
        <a href='${post.repoLink}' target='_blank'><h1>${post.title}</h1></a>
        ${tagsString}
        <p>${post.content}</p>
    `;
}

export function createPostElement(post) {
    let tagsString = post.tags.join(", ");
    if (tagsString)
        tagsString = `<strong>${tagsString}</strong><br>`;

    const divEl = document.createElement("div");
    divEl.className = "panel";
    divEl.innerHTML = postInnerHTML(post);
    return divEl;
    //TODO: image via FTP upload with a uuid as the name
    //TODO: reuse code among the 2 functions but just change className between them
}