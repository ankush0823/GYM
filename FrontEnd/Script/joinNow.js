document.getElementById("registerForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const message = document.getElementById("message").value.trim();

    // VALIDATION
    if(!name || !email || !phone || !message) {
        alert("Please fill in all fields!");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/enquiries", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, phone, message })
        });

        const data = await response.json();

        if(response.ok) {
            alert("Enquiry submitted successfully! We will contact you soon.");
            document.getElementById("registerForm").reset();
        } else {
            alert(data.message || "Something went wrong!");
        }
    } catch(err) {
        alert("Something went wrong. Please try again!");
        console.error(err);
    }
});
