document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = navLinks.classList.contains('active') ? '✕' : '☰';
            mobileToggle.textContent = icon;
        });
    }

    // Initialize based on page type
    const grid = document.querySelector('.recipe-grid');
    if (grid) {
        loadRecipeGrid();
    } else {
        // We are on a detail page (static HTML), just attach listeners
        attachCheckboxListeners();
        initAnimations();
    }
});

/* ===========================
   GRID & FILTERING
   =========================== */
function loadRecipeGrid() {
    const recipes = window.recipes || [];
    const grid = document.querySelector('.recipe-grid');

    if (!grid) return;

    if (recipes.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;">No recipes found.</div>';
        return;
    }

    // Sort by date published (newest first) or random
    // recipes.sort(() => Math.random() - 0.5); 

    grid.innerHTML = recipes.map(recipe => `
        <article class="recipe-card" data-tags="${recipe.tags}" onclick="window.location.href='recipes/${recipe.id}/index.html'">
            <div class="card-image">
                <img src="${recipe.image}" alt="${recipe.title}">
            </div>
            <div class="card-content">
                <div class="card-meta">${recipe.category} • ${recipe.prep_time}</div>
                <h3 class="card-title">${recipe.title}</h3>
                <p class="card-excerpt">${recipe.description}</p>
                <div class="card-footer">
                    <div class="cook-time">
                        <span>⏱</span> ${recipe.prep_time}
                    </div>
                    <span class="view-recipe">View Recipe →</span>
                </div>
            </div>
        </article>
    `).join('');

    initAnimations();
    renderTagCloud(recipes);
}

function renderTagCloud(recipes) {
    const tagCloudContainer = document.getElementById('tag-cloud');
    if (!tagCloudContainer) return;

    const allTags = recipes.flatMap(recipe =>
        recipe.tags ? recipe.tags.split(',').map(tag => tag.trim()) : []
    );
    const uniqueTags = [...new Set(allTags)].sort();

    tagCloudContainer.innerHTML = uniqueTags.map(tag => `
        <button class="tag" onclick="filterRecipesByTag('${tag}')">${tag}</button>
    `).join('');

    window.filterRecipesByTag = filterRecipesByTag;
}

function filterRecipesByTag(selectedTag) {
    const tags = document.querySelectorAll('.tag');
    const cards = document.querySelectorAll('.recipe-card');
    let activeTag = null;

    // Update Tag UI
    tags.forEach(tag => {
        const tagText = tag.textContent.trim();
        if (tagText === selectedTag) {
            if (tag.classList.contains('active')) {
                tag.classList.remove('active');
            } else {
                tag.classList.add('active');
                activeTag = selectedTag;
            }
        } else {
            tag.classList.remove('active');
        }
    });

    // Filter Cards
    if (!activeTag) {
        cards.forEach(card => {
            card.classList.remove('grayed-out');
            card.style.order = '0';
        });
    } else {
        cards.forEach(card => {
            const cardTags = card.getAttribute('data-tags');
            const tagsArray = cardTags ? cardTags.split(',').map(t => t.trim()) : [];

            if (tagsArray.includes(activeTag)) {
                card.classList.remove('grayed-out');
                card.style.order = '-1';
            } else {
                card.classList.add('grayed-out');
                card.style.order = '1';
            }
        });
    }
}

/* ===========================
   UTILITIES
   =========================== */
function attachCheckboxListeners() {
    const checkboxes = document.querySelectorAll('.checkbox');
    checkboxes.forEach(box => {
        box.addEventListener('click', () => {
            box.classList.toggle('checked');
            const text = box.nextElementSibling;
            if (text) {
                text.style.textDecoration = box.classList.contains('checked') ? 'line-through' : 'none';
                text.style.opacity = box.classList.contains('checked') ? '0.5' : '1';
            }
        });
    });
}

function initAnimations() {
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.recipe-card, .hero-content, .section-header');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Expose functions globally
window.filterRecipesByTag = filterRecipesByTag;
