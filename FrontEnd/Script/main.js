 
// HAMBURGER TOGGLE 
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navBtn = document.querySelector('.nav-btn');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    navBtn.classList.toggle('active');
    menuToggle.classList.toggle('open');
});
 
// FETCH CONTENT FROM BACKEND 
const API_URL = "http://localhost:5000/api";

async function fetchContent() {
    try {
        const response = await fetch(`${API_URL}/content`);
        const content = await response.json();

        // UPDATE HERO SECTION
        document.getElementById("heroTitle").textContent = content.hero.title;
        document.getElementById("heroSubtitle").textContent = content.hero.subtitle;
        document.getElementById("heroDescription").textContent = content.hero.description;

        // UPDATE PRICING CARDS
        const pricingCards = document.getElementById("pricingCards");
        pricingCards.innerHTML = "";
        content.plans.forEach(plan => {
            pricingCards.innerHTML += `
                <div class="price-card">
                    <h3>${plan.name}</h3>
                    <p>${plan.price}</p>
                    <p>${plan.features}</p>
                    <a href="joinNow.html" class="primary-btn">Join Now</a>
                </div>
            `;
        });

        // UPDATE TRAINERS
        const trainerList = document.getElementById("trainerList");
        trainerList.innerHTML = "";
        content.trainers.forEach(trainer => {
            trainerList.innerHTML += `
                <div class="trainer-card">
                    <h3>${trainer.name}</h3>
                    <p>${trainer.specialty}</p>
                </div>
            `;
        });

        // UPDATE PROGRAMS
        const programList = document.getElementById("programList");
        programList.innerHTML = "";
        content.programs.forEach(program => {
            programList.innerHTML += `
                <div class="program-card">${program.name}</div>
            `;
        });

        // UPDATE GYM INFO
        document.getElementById("gymAddress").textContent = content.gymInfo.address;
        document.getElementById("gymPhone").textContent = content.gymInfo.phone;
        document.getElementById("gymEmail").textContent = content.gymInfo.email;

    } catch(err) {
        console.error('Error fetching content:', err);
    }
}

fetchContent();
