document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if(email === "" || password === "") {
        alert("Please fill all fields!");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/admin/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if(response.ok) {
            localStorage.setItem("adminToken", data.token);
            alert("Login Successful!");
            window.location.href = "admin.html";
        } else {
            alert(data.message || "Invalid email or password!");
        }
    } catch(err) {
        alert("Something went wrong. Please try again!");
        console.error(err);
    }
});
