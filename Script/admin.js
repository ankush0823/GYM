 
// SAMPLE DATA 
const members = [
    {name: "John Doe", email: "john@example.com", phone: "9876543210", plan: "Premium", joinDate: "2026-01-10", expiryDate: "2027-01-10"},
    {name: "Jane Smith", email: "jane@example.com", phone: "9876543211", plan: "Standard", joinDate: "2026-02-05", expiryDate: "2027-02-05"},
    {name: "Alex Johnson", email: "alex@example.com", phone: "9876543212", plan: "Basic", joinDate: "2026-02-20", expiryDate: "2027-02-20"}
];

const enquiries = [
    {name: "Rohan Sharma", email: "rohan@example.com", phone: "9876543210", message: "I want to join the Premium plan.", date: "2026-03-10", status: "Pending"},
    {name: "Priya Singh", email: "priya@example.com", phone: "9876543211", message: "Do you offer personal training?", date: "2026-03-09", status: "Resolved"},
    {name: "Amit Kumar", email: "amit@example.com", phone: "9876543212", message: "What are the gym timings?", date: "2026-03-08", status: "Pending"}
];
  
// POPULATE MEMBERS TABLE 

const memberTable = document.getElementById('membersTable');
members.forEach(member =>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${member.name}</td>
        <td>${member.email}</td>
        <td>${member.phone}</td>
        <td>${member.plan}</td>
        <td>${member.joinDate}</td>
        <td>${member.expiryDate}</td>
    `;
    memberTable.appendChild(tr)
})
 
 
// ENQUIRIES TABLE FUNCTIONS 



function renderEnquiries() {
    const enquiriesTableBody = document.querySelector("#enquiriesTable");
    enquiriesTableBody.innerHTML = ""; 

    enquiries.forEach((enquiry, index) => {
        const row = document.createElement("tr");
        row.setAttribute("data-index", index);
        row.innerHTML = `
            <td>${enquiry.name}</td>
            <td>${enquiry.email}</td>
            <td>${enquiry.phone}</td>
            <td>${enquiry.message}</td>
            <td>${enquiry.date}</td> 
            <td>
                <button class="view">View</button>
                <button class="delete">Delete</button>
            </td>
        `;
        enquiriesTableBody.appendChild(row);
    });
}

// Event delegation for view/delete buttons
const enquiriesTable = document.getElementById("enquiriesTable");
enquiriesTable.addEventListener("click", function(e) {
    const row = e.target.closest("tr");
    if (!row) return;

    const idx = row.getAttribute("data-index");

    if (e.target.classList.contains("view")) {
        const enquiry = enquiries[idx];
        alert(`Enquiry from ${enquiry.name}:\n\nEmail: ${enquiry.email}\nPhone: ${enquiry.phone}\nMessage: ${enquiry.message}\nStatus: ${enquiry.status}\nDate: ${enquiry.date}`);
    }

    if (e.target.classList.contains("delete")) {
        if (confirm(`Are you sure you want to delete enquiry from ${enquiries[idx].name}?`)) {
            enquiries.splice(idx, 1);
            renderEnquiries();
            updateStats();
        }
    }
});

// ==============================
// DASHBOARD STATS
// ==============================
function updateStats() {
    document.getElementById("totalMembers").textContent = members.length;
    document.getElementById("activeMemberships").textContent = members.filter(m => new Date(m.expiryDate) >= new Date()).length;
    document.getElementById("totalEnquiries").textContent = enquiries.length;
}

// Initial render
renderEnquiries();
updateStats();

// ==============================
// SIDEBAR NAVIGATION
// ==============================
const sidebarLinks = document.querySelectorAll('.sidebar-menu li');
sidebarLinks.forEach(link => {
    link.addEventListener('click', function() {
        // Hide all sections
        document.querySelectorAll('.dashboard-section').forEach(sec => sec.style.display = 'none');

        // Show the clicked section
        const section = this.getAttribute('data-section');
        document.getElementById(section + '-section').style.display = 'block';

        // Highlight active link
        sidebarLinks.forEach(li => li.classList.remove('active'));
        this.classList.add('active');
    });
});

// ==============================
// ADMIN PROFILE FORM SUBMISSION
// ==============================
const adminForm = document.getElementById("adminProfileForm");
adminForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const updatedName = document.getElementById("adminName").value;
    const updatedEmail = document.getElementById("adminEmail").value;
    const updatedPassword = document.getElementById("adminPassword").value;
    const profilePic = document.getElementById("adminProfilePic").files[0];

    let msg = `Profile Updated Successfully!\n\nName: ${updatedName}\nEmail: ${updatedEmail}`;
    if(updatedPassword) msg += `\nPassword: ${'*'.repeat(updatedPassword.length)}`;
    if(profilePic) msg += `\nProfile Picture: ${profilePic.name}`;

    alert(msg);

    // Reset password field
    document.getElementById("adminPassword").value = '';
});