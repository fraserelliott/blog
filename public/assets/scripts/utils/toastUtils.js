export function createToast(text, className, delayMs) {
    const alert = document.createElement("div");
    alert.className = className;
    alert.innerHTML = `${text}`;
    document.body.appendChild(alert);

    setTimeout(() => {
        alert.classList.add('hide');
        setTimeout(() => document.body.removeChild(alert), 150);
    }, delayMs);
}