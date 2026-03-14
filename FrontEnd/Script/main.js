// ─── HAMBURGER ────────────────────────────────────────────────────────────────
const menuToggle = document.querySelector('.menu-toggle');
const navLinks   = document.querySelector('.nav-links');
const navBtn     = document.querySelector('.nav-btn');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    navBtn.classList.toggle('active');
    menuToggle.classList.toggle('open');
});

const API_URL = "http://localhost:5000/api";

// ─── FETCH WEBSITE CONTENT ────────────────────────────────────────────────────
async function fetchContent() {
    try {
        const res = await fetch(`${API_URL}/content`);
        const content = await res.json();

        // HERO
        document.getElementById("heroTitle").textContent       = content.hero.title;
        document.getElementById("heroSubtitle").textContent    = content.hero.subtitle;
        document.getElementById("heroDescription").textContent = content.hero.description;

        // WHY CHOOSE US (dynamic)
        const features = document.getElementById("featuresGrid");
        if (features && content.whyUs && content.whyUs.length > 0) {
            features.innerHTML = "";
            content.whyUs.forEach(item => {
                features.innerHTML += `
                    <div class="feature-box">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                    </div>`;
            });
        }

        // PRICING CARDS
        const pricingCards = document.getElementById("pricingCards");
        pricingCards.innerHTML = "";
        content.plans.forEach(plan => {
            pricingCards.innerHTML += `
                <div class="price-card">
                    <h3>${plan.name}</h3>
                    <p>${plan.price}</p>
                    <p>${plan.features}</p>
                    <a href="joinNow.html" class="primary-btn">Join Now</a>
                </div>`;
        });

        // TRAINERS — with optional photo
        const trainerList = document.getElementById("trainerList");
        trainerList.innerHTML = "";
        content.trainers.forEach(trainer => {
            trainerList.innerHTML += `
                <div class="trainer-card">
                    ${trainer.image
                        ? `<div class="trainer-img-wrap"><img src="${trainer.image}" alt="${trainer.name}" loading="lazy"></div>`
                        : `<div class="trainer-img-placeholder">👤</div>`
                    }
                    <h3>${trainer.name}</h3>
                    <p>${trainer.specialty}</p>
                </div>`;
        });

        // PROGRAMS — with optional image
        const programList = document.getElementById("programList");
        programList.innerHTML = "";
        content.programs.forEach(program => {
            programList.innerHTML += `
                <div class="program-card">
                    ${program.image
                        ? `<div class="program-img-wrap"><img src="${program.image}" alt="${program.name}" loading="lazy"></div>`
                        : ''
                    }
                    <span class="program-name">${program.name}</span>
                </div>`;
        });

        // GYM INFO
        document.getElementById("gymAddress").textContent = content.gymInfo.address;
        document.getElementById("gymPhone").textContent   = content.gymInfo.phone;
        document.getElementById("gymEmail").textContent   = content.gymInfo.email;

    } catch (err) {
        console.error('Error fetching content:', err);
    }
}

// ─── GALLERY ──────────────────────────────────────────────────────────────────
let galleryImages = [];
let lightboxIndex = 0;

async function fetchGallery() {
    try {
        const res = await fetch(`${API_URL}/gallery`);
        galleryImages = await res.json();
        renderGallery();
    } catch (err) {
        console.error('Error fetching gallery:', err);
    }
}

function renderGallery() {
    const grid = document.getElementById('galleryGrid');
    grid.innerHTML = '';

    if (galleryImages.length === 0) {
        grid.innerHTML = `<p class="gallery-empty">No photos yet. Check back soon!</p>`;
        return;
    }

    galleryImages.forEach((image, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `
            <img src="${image.url}" alt="${image.caption || 'Gym photo'}" loading="lazy">
            <div class="gallery-item-overlay">
                ${image.caption ? `<span class="gallery-item-caption">${image.caption}</span>` : ''}
            </div>`;
        item.addEventListener('click', () => openLightbox(index));
        grid.appendChild(item);
    });
}

// Lightbox
const lightbox       = document.getElementById('lightbox');
const lightboxImg    = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');

function openLightbox(index) {
    lightboxIndex = index;
    updateLightbox();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function updateLightbox() {
    const image = galleryImages[lightboxIndex];
    lightboxImg.src = image.url;
    lightboxImg.alt = image.caption || 'Gym photo';
    lightboxCaption.textContent = image.caption || '';
}

document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
document.getElementById('lightboxPrev').addEventListener('click', () => {
    lightboxIndex = (lightboxIndex - 1 + galleryImages.length) % galleryImages.length;
    updateLightbox();
});
document.getElementById('lightboxNext').addEventListener('click', () => {
    lightboxIndex = (lightboxIndex + 1) % galleryImages.length;
    updateLightbox();
});
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft')  { lightboxIndex = (lightboxIndex - 1 + galleryImages.length) % galleryImages.length; updateLightbox(); }
    if (e.key === 'ArrowRight') { lightboxIndex = (lightboxIndex + 1) % galleryImages.length; updateLightbox(); }
});

// ─── REVIEWS ──────────────────────────────────────────────────────────────────
async function fetchReviews() {
    try {
        const res = await fetch(`${API_URL}/reviews`);
        const reviews = await res.json();
        renderReviews(reviews);
    } catch (err) {
        console.error('Error fetching reviews:', err);
        document.getElementById('reviewsList').innerHTML = `<div class="reviews-empty">Could not load reviews.</div>`;
    }
}

function renderReviews(reviews) {
    const list = document.getElementById('reviewsList');

    if (reviews.length === 0) {
        list.innerHTML = `<div class="reviews-empty">No reviews yet. Be the first to leave one! →</div>`;
        return;
    }

    list.innerHTML = '';
    reviews.forEach(review => {
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        const date  = new Date(review.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
        const card = document.createElement('div');
        card.className = 'review-card';
        card.innerHTML = `
            <div class="review-card-header">
                <span class="review-card-name">${review.name}</span>
                <span class="review-card-date">${date}</span>
            </div>
            <div class="review-card-stars">${stars}</div>
            <p class="review-card-message">${review.message}</p>`;
        list.appendChild(card);
    });
}

// ─── STAR RATING ──────────────────────────────────────────────────────────────
let selectedRating = 0;
const stars = document.querySelectorAll('.star-rating .star');

stars.forEach(star => {
    star.addEventListener('mouseenter', () => {
        const val = parseInt(star.getAttribute('data-value'));
        stars.forEach(s => {
            s.classList.remove('hovered');
            if (parseInt(s.getAttribute('data-value')) <= val) s.classList.add('hovered');
        });
    });

    star.addEventListener('mouseleave', () => {
        stars.forEach(s => s.classList.remove('hovered'));
    });

    star.addEventListener('click', () => {
        selectedRating = parseInt(star.getAttribute('data-value'));
        document.getElementById('reviewRating').value = selectedRating;
        stars.forEach(s => {
            s.classList.remove('selected');
            if (parseInt(s.getAttribute('data-value')) <= selectedRating) s.classList.add('selected');
        });
    });
});

// ─── SUBMIT REVIEW ────────────────────────────────────────────────────────────
document.getElementById('submitReviewBtn').addEventListener('click', async () => {
    const name    = document.getElementById('reviewName').value.trim();
    const rating  = parseInt(document.getElementById('reviewRating').value);
    const message = document.getElementById('reviewMessage').value.trim();
    const btn        = document.getElementById('submitReviewBtn');
    const successMsg = document.getElementById('reviewSuccessMsg');

    if (!name)               { alert('Please enter your name.');          return; }
    if (!rating || rating < 1) { alert('Please select a star rating.');   return; }
    if (!message)            { alert('Please write your review.');        return; }

    btn.disabled    = true;
    btn.textContent = 'Submitting...';

    try {
        const res = await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, rating, message })
        });

        const data = await res.json();

        if (res.ok) {
            document.getElementById('reviewName').value    = '';
            document.getElementById('reviewMessage').value = '';
            document.getElementById('reviewRating').value  = '0';
            selectedRating = 0;
            stars.forEach(s => s.classList.remove('selected', 'hovered'));
            successMsg.style.display = 'block';
            setTimeout(() => { successMsg.style.display = 'none'; }, 6000);
        } else {
            alert(data.message || 'Something went wrong. Please try again.');
        }
    } catch (err) {
        alert('Could not submit review. Please try again.');
        console.error(err);
    } finally {
        btn.disabled    = false;
        btn.textContent = 'Submit Review';
    }
});

// ─── INIT ─────────────────────────────────────────────────────────────────────
fetchContent();
fetchGallery();
fetchReviews();