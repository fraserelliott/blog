export const postModalStates = {
    ADDPOST: 0,
    EDITPOST: 1
};

export class PostModal {
    constructor(container, titleEl, featuredEl, repoEl, imageurlEl, tagsEl, contentEl) {
        this.container = container;
        this.titleEl = titleEl;
        this.featuredEl = featuredEl;
        this.repoEl = repoEl;
        this.imageurlEl = imageurlEl;
        this.tagsEl = tagsEl;
        this.contentEl = contentEl;
    }

    // Show with a given postModalState. If editing, a post should be provided.
    show(state, post = undefined) {
        this.state = state;
        this.post = post;
        if (post) {
            // Fill with data from the post
            this.titleEl.value = post.title;
            this.featuredEl.checked = post.featured;
            this.repoEl.value = post.repoLink;
            if (post.imageUrl)
                this.imageurlEl.value = post.imageUrl;
            this.contentEl.value = post.content;

            // Add tags from post into DOM
            post.tags.forEach(tag => {
                this.addTagToDOM(tag);
                const liEl = this.container.querySelector(`li[data-id="${tag.id}"]`);
                if (liEl) {
                    const checkbox = liEl.querySelector("input");
                    if (checkbox)
                        checkbox.checked = true;
                }
            });
        }
        // Delete button needs to be visible only if it's been opened with postModalState.EDITPOST
        if (state === postModalStates.EDITPOST)
            document.getElementById("btn-delete-modal").style.display = "block";
        else
            document.getElementById("btn-delete-modal").style.display = "none";

        this.container.classList.remove("hidden");
    }

    // Hide and clear all data from editing/creating
    hide() {
        this.container.classList.add("hidden");
        this.state = undefined;
        this.post = undefined;
        this.clearData();
    }

    // Reset DOM elements making up the modal
    clearData() {
        this.titleEl.value = "";
        this.featuredEl.checked = false;
        this.repoEl.value = "";
        this.imageurlEl.value = "";
        this.tagsEl.innerHTML = "";
        this.contentEl.value = "";
    }

    // Adds a tag that already exists
    updateAvailableTag(checked, tag) {
        if (checked)
            this.addTagToDOM(tag);
        else
            this.removeTagById(tag.id);
    }

    // Adds a new tag that doesn't yet exist in the DB
    addNewTag(name) {
        // Check if it's already in the DOM before proceeding
        const tagElements = Array.from(this.tagsEl.querySelectorAll("span"));
        const alreadyExists = tagElements.some(element => element.textContent.toLowerCase() === name.toLowerCase())
        if (!alreadyExists)
            this.addTagToDOM({ name });
    }

    // Adds a tag where it already exists in the DB
    addTagToDOM(tag) {
        const tagEl = document.createElement("div");
        tagEl.innerHTML = `<span>${tag.name}</span><button>X</button>`;
        // Add data if there's an ID found to keep track
        if (tag.id)
            tagEl.dataset.id = tag.id;
        tagEl.querySelector("button").addEventListener("click", () => {
            tagEl.remove();
            // Find the checkbox with matching data-id
            const liEl = this.container.querySelector(`li[data-id="${tag.id}"]`);
            if (liEl) {
                const checkbox = liEl.querySelector("input");
                if (checkbox)
                    checkbox.checked = false;
            }
        });
        this.tagsEl.appendChild(tagEl);
    }

    // Remove by finding all tags and then filtering down using id data
    removeTagById(id) {
        const tagEl = this.tagsEl.querySelector(`div[data-id="${id}"]`);
        if (tagEl)
            tagEl.remove();
    }

    // Retrieves all tag data from the DOM as an array [{name, id}]
    getSelectedTags() {
        return Array.from(this.tagsEl.querySelectorAll("div"))
            .map(element => ({
                name: element.querySelector("span").textContent,
                id: element.dataset.id || undefined
            }));
    }
}