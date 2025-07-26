export const postModalStates = {
    ADDPOST: 0,
    EDITPOST: 1
};

export class PostModal {
    constructor(container, titleEl, featuredEl, repoEl, tagsEl, contentEl) {
        this.container = container;
        this.titleEl = titleEl;
        this.featuredEl = featuredEl;
        this.repoEl = repoEl;
        this.tagsEl = tagsEl;
        this.contentEl = contentEl;
        this.tags = [];
    }
    
    // Show with a given postModalState. If editing, a post should be provided.
    show(state, post = undefined) {
        this.container.classList.remove("hidden");
        this.state = state;
        this.post = post;
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
        this.tagsEl.innerHTML = "";
        this.contentEl.value = "";
    }
}