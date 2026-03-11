// ==============================
// API BASE URL & AUTH
// ==============================
const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("adminToken");

if(!token) {
    window.location.href = "login.html";
}

const authHeader = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
};

// ==============================
// MEMBERS
// ==============================
let members = [];

const memberTable = document.getElementById('membersTable');

async function fetchMembers() {
    try {
        const response = await fetch(`${API_URL}/members`, {
            headers: authHeader
        });
        members = await response.json();
        renderMembers();
        updateStats();
    } catch (err) {
        console.error('Error fetching members:', err);
    }
}

function renderMembers() {
    memberTable.innerHTML = "";
    members.forEach((member) => {
        const tr = document.createElement('tr');
        tr.setAttribute("data-id", member._id);

        const today = new Date();
        const expiry = new Date(member.expiryDate);
        const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        if (daysLeft < 0) {
            tr.classList.add("expired");
        } else if (daysLeft <= 7) {
            tr.classList.add("expiring-soon");
        }

        tr.innerHTML = `
            <td>${member.name}</td>
            <td>${member.email}</td>
            <td>${member.phone}</td>
            <td>${member.plan}</td>
            <td>${member.joinDate.split('T')[0]}</td>
            <td>${member.expiryDate.split('T')[0]} ${daysLeft < 0 ? "❌ Expired" : daysLeft <= 7 ? "⚠️ Expiring Soon" : ""}</td>
            <td><button class="delete">Delete</button></td>
        `;
        memberTable.appendChild(tr);
    });
}

memberTable.addEventListener("click", async function (e) {
    if (e.target.classList.contains("delete")) {
        const row = e.target.closest("tr");
        const id = row.getAttribute("data-id");
        const memberName = row.querySelector("td").textContent;

        if (confirm(`Are you sure you want to delete ${memberName}?`)) {
            try {
                await fetch(`${API_URL}/members/${id}`, {
                    method: "DELETE",
                    headers: authHeader
                });
                fetchMembers();
            } catch (err) {
                console.error('Error deleting member:', err);
            }
        }
    }
});

// ==============================
// ADD MEMBER FORM
// ==============================
const addMemberBtn = document.getElementById("addMemberBtn");
const addMemberForm = document.getElementById("addMemberForm");
const saveMemberBtn = document.getElementById("saveMemberBtn");
const cancelMemberBtn = document.getElementById("cancelMemberBtn");

addMemberBtn.addEventListener("click", function () {
    addMemberForm.style.display = "block";
    addMemberBtn.style.display = "none";
});

cancelMemberBtn.addEventListener("click", function () {
    addMemberForm.style.display = "none";
    addMemberBtn.style.display = "block";
    clearMemberForm();
});

saveMemberBtn.addEventListener("click", async function () {
    const name = document.getElementById("newName").value.trim();
    const email = document.getElementById("newEmail").value.trim();
    const phone = document.getElementById("newPhone").value.trim();
    const plan = document.getElementById("newPlan").value;
    const joinDate = document.getElementById("newJoinDate").value;
    const expiryDate = document.getElementById("newExpiryDate").value;

    if (!name || !email || !phone || !joinDate || !expiryDate) {
        alert("Please fill in all fields!");
        return;
    }

    try {
        await fetch(`${API_URL}/members`, {
            method: "POST",
            headers: authHeader,
            body: JSON.stringify({ name, email, phone, plan, joinDate, expiryDate })
        });

        fetchMembers();
        addMemberForm.style.display = "none";
        addMemberBtn.style.display = "block";
        clearMemberForm();
        alert("Member added successfully!");
    } catch (err) {
        console.error('Error adding member:', err);
    }
});

function clearMemberForm() {
    document.getElementById("newName").value = "";
    document.getElementById("newEmail").value = "";
    document.getElementById("newPhone").value = "";
    document.getElementById("newPlan").value = "Basic";
    document.getElementById("newJoinDate").value = "";
    document.getElementById("newExpiryDate").value = "";
}

// ==============================
// ENQUIRIES
// ==============================
let enquiries = [];

async function fetchEnquiries() {
    try {
        const response = await fetch(`${API_URL}/enquiries`, {
            headers: authHeader
        });
        enquiries = await response.json();
        renderEnquiries();
        updateStats();
    } catch (err) {
        console.error('Error fetching enquiries:', err);
    }
}

function renderEnquiries() {
    const enquiriesTableBody = document.querySelector("#enquiriesTable");
    enquiriesTableBody.innerHTML = "";

    enquiries.forEach((enquiry) => {
        const row = document.createElement("tr");
        row.setAttribute("data-id", enquiry._id);
        row.innerHTML = `
            <td>${enquiry.name}</td>
            <td>${enquiry.email}</td>
            <td>${enquiry.phone}</td>
            <td>${enquiry.message}</td>
            <td>${enquiry.createdAt.split('T')[0]}</td>
            <td>
                <button class="view">View</button>
                <button class="delete">Delete</button>
            </td>
        `;
        enquiriesTableBody.appendChild(row);
    });
}

const enquiriesTable = document.getElementById("enquiriesTable");
enquiriesTable.addEventListener("click", async function (e) {
    const row = e.target.closest("tr");
    if (!row) return;

    const id = row.getAttribute("data-id");
    const enquiry = enquiries.find(eq => eq._id === id);

    if (e.target.classList.contains("view")) {
        alert(`Enquiry from ${enquiry.name}:\n\nEmail: ${enquiry.email}\nPhone: ${enquiry.phone}\nMessage: ${enquiry.message}\nStatus: ${enquiry.status}\nDate: ${enquiry.createdAt.split('T')[0]}`);
    }

    if (e.target.classList.contains("delete")) {
        if (confirm(`Are you sure you want to delete enquiry from ${enquiry.name}?`)) {
            try {
                await fetch(`${API_URL}/enquiries/${id}`, {
                    method: "DELETE",
                    headers: authHeader
                });
                fetchEnquiries();
            } catch (err) {
                console.error('Error deleting enquiry:', err);
            }
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

// ==============================
// SIDEBAR NAVIGATION
// ==============================
const sidebarLinks = document.querySelectorAll('.sidebar-menu li');
sidebarLinks.forEach(link => {
    link.addEventListener('click', function () {
        document.querySelectorAll('.dashboard-section').forEach(sec => sec.style.display = 'none');

        const section = this.getAttribute('data-section');
        document.getElementById(section + '-section').style.display = 'block';

        sidebarLinks.forEach(li => li.classList.remove('active'));
        this.classList.add('active');
    });
});

// ==============================
// ADMIN PROFILE FORM
// ==============================
const adminForm = document.getElementById("adminProfileForm");
adminForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const updatedName = document.getElementById("adminName").value;
    const updatedEmail = document.getElementById("adminEmail").value;
    const updatedPassword = document.getElementById("adminPassword").value;
    const profilePic = document.getElementById("adminProfilePic").files[0];

    let msg = `Profile Updated Successfully!\n\nName: ${updatedName}\nEmail: ${updatedEmail}`;
    if (updatedPassword) msg += `\nPassword: ${'*'.repeat(updatedPassword.length)}`;
    if (profilePic) msg += `\nProfile Picture: ${profilePic.name}`;

    alert(msg);
    document.getElementById("adminPassword").value = '';
});

// ==============================
// INITIAL LOAD
// ==============================
fetchMembers();
fetchEnquiries();

// ==============================
// SETTINGS TABS
// ==============================
const settingsTabBtns = document.querySelectorAll('.settings-tab-btn');
settingsTabBtns.forEach(btn => {
    btn.addEventListener('click', function () {
        // HIDE ALL TABS
        document.querySelectorAll('.settings-tab').forEach(tab => tab.style.display = 'none');

        // SHOW CLICKED TAB
        const tabId = this.getAttribute('data-tab');
        document.getElementById(tabId).style.display = 'block';

        // HIGHLIGHT ACTIVE BUTTON
        settingsTabBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
});

// ==============================
// WEBSITE CONTENT EDITOR
// ==============================
async function fetchContentForEditor() {
    try {
        const response = await fetch(`${API_URL}/content`, {
            headers: authHeader
        });
        const content = await response.json();

        // FILL HERO FIELDS
        document.getElementById("editHeroTitle").value = content.hero.title;
        document.getElementById("editHeroSubtitle").value = content.hero.subtitle;
        document.getElementById("editHeroDescription").value = content.hero.description;

        // FILL GYM INFO FIELDS
        document.getElementById("editGymAddress").value = content.gymInfo.address;
        document.getElementById("editGymPhone").value = content.gymInfo.phone;
        document.getElementById("editGymEmail").value = content.gymInfo.email;

        // FILL PLANS
        const plansEditor = document.getElementById("plansEditor");
        plansEditor.innerHTML = "";
        content.plans.forEach((plan, index) => {
            plansEditor.innerHTML += `
        <div class="content-item">
            <div class="form-group">
                <label>Plan Name:</label>
                <input type="text" id="planName${index}" value="${plan.name}">
            </div>
            <div class="form-group">
                <label>Price:</label>
                <input type="text" id="planPrice${index}" value="${plan.price}">
            </div>
            <div class="form-group">
                <label>Features:</label>
                <input type="text" id="planFeatures${index}" value="${plan.features}">
            </div>
            <button class="delete-item-btn" onclick="removeItem('plansEditor', this)">❌ Remove Plan</button>
        </div>
    `;
        });

        // ADD NEW PLAN BUTTON
        plansEditor.innerHTML += `
    <button class="add-item-btn" onclick="addPlan()">+ Add Plan</button>
`;

        // FILL TRAINERS
        const trainersEditor = document.getElementById("trainersEditor");
        trainersEditor.innerHTML = "";
        content.trainers.forEach((trainer, index) => {
            trainersEditor.innerHTML += `
        <div class="content-item">
            <div class="form-group">
                <label>Trainer Name:</label>
                <input type="text" id="trainerName${index}" value="${trainer.name}">
            </div>
            <div class="form-group">
                <label>Specialty:</label>
                <input type="text" id="trainerSpecialty${index}" value="${trainer.specialty}">
            </div>
            <button class="delete-item-btn" onclick="removeItem('trainersEditor', this)">❌ Remove Trainer</button>
        </div>
    `;
        });

        // ADD NEW TRAINER BUTTON
        trainersEditor.innerHTML += `
    <button class="add-item-btn" onclick="addTrainer()">+ Add Trainer</button>
`;

        // FILL PROGRAMS
        const programsEditor = document.getElementById("programsEditor");
        programsEditor.innerHTML = "";
        content.programs.forEach((program, index) => {
            programsEditor.innerHTML += `
        <div class="content-item">
            <div class="form-group" style="display:flex; gap:10px; align-items:center;">
                <input type="text" id="programName${index}" value="${program.name}" style="flex:1;">
                <button class="delete-item-btn" onclick="removeItem('programsEditor', this)">❌</button>
            </div>
        </div>
    `;
        });

        // ADD NEW PROGRAM BUTTON
        programsEditor.innerHTML += `
    <button class="add-item-btn" onclick="addProgram()">+ Add Program</button>
`;

    } catch (err) {
        console.error('Error fetching content for editor:', err);
    }
}

// ==============================
// ADD / REMOVE ITEMS
// ==============================

// REMOVE ITEM
function removeItem(editorId, btn) {
    const item = btn.closest('.content-item');
    item.remove();
}

// ADD NEW PROGRAM
function addProgram() {
    const programsEditor = document.getElementById("programsEditor");
    const index = programsEditor.querySelectorAll('.content-item').length;
    const newItem = document.createElement('div');
    newItem.classList.add('content-item');
    newItem.innerHTML = `
        <div class="form-group" style="display:flex; gap:10px; align-items:center;">
            <input type="text" id="programName${index}" placeholder="Enter program name" style="flex:1;">
            <button class="delete-item-btn" onclick="removeItem('programsEditor', this)">❌</button>
        </div>
    `;
    // INSERT BEFORE THE ADD BUTTON
    const addBtn = programsEditor.querySelector('.add-item-btn');
    programsEditor.insertBefore(newItem, addBtn);
}

// ADD NEW PLAN
function addPlan() {
    const plansEditor = document.getElementById("plansEditor");
    const index = plansEditor.querySelectorAll('.content-item').length;
    const newItem = document.createElement('div');
    newItem.classList.add('content-item');
    newItem.innerHTML = `
        <div class="form-group">
            <label>Plan Name:</label>
            <input type="text" id="planName${index}" placeholder="Enter plan name">
        </div>
        <div class="form-group">
            <label>Price:</label>
            <input type="text" id="planPrice${index}" placeholder="Enter price">
        </div>
        <div class="form-group">
            <label>Features:</label>
            <input type="text" id="planFeatures${index}" placeholder="Enter features">
        </div>
        <button class="delete-item-btn" onclick="removeItem('plansEditor', this)">❌ Remove Plan</button>
    `;
    // INSERT BEFORE THE ADD BUTTON
    const addBtn = plansEditor.querySelector('.add-item-btn');
    plansEditor.insertBefore(newItem, addBtn);
}

// ADD NEW TRAINER
function addTrainer() {
    const trainersEditor = document.getElementById("trainersEditor");
    const index = trainersEditor.querySelectorAll('.content-item').length;
    const newItem = document.createElement('div');
    newItem.classList.add('content-item');
    newItem.innerHTML = `
        <div class="form-group">
            <label>Trainer Name:</label>
            <input type="text" id="trainerName${index}" placeholder="Enter trainer name">
        </div>
        <div class="form-group">
            <label>Specialty:</label>
            <input type="text" id="trainerSpecialty${index}" placeholder="Enter specialty">
        </div>
        <button class="delete-item-btn" onclick="removeItem('trainersEditor', this)">❌ Remove Trainer</button>
    `;
    // INSERT BEFORE THE ADD BUTTON
    const addBtn = trainersEditor.querySelector('.add-item-btn');
    trainersEditor.insertBefore(newItem, addBtn);
}

// SAVE CONTENT
document.getElementById("saveContentBtn").addEventListener("click", async function() {
    try {
        // COLLECT PLANS
        const plans = [];
        document.querySelectorAll("#plansEditor .content-item").forEach((item) => {
            const inputs = item.querySelectorAll('input');
            if(inputs[0].value.trim()) {
                plans.push({
                    name: inputs[0].value,
                    price: inputs[1].value,
                    features: inputs[2].value
                });
            }
        });

        // COLLECT TRAINERS
        const trainers = [];
        document.querySelectorAll("#trainersEditor .content-item").forEach((item) => {
            const inputs = item.querySelectorAll('input');
            if(inputs[0].value.trim()) {
                trainers.push({
                    name: inputs[0].value,
                    specialty: inputs[1].value
                });
            }
        });

        // COLLECT PROGRAMS
        const programs = [];
        document.querySelectorAll("#programsEditor .content-item").forEach((item) => {
            const input = item.querySelector('input');
            if(input.value.trim()) {
                programs.push({
                    name: input.value
                });
            }
        });

        const updatedContent = {
            hero: { 
                title: document.getElementById("editHeroTitle").value,
                subtitle: document.getElementById("editHeroSubtitle").value,
                description: document.getElementById("editHeroDescription").value
            },
            gymInfo: {
                address: document.getElementById("editGymAddress").value,
                phone: document.getElementById("editGymPhone").value,
                email: document.getElementById("editGymEmail").value
            },
            plans,
            trainers,
            programs
        };

        await fetch(`${API_URL}/content`, {
            method: "PUT",
            headers: authHeader,
            body: JSON.stringify(updatedContent)
        });

        alert("Content updated successfully!");

    } catch(err) {
        console.error('Error saving content:', err);
    }
});

// LOAD CONTENT WHEN WEBSITE CONTENT TAB IS CLICKED
document.querySelectorAll('.settings-tab-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        if (this.getAttribute('data-tab') === 'website-content-tab') {
            fetchContentForEditor();
        }
    });
});


// ==============================
// LOGOUT
// ==============================
document.getElementById("logoutBtn").addEventListener("click", function() {
    if(confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("adminToken");
        window.location.href = "login.html";
    }
});