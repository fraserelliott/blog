import { createToast } from "./utils/toastUtils.js";
import { createPostPreviewElement } from "./utils/postUtils.js";

const { authToken, user } = loadSessionData();
await showPosts();

function loadSessionData() {
    try {
        let authToken = sessionStorage.getItem("auth-token");
        let user = JSON.parse(sessionStorage.getItem("user"));

        if (!authToken || !user || !user.id)
            logout();

        return { authToken, user };
    } catch (e) {
        logout();
    }
}

async function showPosts() {
    try {
        const res = await fetch("/api/posts");
        if (!res.ok)
            createToast("Server error", "error-toast", 1500);

        const data = await res.json();
        data.forEach(post => {
            const divEl = createPostPreviewElement(post);
            document.getElementById("main-projects").appendChild(divEl);            
        })
    } catch (err) {
        createToast(err.message || "Server error", "error-toast", 1500);
    }
}

function logout() {
    sessionStorage.clear();
    window.location.replace("./index.html");
}