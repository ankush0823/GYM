document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    if(email === "" || password === "") {
        alert("Please fill all fields!");
        return;
    }

    // Dummy login check (temporary)
    if(email === "admin@gym.com" && password === "1234") {
        alert("Login Successful!");
        window.location.href = "index.html";
    } else {
        alert("Invalid Email or Password");
    }
});