
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form");
    const errorMsg = document.getElementById("login-error");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = form.email.value;
        const password = form.password.value;

        try {
            const response = await fetch("http://localhost:5678/api/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error("Invalid credentials");
            }

            const data = await response.json();
            localStorage.setItem("token", data.token);

            // Redirect to homepage
            window.location.href = "index.html";
        } catch (error) {
            errorMsg.style.display = "block";
        }
    });
});