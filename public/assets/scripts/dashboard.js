import { createToast } from "./utils/toastUtils.js";
import { createPostElement, updatePostElement } from "./utils/postUtils.js";
import { postModalStates, PostModal } from "./utils/postModal.js";
import { TagDropdown } from "./utils/tagDropdown.js";
const { authToken, user } = loadSessionData();

// TODO: delete post button on modal

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
// Set up add tag button on the modal
const modalTagDropdown = new TagDropdown("modal-tag-filter", "btn-add-tag", modal.updateAvailableTag.bind(modal), modal.addNewTag.bind(modal));
document.getElementById("btn-add-tag").addEventListener("click", () => {
    modalTagDropdown.toggle();
});
// Set up listeners on the modal buttons
document.getElementById("btn-cancel-modal").addEventListener("click", () => {
    modal.hide();
    // TODO: reset modalTagDropdown data
});
document.getElementById("btn-submit-modal").addEventListener("click", async () => {
    switch (modal.state) {
        case postModalStates.ADDPOST:
            await handleCreatePost();
            break;
        case postModalStates.EDITPOST:
            await handleUpdatePost();
            break;
    }
    modal.hide();
    // TODO: reset modalTagDropdown data
});

// Set up tag filter button on the page
const tagFilter = new TagDropdown("tag-filter", "btn-filter", filterTags);
document.getElementById("btn-filter").addEventListener("click", () => {
    tagFilter.toggle();
});

await showPosts();

function filterTags() {
    const selectedTags = tagFilter.getSelectedTags();
    document.getElementById("main-projects").innerHTML = ""; // Clear all data
    const tagIds = selectedTags.map(tag => tag.id).join(",");

    fetch(`/api/posts?tags=${tagIds}`)
        .then(res => {
            if (!res.ok) {
                createToast("Server error", "error-toast", 1500);
                // Return a rejected promise to skip the next then
                return Promise.reject(new Error("Server error"));
            }
            return res.json();
        })
        .then(data => {
            data.forEach(post => {
                addPostPreviewToDOM(post);
            });
        })
        .catch(err => {
            createToast(err.message || "Server error", "error-toast", 1500);
        });
}

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
        const tags = await createTags(modal.getSelectedTags());
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

        addPostPreviewToDOM(post);
        createToast("Successfully created note", "success-toast", 1500);
    } catch (err) {
        createToast(err.message || "Server error", "error-toast", 1500);
    }
}

// Create any tags that have a missing ID and return an array of just the IDs to be used in creating or updating a post. Takes an array of tag elements that need to all have a name but can have IDs missing if they aren't yet in the DB.
async function createTags(tags) {
    try {
        for (const tag of tags) {
            if (!tag.id) {
                const res = await fetch("/api/tags", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${authToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ name: tag.name })
                });

                if (!res.ok) {
                    checkAuthFail(res);
                    createToast("Error creating note", "error-toast", 1500);
                    return [];
                }

                const data = await res.json();
                tag.id = data.id;
            }
        }

        return tags.map(tag => tag.id); // API only wants the IDs
    } catch (err) {
        createToast(err.message || "Server error", "error-toast", 1500);
        return [];
    }
}

async function handleUpdatePost() {
    try {
        const title = titleEl.value.trim();
        const featured = featuredEl.checked;
        const repoLink = repoEl.value.trim();
        const tags = await createTags(modal.getSelectedTags());
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
        const element = document.querySelector(`.project-preview[data-id="${updatedPost.id}"`);
        if (element)
            updatePostElement(element, updatedPost);
        else
            createToast("Error finding element to update", "error-toast", 1500);
    } catch (err) {
        console.error(err);
        createToast(err.message || "Server error", "error-toast", 1500);
    }
}

// Used by other functions when posts are retrieved from the API
function addPostPreviewToDOM(post) {
    const divEl = createPostElement(post, "project-preview");
    divEl.addEventListener("click", async () => {
        try {
            const res = await fetch(`/api/posts/${post.id}`);
            if (!res.ok) {
                createToast("Error finding post object to update", "error-toast", 1500);
                return;
            }
            const data = await res.json();
            if (!data) {
                createToast("Error finding post object to update", "error-toast", 1500);
                return;
            }
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