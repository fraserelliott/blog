import { createToast } from "./utils/toastUtils.js";

// Check for valid token to redirect on page load
if (sessionStorage.getItem("auth-token")) {
    window.location.replace("./dashboard.html");
}

const loginForm = document.getElementById("form-login");
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = loginForm.email.value;
    const password = loginForm.password.value;

    await attemptLogin(email, password);
});

// Attempts login via a POST and stores token received in sessionStorage
async function attemptLogin(email, password) {
    try {
        const res = await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            createToast(data.error, "error-toast", 1500);
            return;
        }

        sessionStorage.setItem("auth-token", data.token);
        const user = {
            name: data.name,
            id: data.id
        };

        sessionStorage.setItem("user", JSON.stringify(user));
        window.location.replace("./dashboard.html");
    } catch (err) {
        createToast(err.message || "Server error", "error-toast", 1500);
    }
}