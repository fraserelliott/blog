import { createToast } from "./utils/toastUtils.js";
import { createPostPreviewElement, updatePostElement } from "./utils/postUtils.js";
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
            handleUpdatePost();
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

        // Add new post to database via the API
        const res = await fetch("/api/posts", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title, content, repoLink, featured, tags })
        });

        if (!res.ok) {
            checkAuthFail(res);
            createToast("Error creating note", "error-toast", 1500);
            return;
        }

        const post = await res.json();

        addPostPreviewToDOM(data);
        createToast("Successfully created note", "success-toast", 1500);
    } catch (err) {
        createToast(err.message || "Server error", "error-toast", 1500);
    }
}

async function handleUpdatePost() {
    try {
        const title = titleEl.value.trim();
        const featured = featuredEl.checked;
        const repoLink = repoEl.value.trim();
        // TODO: handle tags from modal.tags. Will need to loop over to create tags where the ID is undefined, then map to a new array of just the IDs.
        const tags = [];
        const content = contentEl.value.trim();
        const id = modal.post.id;

        // Update post in database via the API
        const res = await fetch(`/api/posts/${id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title, content, repoLink, featured, tags })
        });

        if (!res.ok) {
            checkAuthFail(res);
            createToast("Error updating note", "error-toast", 1500);
            return;
        }

        const updatedPost = await res.json();

        // Find element in page and update it
        const element = document.getElementById(`div-preview-${updatedPost.id}`);
        if (element)
            updatePostElement(element, updatedPost);
        else
            createToast("Error finding element to update", "error-toast", 1500);
    } catch (err) {
        createToast(err.message || "Server error", "error-toast", 1500);
    }
}

// Used by other functions when posts are retrieved from the API
function addPostPreviewToDOM(post) {
    const divEl = createPostPreviewElement(post);
    divEl.addEventListener("click", async () => {
        try {
            const res = await fetch(`/api/posts/${post.id}`);
            if (!res.ok) {
                createToast("Error finding post object to update", "error-toast", 1500);
                return;
            }
            const data = await res.json();
            if (!data)
                createToast("Error finding post object to update", "error-toast", 1500);
            else
                modal.show(postModalStates.EDITPOST, data);
        } catch (err) {
            createToast("Error finding post object to update", "error-toast", 1500);
        }
    });
    document.getElementById("main-projects").appendChild(divEl);
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