export function createPostPreviewElement(post) {
    let tagsString = post.tags.join(", ");
    if (tagsString)
        tagsString = `<strong>${tagsString}</strong><br>`;

    const divEl = document.createElement("div");
    divEl.className = "project-preview";
    divEl.innerHTML = `
        <a href='${post.repoLink}' target='_blank'><h1>${post.title}</h1></a>
        ${tagsString}
        <p>${post.content}</p>
    `;
    return divEl;
    //TODO: image via FTP upload with a uuid as the name
    //TODO: preview of project with link to full project page
}

export function createPostElement(post) {
    let tagsString = post.tags.join(", ");
    if (tagsString)
        tagsString = `<strong>${tagsString}</strong><br>`;

    const divEl = document.createElement("div");
    divEl.className = "panel";
    divEl.innerHTML = `
        <a href='${post.repoLink}' target='_blank'><h1>${post.title}</h1></a>
        ${tagsString}
        <p>${post.content}</p>
    `;
    return divEl;
    //TODO: image via FTP upload with a uuid as the name
}