document.getElementById("registerForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let phone = document.getElementById("phone").value;
    let plan = document.getElementById("plan").value;
    let password = document.getElementById("password").value;

    if(name === "" || email === "" || phone === "" || plan === "" || password === "") {
        alert("Please fill all fields!");
        return;
    }

    alert("Registration Successful! 🎉");
    window.location.href = "login.html";
});