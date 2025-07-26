import { createToast } from "./utils/toastUtils.js";
import { createPostPreviewElement } from "./utils/postUtils.js";
import { postModalStates, PostModal } from "./utils/postModal.js";
const { authToken, user } = loadSessionData();
await showPosts();

// Set up the modal used for adding and editing posts
const container = document.getElementById("post-modal");
const titleEl = document.getElementById("input-post-title");
const featuredEl = document.getElementById("input-post-featured");
const repoEl = document.getElementById("input-post-repo");
const tagsEl = document.getElementById("div-tags");
const contentEl = document.getElementById("textarea-post-content");
const modal = new PostModal(container, titleEl, featuredEl, repoEl, tagsEl, contentEl);

document.getElementById("btn-create").addEventListener("click", () => {
    modal.show(postModalStates.ADDPOST);
});

document.getElementById("btn-cancel-modal").addEventListener("click", () => {
    modal.hide();
});

document.getElementById("btn-submit-modal").addEventListener("click", () => {
    switch (modal.state) {
        case postModalStates.ADDPOST:
            handleCreatePost();
            break;
        case postModalStates.EDITPOST:
            //TODO: handleUpdatePost();    
            break;
    }
    modal.hide();
});

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
            addPostPreviewToDOM(post);        
        })
    } catch (err) {
        createToast(err.message || "Server error", "error-toast", 1500);
    }
}

async function handleCreatePost() {
    try {
        const title = titleEl.value.trim();
        const featured = featuredEl.checked;
        const repoLink = repoEl.value.trim();
        // TODO: handle tags from modal.tags. Will need to loop over to create tags where the ID is undefined, then map to a new array of just the IDs.
        const tags = [];
        const content = contentEl.value.trim();
        console.log("Attempting POST to /api/posts: ", { title, content, repoLink, featured, tags });
        const res = await fetch("/api/posts", {
            method: "POST",
            headers: { "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json" },
            body: JSON.stringify({ title, content, repoLink, featured, tags })
        });

        const data = await res.json();

        if (!res.ok) {
            checkAuthFail(res);
            createToast(data.error || "Error creating note", "error-toast", 1500);
            console.error("Error creating note: ", data.error);
        }

        addPostPreviewToDOM(data);
        createToast("Successfully created note", "success-toast", 1500);
    } catch (err) {
        createToast(err.message || "Server error", "error-toast", 1500);
    }
}

// Used by other functions when posts are retrieved from the API
function addPostPreviewToDOM(post) {
    const divEl = createPostPreviewElement(post);
    document.getElementById("main-projects").appendChild(divEl);
    // TODO: click listener
}

// Force logout on API authorisation error
function checkAuthFail(res) {
    if (res.status == 401)
        logout();
}

// Used by other methods whenever unauthorised actions are attempted
function logout() {
    sessionStorage.clear();
    window.location.replace("./index.html");
}