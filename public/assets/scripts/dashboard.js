import { createToast } from "./utils/toastUtils.js";
import { createPostElement, updatePostElement } from "./utils/postUtils.js";
import { postModalStates, PostModal } from "./utils/postModal.js";
import { TagDropdown } from "./utils/tagDropdown.js";
const { authToken, user } = loadSessionData();

// ===== Modal Setup =====
// Set up the modal used for adding and editing posts
const container = document.getElementById("post-modal");
const titleEl = document.getElementById("input-post-title");
const featuredEl = document.getElementById("input-post-featured");
const repoEl = document.getElementById("input-post-repo");
const imageurlEl = document.getElementById("input-image-url");
const tagsEl = document.getElementById("div-tags");
const contentEl = document.getElementById("textarea-post-content");
const modal = new PostModal(container, titleEl, featuredEl, repoEl, imageurlEl, tagsEl, contentEl);
document.getElementById("btn-create").addEventListener("click", () => {
    modal.show(postModalStates.ADDPOST);
});
// Set up add tag button on the modal
const modalTagDropdown = new TagDropdown("modal-tag-filter", "btn-add-tag", modal.updateAvailableTag.bind(modal), modal.addNewTag.bind(modal));
document.getElementById("btn-add-tag").addEventListener("click", () => {
    modalTagDropdown.toggle();
});

// Set up delete button on the modal which uses a flag to check for confirmation to help prevent accidental deletion
let awaitingDeleteConfirmation = false;
const deletePostBtn = document.getElementById("btn-delete-modal");
deletePostBtn.addEventListener("click", handleDeleteClick);
// Set up listeners on the modal buttons
document.getElementById("btn-cancel-modal").addEventListener("click", () => {
    modal.hide();
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
});

// Set up image upload on the modal
const form = document.getElementById("uploadForm");
form.addEventListener("submit", async (e) => {
    try {
        e.preventDefault();
        const formData = new FormData(form);

        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        });

        if (!res.ok) {
            createToast(`${res.status}: Error uploading image`, "error-toast", 1500);
            return;
        }

        const data = await res.json();
        imageurlEl.value = data.url;
    } catch (err) {
        createToast(err.message || "Server error", "error-toast", 1500);
    }
});

// ===== Tag filter Setup =====
// Set up tag filter button on the page
const tagFilter = new TagDropdown("tag-filter", "btn-filter", filterTags);
document.getElementById("btn-filter").addEventListener("click", () => {
    tagFilter.toggle();
});

// Show posts on opening the page
await showPosts();

// Callback function for when a checkbox is checked in the tag filters. Uses the API to retrieve a fresh set of data for the tags selected.
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

// Looks at session data and forces logout on missing data. Used on page load.
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

// Uses the API to retrieve all posts and pass to a rendering function. Used on page load.
async function showPosts() {
    try {
        const res = await fetch("/api/posts");
        if (!res.ok) {
            createToast("Server error", "error-toast", 1500);
            return;
        }

        const data = await res.json();
        data.forEach(post => {
            addPostPreviewToDOM(post);
        })
    } catch (err) {
        createToast(err.message || "Server error", "error-toast", 1500);
    }
}

// Calls the API to create a post with the details from the modal, then adds into view on success.
async function handleCreatePost() {
    try {
        const title = titleEl.value.trim();
        const featured = featuredEl.checked;
        const repoLink = repoEl.value.trim();
        const imageUrl = imageurlEl.value.trim();
        const tags = await createTags(modal.getSelectedTags());
        const content = contentEl.value.trim();

        // Add new post to database via the API
        const res = await fetch("/api/posts", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title, content, repoLink, featured, tags,
                imageUrl: imageUrl === "" ? null : imageUrl
            })
        });

        if (!res.ok) {
            checkAuthFail(res);
            createToast("Error creating post", "error-toast", 1500);
            return;
        }

        const post = await res.json();

        addPostPreviewToDOM(post);
        createToast("Successfully created post", "success-toast", 1500);
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
                    createToast("Error creating post", "error-toast", 1500);
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

// Called when the modal is saved in edit mode. Uses the API to update the post, then update the page.
async function handleUpdatePost() {
    try {
        const title = titleEl.value.trim();
        const featured = featuredEl.checked;
        const repoLink = repoEl.value.trim();
        const imageUrl = imageurlEl.value.trim();
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
            body: JSON.stringify({
                title, content, repoLink, featured, tags,
                imageUrl: imageUrl === "" ? null : imageUrl
            })
        });

        if (!res.ok) {
            checkAuthFail(res);
            createToast("Error updating post", "error-toast", 1500);
            return;
        }

        const updatedPost = await res.json();

        // Find element in page and update it
        console.log(updatedPost);
        const element = document.querySelector(`.project-preview[data-id="${updatedPost.id}"]`);
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

let deleteTimeout;

// Called by delete button on the modal
function handleDeleteClick() {
    if (!awaitingDeleteConfirmation) {
        // Start a timer, the user needs to confirm deletion within 5 seconds to help prevent accidental deletion.
        awaitingDeleteConfirmation = true;
        deletePostBtn.textContent = "⚠️ Click Again to Delete";
        deleteTimeout = setTimeout(() => {
            resetDeleteBtn();
        }, 5000);
    } else {
        // Button has been clicked twice, proceed to delete
        deletePost(modal.post)
            .then(success => {
                if (success) {
                    // delete from UI
                    const element = document.querySelector(`.project-preview[data-id="${modal.post.id}"]`);
                    if (element)
                        element.remove();
                    else
                        createToast("Error finding post element to remove", "error-toast", 1500);
                }
                // Close modal and reset delete button
                modal.hide();
                clearTimeout(deleteTimeout);
                resetDeleteBtn();
            });
    }
}

// Called by handleDeleteClick on timeout or confirmation
function resetDeleteBtn() {
    deletePostBtn.textContent = "Delete Post";
    awaitingDeleteConfirmation = false;
}

// Called by handleDeleteClick on confirmation. Returns boolean for success of deleting post from database.
async function deletePost(post) {
    try {
        // Delete post in database via the API
        const res = await fetch(`/api/posts/${post.id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${authToken}`,
            },
        });

        if (!res.ok) {
            checkAuthFail(res);
            createToast("Error deleting post", "error-toast", 1500);
            return false;
        }

        return true;
    } catch {
        createToast(err.message || "Server error", "error-toast", 1500);
        return false;
    }
}

// Force logout on API authorisation error, used in every API call that requires auth.
function checkAuthFail(res) {
    if (res.status == 401)
        logout();
}

// Used by other methods whenever unauthorised actions are attempted
function logout() {
    sessionStorage.clear();
    window.location.replace("./index.html");
}