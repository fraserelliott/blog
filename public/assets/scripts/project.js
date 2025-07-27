import { createPostElement } from "./utils/postUtils.js";

loadProject();

async function loadProject() {
    // Expect pathname /project/:id
    const idRaw = window.location.pathname.split("/").pop();
    const id = parseInt(idRaw);
    if (isNaN(id))
        redirect();

    try {
        const res = await fetch(`/api/posts/${id}`);
        if (!res.ok)
            redirect();

        const post = await res.json();
        const divEl = createPostElement(post, "panel");
        document.getElementById("div-project").appendChild(divEl);
    } catch (err) {
        redirect();
    }
}

function redirect() {
    window.location.replace("./index.html");
}