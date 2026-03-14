 
// API BASE URL & AUTH 
const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("adminToken");
if (!token) window.location.href = "admin-login.html";

const authHeader = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
};
 
// TOAST 
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = "block";
    setTimeout(() => { toast.style.display = "none"; }, 3500);
}
 
// MEMBERS 
let members = [];

async function fetchMembers() {
    try {
        const res = await fetch(`${API_URL}/members`, { headers: authHeader });
        members = await res.json();
        renderMembers();
        updateStats();
    } catch (err) { console.error('Error fetching members:', err); }
}

function renderMembers() {
    const tbody = document.getElementById('membersTable');
    const searchVal = (document.getElementById('memberSearch')?.value || '').toLowerCase();
    const planFilter = document.getElementById('memberPlanFilter')?.value || 'all';
    const statusFilter = document.getElementById('memberStatusFilter')?.value || 'all';

    const filtered = members.filter(m => {
        const matchSearch = m.name.toLowerCase().includes(searchVal) ||
            m.email.toLowerCase().includes(searchVal) || m.phone.toLowerCase().includes(searchVal);
        const matchPlan = planFilter === 'all' || m.plan === planFilter;
        const daysLeft = Math.ceil((new Date(m.expiryDate) - new Date()) / 86400000);
        const st = daysLeft < 0 ? 'expired' : daysLeft <= 7 ? 'expiring' : 'active';
        return matchSearch && matchPlan && (statusFilter === 'all' || st === statusFilter);
    });

    tbody.innerHTML = '';
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr class="no-results"><td colspan="7">No members found.</td></tr>`;
        return;
    }

    filtered.forEach(member => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-id', member._id);
        const daysLeft = Math.ceil((new Date(member.expiryDate) - new Date()) / 86400000);
        if (daysLeft < 0) tr.classList.add('expired');
        else if (daysLeft <= 7) tr.classList.add('expiring-soon');
        const expiryLabel = daysLeft < 0 ? `${member.expiryDate.split('T')[0]} ❌` :
            daysLeft <= 7 ? `${member.expiryDate.split('T')[0]} ⚠️` : member.expiryDate.split('T')[0];
        tr.innerHTML = `
            <td>${member.name}</td><td>${member.email}</td><td>${member.phone}</td>
            <td>${member.plan}</td><td>${member.joinDate.split('T')[0]}</td>
            <td>${expiryLabel}</td>
            <td><button class="edit">Edit</button><button class="delete">Delete</button></td>`;
        tbody.appendChild(tr);
    });
}

document.getElementById('membersTable').addEventListener('click', async function (e) {
    const row = e.target.closest('tr'); if (!row) return;
    const id = row.getAttribute('data-id');
    const member = members.find(m => m._id === id);
    if (e.target.classList.contains('edit')) openEditModal(member);
    if (e.target.classList.contains('delete')) {
        if (confirm(`Delete ${member.name}?`)) {
            try { await fetch(`${API_URL}/members/${id}`, { method: 'DELETE', headers: authHeader }); showToast('Member deleted.'); fetchMembers(); }
            catch (err) { showToast('Failed.', 'error'); }
        }
    }
});

document.getElementById('memberSearch').addEventListener('input', renderMembers);
document.getElementById('memberPlanFilter').addEventListener('change', renderMembers);
document.getElementById('memberStatusFilter').addEventListener('change', renderMembers);

function openEditModal(member) {
    document.getElementById('editMemberId').value = member._id;
    document.getElementById('editMemberName').value = member.name;
    document.getElementById('editMemberEmail').value = member.email;
    document.getElementById('editMemberPhone').value = member.phone;
    document.getElementById('editMemberPlan').value = member.plan;
    document.getElementById('editMemberJoinDate').value = member.joinDate.split('T')[0];
    document.getElementById('editMemberExpiryDate').value = member.expiryDate.split('T')[0];
    document.getElementById('editMemberModal').classList.add('active');
}
function closeEditModal() { document.getElementById('editMemberModal').classList.remove('active'); }
async function saveEditMember() {
    const id = document.getElementById('editMemberId').value;
    const payload = {
        name: document.getElementById('editMemberName').value.trim(),
        email: document.getElementById('editMemberEmail').value.trim(),
        phone: document.getElementById('editMemberPhone').value.trim(),
        plan: document.getElementById('editMemberPlan').value,
        joinDate: document.getElementById('editMemberJoinDate').value,
        expiryDate: document.getElementById('editMemberExpiryDate').value
    };
    if (!payload.name || !payload.email || !payload.phone || !payload.joinDate || !payload.expiryDate) {
        showToast('Fill all fields.', 'error'); return;
    }
    try {
        const res = await fetch(`${API_URL}/members/${id}`, { method: 'PUT', headers: authHeader, body: JSON.stringify(payload) });
        if (res.ok) { closeEditModal(); showToast('Member updated!'); fetchMembers(); }
        else { const d = await res.json(); showToast(d.message || 'Failed.', 'error'); }
    } catch (err) { showToast('Server error.', 'error'); }
}
document.getElementById('editMemberModal').addEventListener('click', function (e) { if (e.target === this) closeEditModal(); });

const addMemberBtn = document.getElementById('addMemberBtn');
const addMemberForm = document.getElementById('addMemberForm');
addMemberBtn.addEventListener('click', () => { addMemberForm.style.display = 'block'; addMemberBtn.style.display = 'none'; });
document.getElementById('cancelMemberBtn').addEventListener('click', () => { addMemberForm.style.display = 'none'; addMemberBtn.style.display = 'block'; clearMemberForm(); });
document.getElementById('saveMemberBtn').addEventListener('click', async () => {
    const name = document.getElementById('newName').value.trim();
    const email = document.getElementById('newEmail').value.trim();
    const phone = document.getElementById('newPhone').value.trim();
    const plan = document.getElementById('newPlan').value;
    const joinDate = document.getElementById('newJoinDate').value;
    const expiryDate = document.getElementById('newExpiryDate').value;
    if (!name || !email || !phone || !joinDate || !expiryDate) { showToast('Fill all fields!', 'error'); return; }
    try {
        const res = await fetch(`${API_URL}/members`, { method: 'POST', headers: authHeader, body: JSON.stringify({ name, email, phone, plan, joinDate, expiryDate }) });
        if (res.ok) { fetchMembers(); addMemberForm.style.display = 'none'; addMemberBtn.style.display = 'block'; clearMemberForm(); showToast('Member added!'); }
        else { const d = await res.json(); showToast(d.message || 'Failed.', 'error'); }
    } catch (err) { showToast('Server error.', 'error'); }
});
function clearMemberForm() {
    ['newName','newEmail','newPhone','newJoinDate','newExpiryDate'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('newPlan').value = 'Basic';
}
 
// ENQUIRIES 
let enquiries = [];
async function fetchEnquiries() {
    try {
        const res = await fetch(`${API_URL}/enquiries`, { headers: authHeader });
        enquiries = await res.json(); renderEnquiries(); updateStats();
    } catch (err) { console.error('Error fetching enquiries:', err); }
}
function renderEnquiries() {
    const tbody = document.getElementById('enquiriesTable');
    const searchVal = (document.getElementById('enquirySearch')?.value || '').toLowerCase();
    const statusFilter = document.getElementById('enquiryStatusFilter')?.value || 'all';
    const filtered = enquiries.filter(eq => {
        const m = eq.name.toLowerCase().includes(searchVal) || eq.email.toLowerCase().includes(searchVal) || eq.phone.toLowerCase().includes(searchVal);
        return m && (statusFilter === 'all' || eq.status === statusFilter);
    });
    tbody.innerHTML = '';
    if (filtered.length === 0) { tbody.innerHTML = `<tr class="no-results"><td colspan="7">No enquiries found.</td></tr>`; return; }
    filtered.forEach(eq => {
        const row = document.createElement('tr'); row.setAttribute('data-id', eq._id);
        const sc = eq.status === 'Resolved' ? 'resolved' : 'pending';
        row.innerHTML = `
            <td>${eq.name}</td><td>${eq.email}</td><td>${eq.phone}</td>
            <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${eq.message}">${eq.message}</td>
            <td>${eq.createdAt.split('T')[0]}</td>
            <td><span class="status-badge ${sc}" data-id="${eq._id}" data-status="${eq.status}">${eq.status === 'Resolved' ? '✓ Resolved' : '● Pending'}</span></td>
            <td><button class="view">View</button><button class="delete">Delete</button></td>`;
        tbody.appendChild(row);
    });
}
document.getElementById('enquiriesTable').addEventListener('click', async function (e) {
    const row = e.target.closest('tr'); if (!row) return;
    const id = row.getAttribute('data-id');
    const eq = enquiries.find(q => q._id === id);
    if (e.target.classList.contains('view')) alert(`From: ${eq.name}\n\nEmail: ${eq.email}\nPhone: ${eq.phone}\nStatus: ${eq.status}\nDate: ${eq.createdAt.split('T')[0]}\n\nMessage:\n${eq.message}`);
    if (e.target.classList.contains('delete')) {
        if (confirm(`Delete enquiry from ${eq.name}?`)) {
            try { await fetch(`${API_URL}/enquiries/${id}`, { method: 'DELETE', headers: authHeader }); showToast('Enquiry deleted.'); fetchEnquiries(); }
            catch (err) { showToast('Failed.', 'error'); }
        }
    }
    if (e.target.classList.contains('status-badge')) {
        const newStatus = e.target.getAttribute('data-status') === 'Pending' ? 'Resolved' : 'Pending';
        try {
            const res = await fetch(`${API_URL}/enquiries/${id}/status`, { method: 'PUT', headers: authHeader, body: JSON.stringify({ status: newStatus }) });
            if (res.ok) { const idx = enquiries.findIndex(q => q._id === id); if (idx !== -1) enquiries[idx].status = newStatus; renderEnquiries(); showToast(`Marked as ${newStatus}.`); }
            else showToast('Failed.', 'error');
        } catch (err) { showToast('Server error.', 'error'); }
    }
});
document.getElementById('enquirySearch').addEventListener('input', renderEnquiries);
document.getElementById('enquiryStatusFilter').addEventListener('change', renderEnquiries);
 
// STATS 
function updateStats() {
    document.getElementById('totalMembers').textContent = members.length;
    document.getElementById('activeMemberships').textContent = members.filter(m => new Date(m.expiryDate) >= new Date()).length;
    document.getElementById('totalEnquiries').textContent = enquiries.length;
}
 
// SIDEBAR 
document.querySelectorAll('.sidebar-menu li').forEach(link => {
    link.addEventListener('click', function () {
        document.querySelectorAll('.dashboard-section').forEach(s => s.style.display = 'none');
        document.getElementById(this.getAttribute('data-section') + '-section').style.display = 'block';
        document.querySelectorAll('.sidebar-menu li').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        const section = this.getAttribute('data-section');
        if (section === 'gallery') fetchGalleryAdmin();
        if (section === 'reviews') fetchReviewsAdmin();
        if (section === 'settings') loadAdminProfile();
    });
});
 
// GALLERY MANAGEMENT 
let galleryImages = [];
let selectedFile = null;

async function fetchGalleryAdmin() {
    try {
        const res = await fetch(`${API_URL}/gallery`);
        galleryImages = await res.json();
        renderGalleryAdmin();
    } catch (err) { console.error('Error fetching gallery:', err); }
}
function renderGalleryAdmin() {
    const grid = document.getElementById('galleryAdminGrid');
    const count = document.getElementById('galleryCount');
    count.textContent = `(${galleryImages.length} photo${galleryImages.length !== 1 ? 's' : ''})`;
    grid.innerHTML = '';
    if (galleryImages.length === 0) { grid.innerHTML = `<div class="gallery-admin-empty">No photos yet. Upload your first gym photo above!</div>`; return; }
    galleryImages.forEach(img => {
        const div = document.createElement('div'); div.className = 'gallery-admin-item';
        div.innerHTML = `
            <img src="${img.url}" alt="${img.caption || ''}" loading="lazy">
            <div class="gallery-admin-item-overlay">
                <div class="gallery-admin-caption">${img.caption || '<span style="color:#555;font-style:italic;">No caption</span>'}</div>
                <div class="gallery-admin-actions">
                    <button class="btn-edit-caption" data-id="${img._id}" data-caption="${img.caption || ''}">✏️ Caption</button>
                    <button class="btn-delete-img" data-id="${img._id}">🗑️ Delete</button>
                </div>
            </div>`;
        grid.appendChild(div);
    });
}
document.getElementById('galleryAdminGrid').addEventListener('click', async function (e) {
    if (e.target.classList.contains('btn-edit-caption')) {
        document.getElementById('editCaptionId').value = e.target.getAttribute('data-id');
        document.getElementById('editCaptionText').value = e.target.getAttribute('data-caption');
        document.getElementById('editCaptionModal').classList.add('active');
    }
    if (e.target.classList.contains('btn-delete-img')) {
        if (confirm('Delete this photo permanently?')) {
            try {
                const res = await fetch(`${API_URL}/gallery/${e.target.getAttribute('data-id')}`, { method: 'DELETE', headers: authHeader });
                if (res.ok) { showToast('Photo deleted.'); fetchGalleryAdmin(); }
                else showToast('Failed.', 'error');
            } catch (err) { showToast('Server error.', 'error'); }
        }
    }
});
function closeEditCaptionModal() { document.getElementById('editCaptionModal').classList.remove('active'); }
async function saveCaption() {
    const id = document.getElementById('editCaptionId').value;
    const caption = document.getElementById('editCaptionText').value.trim();
    try {
        const res = await fetch(`${API_URL}/gallery/${id}/caption`, { method: 'PUT', headers: authHeader, body: JSON.stringify({ caption }) });
        if (res.ok) { closeEditCaptionModal(); showToast('Caption updated!'); fetchGalleryAdmin(); }
        else showToast('Failed.', 'error');
    } catch (err) { showToast('Server error.', 'error'); }
}
document.getElementById('editCaptionModal').addEventListener('click', function (e) { if (e.target === this) closeEditCaptionModal(); });

const fileInput   = document.getElementById('galleryFileInput');
const previewBox  = document.getElementById('uploadPreview');
const previewImg  = document.getElementById('uploadPreviewImg');
const uploadBtn   = document.getElementById('uploadImageBtn');
const dropZone    = document.getElementById('fileDropZone');

fileInput.addEventListener('change', function () { if (this.files && this.files[0]) { selectedFile = this.files[0]; showPreview(selectedFile); } });
function showPreview(file) {
    const reader = new FileReader();
    reader.onload = e => { previewImg.src = e.target.result; previewBox.style.display = 'block'; uploadBtn.disabled = false; };
    reader.readAsDataURL(file);
}
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
    e.preventDefault(); dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && ['image/jpeg','image/jpg','image/png','image/webp'].includes(file.type)) { selectedFile = file; showPreview(file); }
    else showToast('Only JPEG, PNG or WebP allowed.', 'error');
});
uploadBtn.addEventListener('click', async () => {
    if (!selectedFile) { showToast('Select an image first.', 'error'); return; }
    const caption = document.getElementById('galleryCaption').value.trim();
    const progress = document.getElementById('uploadProgress');
    uploadBtn.disabled = true; uploadBtn.textContent = 'Uploading...'; progress.style.display = 'block';
    document.getElementById('uploadProgressFill').style.width = '60%';
    try {
        const formData = new FormData();
        formData.append('image', selectedFile);
        if (caption) formData.append('caption', caption);
        const res = await fetch(`${API_URL}/gallery`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
        document.getElementById('uploadProgressFill').style.width = '100%';
        if (res.ok) {
            showToast('Photo uploaded!');
            selectedFile = null; fileInput.value = ''; previewBox.style.display = 'none'; previewImg.src = ''; document.getElementById('galleryCaption').value = '';
            fetchGalleryAdmin();
        } else { const d = await res.json(); showToast(d.message || 'Upload failed.', 'error'); }
    } catch (err) { showToast('Upload failed.', 'error'); }
    finally { uploadBtn.disabled = false; uploadBtn.textContent = 'Upload Photo'; progress.style.display = 'none'; document.getElementById('uploadProgressFill').style.width = '0%'; }
});
 
// REVIEWS MANAGEMENT 
let allReviews = [];
async function fetchReviewsAdmin() {
    try {
        const res = await fetch(`${API_URL}/reviews/all`, { headers: authHeader });
        allReviews = await res.json(); renderReviewsAdmin();
    } catch (err) { console.error('Error fetching reviews:', err); }
}
function renderReviewsAdmin() {
    const container = document.getElementById('reviewsAdminList');
    const searchVal = (document.getElementById('reviewSearch')?.value || '').toLowerCase();
    const statusFilter = document.getElementById('reviewStatusFilter')?.value || 'all';
    const filtered = allReviews.filter(r => {
        const matchSearch = r.name.toLowerCase().includes(searchVal) || r.message.toLowerCase().includes(searchVal);
        const matchStatus = statusFilter === 'all' || (statusFilter === 'pending' && !r.approved) || (statusFilter === 'approved' && r.approved);
        return matchSearch && matchStatus;
    });
    container.innerHTML = '';
    if (filtered.length === 0) { container.innerHTML = `<div class="reviews-admin-empty">No reviews found.</div>`; return; }
    filtered.forEach(review => {
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        const date = new Date(review.createdAt).toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'numeric' });
        const statusTag = review.approved ? `<span class="review-status-tag approved">✓ Approved</span>` : `<span class="review-status-tag pending">● Pending</span>`;
        const card = document.createElement('div');
        card.className = `review-admin-card ${review.approved ? 'approved-review' : 'pending-review'}`;
        card.innerHTML = `
            <div class="review-admin-info">
                <div class="review-admin-header">
                    <span class="review-admin-name">${review.name}</span>
                    <span class="review-admin-stars">${stars}</span>
                    ${statusTag}
                    <span class="review-admin-date">${date}</span>
                </div>
                <p class="review-admin-message">${review.message}</p>
            </div>
            <div class="review-admin-actions">
                <button class="btn-approve" data-id="${review._id}" ${review.approved ? 'disabled':''}>
                    ${review.approved ? '✓ Approved' : '✓ Approve'}
                </button>
                <button class="btn-reject" data-id="${review._id}">🗑️ Delete</button>
            </div>`;
        container.appendChild(card);
    });
}
document.getElementById('reviewsAdminList').addEventListener('click', async function (e) {
    const id = e.target.getAttribute('data-id'); if (!id) return;
    if (e.target.classList.contains('btn-approve') && !e.target.disabled) {
        try {
            const res = await fetch(`${API_URL}/reviews/${id}/approve`, { method: 'PUT', headers: authHeader });
            if (res.ok) { const idx = allReviews.findIndex(r => r._id === id); if (idx !== -1) allReviews[idx].approved = true; renderReviewsAdmin(); showToast('Review approved! Now live.'); }
            else showToast('Failed.', 'error');
        } catch (err) { showToast('Server error.', 'error'); }
    }
    if (e.target.classList.contains('btn-reject')) {
        const review = allReviews.find(r => r._id === id);
        if (confirm(`Delete review from ${review?.name}?`)) {
            try {
                const res = await fetch(`${API_URL}/reviews/${id}`, { method: 'DELETE', headers: authHeader });
                if (res.ok) { allReviews = allReviews.filter(r => r._id !== id); renderReviewsAdmin(); showToast('Review deleted.'); }
                else showToast('Failed.', 'error');
            } catch (err) { showToast('Server error.', 'error'); }
        }
    }
});document.getElementById('reviewSearch').addEventListener('input', renderReviewsAdmin);
document.getElementById('reviewStatusFilter').addEventListener('change', renderReviewsAdmin);


// SETTINGS TABS 
document.querySelectorAll('.settings-tab-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.settings-tab').forEach(t => t.style.display = 'none');
        document.getElementById(this.getAttribute('data-tab')).style.display = 'block';
        document.querySelectorAll('.settings-tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        if (this.getAttribute('data-tab') === 'website-content-tab') fetchContentForEditor();
        if (this.getAttribute('data-tab') === 'admin-profile-tab') loadAdminProfile();
    });
});
 
// ADMIN PROFILE 
async function loadAdminProfile() {
    try {
        const res = await fetch(`${API_URL}/admin/profile`, { headers: authHeader });
        const admin = await res.json();
        document.getElementById('adminName').value = admin.name || '';
        document.getElementById('adminEmail').value = admin.email || '';
    } catch (err) { console.error('Failed to load admin profile:', err); }
}
document.getElementById('adminProfileForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const name = document.getElementById('adminName').value.trim();
    const email = document.getElementById('adminEmail').value.trim();
    const newPassword = document.getElementById('adminNewPassword').value;
    if (!name || !email) { showToast('Name and email required.', 'error'); return; }
    const payload = { name, email };
    if (newPassword) { if (newPassword.length < 6) { showToast('Password must be 6+ chars.', 'error'); return; } payload.newPassword = newPassword; }
    try {
        const res = await fetch(`${API_URL}/admin/profile`, { method: 'PUT', headers: authHeader, body: JSON.stringify(payload) });
        const data = await res.json();
        if (res.ok) { showToast('Profile updated!'); document.getElementById('adminNewPassword').value = ''; }
        else showToast(data.message || 'Failed.', 'error');
    } catch (err) { showToast('Server error.', 'error'); }
});
 
// DELETE ACCOUNT 
document.getElementById('deleteAccountBtn').addEventListener('click', () => {
    document.getElementById('deleteConfirmPassword').value = '';
    document.getElementById('deleteModal').classList.add('active');
});
function closeDeleteModal() { document.getElementById('deleteModal').classList.remove('active'); }
async function confirmDeleteAccount() {
    const password = document.getElementById('deleteConfirmPassword').value;
    if (!password) { showToast('Enter your password.', 'error'); return; }
    try {
        const res = await fetch(`${API_URL}/admin/account`, { method: 'DELETE', headers: authHeader, body: JSON.stringify({ password }) });
        const data = await res.json();
        if (res.ok) { closeDeleteModal(); localStorage.removeItem('adminToken'); alert('Account deleted.'); window.location.href = 'admin-register.html'; }
        else showToast(data.message || 'Failed.', 'error');
    } catch (err) { showToast('Server error.', 'error'); }
}
document.getElementById('deleteModal').addEventListener('click', function (e) { if (e.target === this) closeDeleteModal(); });
 
// WEBSITE CONTENT EDITOR 
async function fetchContentForEditor() {
    try {
        const res = await fetch(`${API_URL}/content`, { headers: authHeader });
        const content = await res.json();

        document.getElementById('editHeroTitle').value       = content.hero?.title || '';
        document.getElementById('editHeroSubtitle').value    = content.hero?.subtitle || '';
        document.getElementById('editHeroDescription').value = content.hero?.description || '';
        document.getElementById('editGymAddress').value      = content.gymInfo?.address || '';
        document.getElementById('editGymPhone').value        = content.gymInfo?.phone || '';
        document.getElementById('editGymEmail').value        = content.gymInfo?.email || '';

        renderWhyUsEditor(content.whyUs || []);
        renderTrainersEditor(content.trainers || []);
        renderProgramsEditor(content.programs || []);

        const plansEditor = document.getElementById('plansEditor');
        plansEditor.innerHTML = '';
        (content.plans || []).forEach((plan, i) => {
            plansEditor.innerHTML += `
                <div class="content-item">
                    <div class="form-group"><label>Plan Name:</label><input type="text" id="planName${i}" value="${plan.name || ''}"></div>
                    <div class="form-group"><label>Price:</label><input type="text" id="planPrice${i}" value="${plan.price || ''}"></div>
                    <div class="form-group"><label>Features:</label><input type="text" id="planFeatures${i}" value="${plan.features || ''}"></div>
                    <button class="delete-item-btn" onclick="removeItem('plansEditor', this)">❌ Remove Plan</button>
                </div>`;
        });
        plansEditor.innerHTML += `<button class="add-item-btn" onclick="addPlan()">+ Add Plan</button>`;

    } catch (err) { console.error('Error loading content editor:', err); }
}

// ── Why Us Editor ──── 
function renderWhyUsEditor(whyUs) {
    const editor = document.getElementById('whyUsEditor');
    editor.innerHTML = '';
    whyUs.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'content-item';
        div.innerHTML = `
            <div class="form-group"><label>Title:</label><input type="text" id="whyUsTitle${i}" value="${item.title || ''}"></div>
            <div class="form-group"><label>Description:</label><input type="text" id="whyUsDesc${i}" value="${item.description || ''}"></div>
            <button class="delete-item-btn" onclick="removeItem('whyUsEditor', this)">❌ Remove Card</button>`;
        editor.appendChild(div);
    });
}
function addWhyUsItem() {
    const editor = document.getElementById('whyUsEditor');
    const i = editor.querySelectorAll('.content-item').length;
    const div = document.createElement('div'); div.className = 'content-item';
    div.innerHTML = `
        <div class="form-group"><label>Title:</label><input type="text" id="whyUsTitle${i}" placeholder="e.g. Expert Coaches"></div>
        <div class="form-group"><label>Description:</label><input type="text" id="whyUsDesc${i}" placeholder="Short description..."></div>
        <button class="delete-item-btn" onclick="removeItem('whyUsEditor', this)">❌ Remove Card</button>`;
    editor.appendChild(div);
}

// ── Trainers Editor (with image upload) ──── 
function renderTrainersEditor(trainers) {
    const editor = document.getElementById('trainersEditor');
    editor.innerHTML = '';
    trainers.forEach((trainer, i) => buildTrainerItem(editor, trainer, i));
}
function buildTrainerItem(editor, trainer, i) {
    const div = document.createElement('div');
    div.className = 'content-item';
    div.setAttribute('data-trainer-index', i);
    div.innerHTML = `
        <div class="form-group"><label>Trainer Name:</label><input type="text" id="trainerName${i}" value="${trainer.name || ''}"></div>
        <div class="form-group"><label>Specialty:</label><input type="text" id="trainerSpecialty${i}" value="${trainer.specialty || ''}"></div>
        <div class="content-item-img-row">
            ${trainer.image
                ? `<img src="${trainer.image}" class="content-item-thumb" id="trainerThumb${i}" alt="Trainer photo">`
                : `<div class="content-item-thumb-placeholder" id="trainerThumb${i}">👤</div>`
            }
            <div class="content-item-img-actions">
                <label>Trainer Photo</label>
                <button class="btn-upload-img" id="trainerUploadBtn${i}">
                    📷 ${trainer.image ? 'Change Photo' : 'Upload Photo'}
                    <input type="file" accept="image/jpeg,image/png,image/webp"
                        onchange="handleTrainerImageUpload(event, ${i})">
                </button>
                <button class="btn-remove-img" id="trainerRemoveBtn${i}"
                    onclick="removeTrainerImage(${i})"
                    style="${trainer.image ? 'display:inline-block' : 'display:none'}">
                    🗑️ Remove Photo
                </button>
                <span class="img-upload-status" id="trainerImgStatus${i}"></span>
            </div>
        </div>
        <button class="delete-item-btn" onclick="removeItem('trainersEditor', this)" style="margin-top:10px;">❌ Remove Trainer</button>`;
    editor.appendChild(div);
}
function addTrainer() {
    const editor = document.getElementById('trainersEditor');
    const i = editor.querySelectorAll('.content-item').length;
    buildTrainerItem(editor, { name:'', specialty:'', image:'' }, i);
    const statusEl = document.getElementById(`trainerImgStatus${i}`);
    if (statusEl) { statusEl.textContent = 'Save content first, then upload photo.'; statusEl.style.color = '#666'; }
}

async function handleTrainerImageUpload(event, index) {
    const file = event.target.files[0]; if (!file) return;
    const statusEl   = document.getElementById(`trainerImgStatus${index}`);
    const thumbEl    = document.getElementById(`trainerThumb${index}`);
    const uploadBtn  = document.getElementById(`trainerUploadBtn${index}`);
    const removeBtn  = document.getElementById(`trainerRemoveBtn${index}`);
    statusEl.textContent = 'Uploading...'; statusEl.style.color = '#f1c40f';
    uploadBtn.disabled = true;
    const formData = new FormData(); formData.append('image', file);
    try {
        const res = await fetch(`${API_URL}/content/trainer/${index}/image`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
        const data = await res.json();
        if (res.ok) {
            if (thumbEl.tagName === 'DIV') {
                const img = document.createElement('img');
                img.src = data.image; img.className = 'content-item-thumb'; img.id = `trainerThumb${index}`; img.alt = 'Trainer photo';
                thumbEl.replaceWith(img);
            } else { thumbEl.src = data.image; }
            removeBtn.style.display = 'inline-block';
            uploadBtn.innerHTML = `📷 Change Photo<input type="file" accept="image/jpeg,image/png,image/webp" onchange="handleTrainerImageUpload(event, ${index})">`;
            statusEl.textContent = '✓ Saved!'; statusEl.style.color = '#2ecc71';
            setTimeout(() => { statusEl.textContent = ''; }, 3000);
            showToast('Trainer photo uploaded!');
        } else { statusEl.textContent = data.message || 'Failed.'; statusEl.style.color = '#e74c3c'; showToast('Upload failed.', 'error'); }
    } catch (err) { statusEl.textContent = 'Error.'; statusEl.style.color = '#e74c3c'; showToast('Upload error.', 'error'); }
    finally { uploadBtn.disabled = false; }
}
async function removeTrainerImage(index) {
    if (!confirm('Remove this trainer photo?')) return;
    try {
        const res = await fetch(`${API_URL}/content/trainer/${index}/image`, { method: 'DELETE', headers: authHeader });
        if (res.ok) {
            const thumbEl = document.getElementById(`trainerThumb${index}`);
            const ph = document.createElement('div'); ph.className = 'content-item-thumb-placeholder'; ph.id = `trainerThumb${index}`; ph.textContent = '👤';
            thumbEl.replaceWith(ph);
            document.getElementById(`trainerRemoveBtn${index}`).style.display = 'none';
            showToast('Photo removed.');
        } else showToast('Failed.', 'error');
    } catch (err) { showToast('Server error.', 'error'); }
}

// ── Programs Editor (with image upload) ───────────────────────────
function renderProgramsEditor(programs) {
    const editor = document.getElementById('programsEditor');
    editor.innerHTML = '';
    programs.forEach((program, i) => buildProgramItem(editor, program, i));
}
function buildProgramItem(editor, program, i) {
    const div = document.createElement('div');
    div.className = 'content-item';
    div.setAttribute('data-program-index', i);
    div.innerHTML = `
        <div class="form-group" style="display:flex;gap:10px;align-items:center;">
            <input type="text" id="programName${i}" value="${program.name || ''}" placeholder="Program name" style="flex:1;">
            <button class="delete-item-btn" onclick="removeItem('programsEditor', this)">❌</button>
        </div>
        <div class="content-item-img-row">
            ${program.image
                ? `<img src="${program.image}" class="content-item-thumb" id="programThumb${i}" alt="Program image" style="object-position:center;">`
                : `<div class="content-item-thumb-placeholder" id="programThumb${i}">🏋️</div>`
            }
            <div class="content-item-img-actions">
                <label>Cover Image</label>
                <button class="btn-upload-img" id="programUploadBtn${i}">
                    📷 ${program.image ? 'Change Image' : 'Upload Image'}
                    <input type="file" accept="image/jpeg,image/png,image/webp"
                        onchange="handleProgramImageUpload(event, ${i})">
                </button>
                <button class="btn-remove-img" id="programRemoveBtn${i}"
                    onclick="removeProgramImage(${i})"
                    style="${program.image ? 'display:inline-block' : 'display:none'}">
                    🗑️ Remove Image
                </button>
                <span class="img-upload-status" id="programImgStatus${i}"></span>
            </div>
        </div>`;
    editor.appendChild(div);
}
function addProgram() {
    const editor = document.getElementById('programsEditor');
    const i = editor.querySelectorAll('.content-item').length;
    buildProgramItem(editor, { name:'', image:'' }, i);
    const statusEl = document.getElementById(`programImgStatus${i}`);
    if (statusEl) { statusEl.textContent = 'Save content first, then upload image.'; statusEl.style.color = '#666'; }
}
async function handleProgramImageUpload(event, index) {
    const file = event.target.files[0]; if (!file) return;
    const statusEl  = document.getElementById(`programImgStatus${index}`);
    const thumbEl   = document.getElementById(`programThumb${index}`);
    const uploadBtn = document.getElementById(`programUploadBtn${index}`);
    const removeBtn = document.getElementById(`programRemoveBtn${index}`);
    statusEl.textContent = 'Uploading...'; statusEl.style.color = '#f1c40f';
    uploadBtn.disabled = true;
    const formData = new FormData(); formData.append('image', file);
    try {
        const res = await fetch(`${API_URL}/content/program/${index}/image`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
        const data = await res.json();
        if (res.ok) {
            if (thumbEl.tagName === 'DIV') {
                const img = document.createElement('img');
                img.src = data.image; img.className = 'content-item-thumb'; img.id = `programThumb${index}`; img.alt = 'Program image'; img.style.objectPosition = 'center';
                thumbEl.replaceWith(img);
            } else { thumbEl.src = data.image; }
            removeBtn.style.display = 'inline-block';
            uploadBtn.innerHTML = `📷 Change Image<input type="file" accept="image/jpeg,image/png,image/webp" onchange="handleProgramImageUpload(event, ${index})">`;
            statusEl.textContent = '✓ Saved!'; statusEl.style.color = '#2ecc71';
            setTimeout(() => { statusEl.textContent = ''; }, 3000);
            showToast('Program image uploaded!');
        } else { statusEl.textContent = data.message || 'Failed.'; statusEl.style.color = '#e74c3c'; showToast('Upload failed.', 'error'); }
    } catch (err) { statusEl.textContent = 'Error.'; statusEl.style.color = '#e74c3c'; showToast('Upload error.', 'error'); }
    finally { uploadBtn.disabled = false; }
}
async function removeProgramImage(index) {
    if (!confirm('Remove this program image?')) return;
    try {
        const res = await fetch(`${API_URL}/content/program/${index}/image`, { method: 'DELETE', headers: authHeader });
        if (res.ok) {
            const thumbEl = document.getElementById(`programThumb${index}`);
            const ph = document.createElement('div'); ph.className = 'content-item-thumb-placeholder'; ph.id = `programThumb${index}`; ph.textContent = '🏋️';
            thumbEl.replaceWith(ph);
            document.getElementById(`programRemoveBtn${index}`).style.display = 'none';
            showToast('Image removed.');
        } else showToast('Failed.', 'error');
    } catch (err) { showToast('Server error.', 'error'); }
}

// ── Shared helpers ─────────────────────────────────────────────────
function removeItem(editorId, btn) { btn.closest('.content-item').remove(); }
function addPlan() {
    const ed = document.getElementById('plansEditor');
    const i = ed.querySelectorAll('.content-item').length;
    const div = document.createElement('div'); div.className = 'content-item';
    div.innerHTML = `
        <div class="form-group"><label>Plan Name:</label><input type="text" id="planName${i}" placeholder="Plan name"></div>
        <div class="form-group"><label>Price:</label><input type="text" id="planPrice${i}" placeholder="Price"></div>
        <div class="form-group"><label>Features:</label><input type="text" id="planFeatures${i}" placeholder="Features"></div>
        <button class="delete-item-btn" onclick="removeItem('plansEditor', this)">❌ Remove Plan</button>`;
    ed.insertBefore(div, ed.querySelector('.add-item-btn'));
}

// ── Save All Text Content ──────────────────────────────────────────
document.getElementById('saveContentBtn').addEventListener('click', async () => {
    try {
        const whyUs = [];
        document.querySelectorAll('#whyUsEditor .content-item').forEach(item => {
            const title = item.querySelector('[id^="whyUsTitle"]')?.value.trim();
            const desc  = item.querySelector('[id^="whyUsDesc"]')?.value.trim();
            if (title) whyUs.push({ title, description: desc || '' });
        });

        const plans = [];
        document.querySelectorAll('#plansEditor .content-item').forEach(item => {
            const inputs = item.querySelectorAll('input');
            if (inputs[0]?.value.trim()) plans.push({ name: inputs[0].value, price: inputs[1]?.value || '', features: inputs[2]?.value || '' });
        });

        const trainers = [];
        document.querySelectorAll('#trainersEditor .content-item').forEach(item => {
            const nameEl = item.querySelector('[id^="trainerName"]');
            const specEl = item.querySelector('[id^="trainerSpecialty"]');
            if (nameEl?.value.trim()) trainers.push({ name: nameEl.value.trim(), specialty: specEl?.value.trim() || '' });
        });

        const programs = [];
        document.querySelectorAll('#programsEditor .content-item').forEach(item => {
            const nameEl = item.querySelector('[id^="programName"]');
            if (nameEl?.value.trim()) programs.push({ name: nameEl.value.trim() });
        });

        const res = await fetch(`${API_URL}/content`, {
            method: 'PUT',
            headers: authHeader,
            body: JSON.stringify({
                hero: {
                    title:       document.getElementById('editHeroTitle').value,
                    subtitle:    document.getElementById('editHeroSubtitle').value,
                    description: document.getElementById('editHeroDescription').value
                },
                gymInfo: {
                    address: document.getElementById('editGymAddress').value,
                    phone:   document.getElementById('editGymPhone').value,
                    email:   document.getElementById('editGymEmail').value
                },
                whyUs, plans, trainers, programs
            })
        });

        if (res.ok) {
            showToast('Website content saved successfully!');
            setTimeout(() => fetchContentForEditor(), 600);
        } else {
            showToast('Failed to save content.', 'error');
        }
    } catch (err) { showToast('Server error.', 'error'); console.error(err); }
}); 


// LOGOUT 
document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminToken');
        window.location.href = 'admin-login.html';
    }
});
 
// INITIAL LOAD 
fetchMembers();
fetchEnquiries();
loadAdminProfile();