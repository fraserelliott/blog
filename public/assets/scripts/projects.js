import { createToast } from "./utils/toastUtils.js";
import { createPostElement } from "./utils/postUtils.js";
import { TagDropdown } from "./utils/tagDropdown.js";

// Set up tag filter button on the page
const tagFilter = new TagDropdown("tag-filter", "btn-filter", filterTags);
document.getElementById("btn-filter").addEventListener("click", () => {
    tagFilter.toggle();
});

function filterTags() {
    const selectedTags = tagFilter.getSelectedTags();
    document.getElementById("div-projects").innerHTML = ""; // Clear all data
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

// Used by other functions when posts are retrieved from the API
function addPostPreviewToDOM(post) {
    const divEl = createPostElement(post, "project-preview");
    divEl.addEventListener("click", () => {
        window.location.href = `./project/${post.id}`;
    });
    document.getElementById("div-projects").appendChild(divEl);
}

await showPosts();

async function showPosts() {
    try {
        const res = await fetch("/api/posts");
        if (!res.ok)
            createToast("Server error", "error-toast", 1500);

        const data = await res.json();
        data.forEach(post => {
            addPostPreviewToDOM(post)
        })
    } catch (err) {
        createToast(err.message || "Server error", "error-toast", 1500);
    }
}