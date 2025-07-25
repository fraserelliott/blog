import { createToast } from "./utils/toastUtils.js";
import { createPostPreviewElement } from "./utils/postUtils.js";

await showPosts();

async function showPosts() {
    try {
        const res = await fetch("/api/posts");
        if (!res.ok)
            createToast("Server error", "error-toast", 1500);

        const data = await res.json();
        data.forEach(post => {
            const divEl = createPostPreviewElement(post);
            document.getElementById("div-projects").appendChild(divEl);            
        })
    } catch (err) {
        createToast(err.message || "Server error", "error-toast", 1500);
    }
}