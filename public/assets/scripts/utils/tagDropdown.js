import { createToast } from "./toastUtils.js";


export class TagDropdown {
    // allowAddition means the input will give an option to create a new tag
    constructor(containerId, toggleButtonId, checkedCallback = null, additionCallback = null) {
        this.container = document.getElementById(containerId);
        this.listEl = this.container.querySelector("ul");
        this.inputEl = this.container.querySelector("input");
        this.filterAvailableTags = this.filterAvailableTags.bind(this);
        this.inputEl.addEventListener("input", this.filterAvailableTags);
        this.additionCallback = additionCallback;
        this.checkedCallback = checkedCallback;

        // Close this if the page is clicked elsewhere
        document.addEventListener("click", (e) => {
            if (!this.container.contains(e.target) &&
                !document.getElementById(toggleButtonId).contains(e.target)) {
                this.hide();
            }
        });

        this.getAvailableTags();
    }

    show() {
        this.container.style.display = "block";
    }

    hide() {
        this.container.style.display = "none";
    }

    toggle() {
        const isVisible = this.container.style.display === "block";
        this.container.style.display = isVisible ? "none" : "block";
    }

    filterAvailableTags() {
        const searchTerm = this.inputEl.value.trim().toLowerCase();
        this.tagElements.forEach(element => {
            // Check if it meets the search criteria
            const name = element.querySelector("span").textContent;
            if (name.toLowerCase().includes(searchTerm))
                element.style.display = "list-item";
            else
                element.style.display = "none";
        });

        if (this.additionCallback)
            if (this.exactMatch()) // Only show the new tag if it doesn't exist already
                this.newTagEl.style.display = "none";
            else
                this.newTagEl.style.display = "list-item";
    }

    exactMatch() {
        const searchTerm = this.inputEl.value.trim().toLowerCase();
        const filtered = Array.from(this.tagElements)
            .filter(element => element.querySelector("span").textContent.toLowerCase() === searchTerm);
        return filtered.length > 0;
    }

    async getAvailableTags() {
        try {
            const res = await fetch("/api/tags");
            if (!res.ok)
                createToast("Server error", "error-toast", 1500);

            const data = await res.json();
            data.forEach(post => {
                this.addAvailableTag(post);
            });
            this.tagElements = this.listEl.querySelectorAll("li");

            // Add additional <li> for "New Tag" if a callback is given
            if (this.additionCallback) {
                this.newTagEl = document.createElement("li");
                this.newTagEl.innerHTML = "<i>New Tag</i>";
                this.newTagEl.style.display = "none";
                this.newTagEl.addEventListener("click", () => {
                    const name = this.inputEl.value.trim();
                    this.additionCallback(name);
                    // Reset filters after adding tag
                    this.inputEl.value = "";
                    this.filterAvailableTags();
                });
                this.listEl.appendChild(this.newTagEl);
            }
        } catch (err) {
            createToast(err.message || "Server error", "error-toast", 1500);
        }
    }

    // Adds an <li> element to the <ul> with a label and a checkbox
    addAvailableTag(tag) {
        const liEl = document.createElement("li");
        liEl.innerHTML = `
        <input type='checkbox'><span>${tag.name}</span>
        `;
        liEl.dataset.id = tag.id;

        // Check the box and call the callback function if a row is clicked
        const checkboxEl = liEl.querySelector("input");
        liEl.addEventListener("click", (e) => {
            if (e.target.tagName !== "INPUT")
                checkboxEl.checked = !checkboxEl.checked;

            if (this.checkedCallback)
                this.checkedCallback(checkboxEl.checked, tag);
        });

        this.listEl.appendChild(liEl);
    }

    // Find selected tags by filtering elements by the checkboxes
    getSelectedTags() {
        return Array.from(this.tagElements)
            .filter(element => element.querySelector("input").checked)
            .map(element => ({
                name: element.querySelector("span").textContent,
                id: element.dataset.id
            }));
    }
}