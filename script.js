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

    // Router Logic
    const handleRoute = () => {
        const params = new URLSearchParams(window.location.search);
        const recipeId = params.get('recipe');

        if (recipeId) {
            loadRecipeDetail(recipeId);
        } else {
            loadRecipeGrid();
        }
    };

    // Render Grid
    function loadRecipeGrid() {
        const main = document.querySelector('main');
        // Use global variable from recipes.js
        const recipes = window.recipes || [];

        // Restore Hero if missing (simple check)
        if (!document.querySelector('.hero')) {
            window.location.href = 'index.html';
            return;
        }

        const grid = document.querySelector('.recipe-grid');
        if (!grid) return;

        if (recipes.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;">No recipes found. Run node build.js</div>';
            return;
        }

        // Randomize recipes
        recipes.sort(() => Math.random() - 0.5);

        grid.innerHTML = recipes.map(recipe => `
            <article class="recipe-card" data-tags="${recipe.tags}" onclick="window.location.search='?recipe=${recipe.id}'">
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

        // Re-init animations
        initAnimations();

        // Render Tag Cloud
        renderTagCloud(recipes);
    }

    // Render Tag Cloud
    function renderTagCloud(recipes) {
        const tagCloudContainer = document.getElementById('tag-cloud');
        if (!tagCloudContainer) return;

        // Extract unique tags
        const allTags = recipes.flatMap(recipe =>
            recipe.tags ? recipe.tags.split(',').map(tag => tag.trim()) : []
        );
        const uniqueTags = [...new Set(allTags)].sort();

        if (uniqueTags.length === 0) {
            tagCloudContainer.style.display = 'none';
            return;
        }

        tagCloudContainer.innerHTML = uniqueTags.map(tag => `
            <button class="tag" onclick="filterRecipesByTag('${tag}')">${tag}</button>
        `).join('');

        // Expose filter function globally so onclick works
        window.filterRecipesByTag = filterRecipesByTag;
    }

    // Filter Recipes by Tag
    function filterRecipesByTag(selectedTag) {
        const tags = document.querySelectorAll('.tag');
        const cards = document.querySelectorAll('.recipe-card');
        let isActive = false;

        // Toggle active state on tags
        tags.forEach(tag => {
            if (tag.textContent === selectedTag) {
                if (tag.classList.contains('active')) {
                    tag.classList.remove('active');
                    isActive = false;
                } else {
                    tag.classList.add('active');
                    isActive = true;
                }
            } else {
                tag.classList.remove('active');
            }
        });

        // Filter recipes
        if (!isActive) {
            // Reset all
            cards.forEach(card => {
                card.classList.remove('grayed-out');
                card.style.order = '0';
            });
        } else {
            cards.forEach(card => {
                const cardTags = card.getAttribute('data-tags');
                const tagsArray = cardTags ? cardTags.split(',').map(t => t.trim()) : [];

                if (tagsArray.includes(selectedTag)) {
                    card.classList.remove('grayed-out');
                    card.style.order = '-1';
                } else {
                    card.classList.add('grayed-out');
                    card.style.order = '1';
                }
            });
        }
    }

    // Render Detail
    function loadRecipeDetail(id) {
        const recipes = window.recipes || [];
        const recipe = recipes.find(r => r.id === id);

        if (!recipe) {
            document.querySelector('main').innerHTML = '<div class="container" style="padding: 4rem; text-align: center;"><h2>Recipe not found</h2><a href="index.html" class="btn">Back to Home</a></div>';
            return;
        }

        // Parse Markdown Body
        const { ingredients, instructions } = parseRecipeMarkdown(recipe.content);

        const html = `
            <div class="container">
                <div style="margin-top: 2rem;">
                    <a href="index.html" style="color: var(--color-text-light); font-weight: 500;">← Back to Recipes</a>
                </div>
                <div class="recipe-header">
                    <div class="card-meta" style="justify-content: center;">${recipe.category} • ${recipe.tags}</div>
                    <h1>${recipe.title}</h1>
                    <div class="recipe-meta-large">
                        <span>Prep: ${recipe.prep_time}</span>
                        <span>Cook: ${recipe.cook_time}</span>
                        <span>Serves: ${recipe.servings}</span>
                    </div>
                </div>

                <img src="${recipe.image}" alt="${recipe.title}" class="recipe-hero-image">

                <div class="recipe-content">
                    <aside class="ingredients-box">
                        <h3>Ingredients</h3>
                        <div class="ingredient-list">
                            ${ingredients}
                        </div>
                    </aside>

                    <div class="instructions">
                        <h3>Instructions</h3>
                        ${instructions}
                    </div>
                </div>
            </div>
        `;

        document.querySelector('main').innerHTML = html;
        window.scrollTo(0, 0);

        // Re-attach checkbox listeners
        attachCheckboxListeners();
    }

    // Simple Markdown Parser for specific format
    function parseRecipeMarkdown(markdown) {
        const lines = markdown.split(/\r?\n/);
        let ingredientsHtml = '';
        let instructionsHtml = '';
        let currentSection = null; // 'ingredients' | 'instructions' | null
        let hasSeenIngredientHeader = false;

        // For instructions, we need to accumulate multi-line steps
        let currentStep = null; // { number, title, body }

        lines.forEach(line => {
            const trimmedLine = line.trim();

            // Detect Sections
            if (trimmedLine.startsWith('### Ingredients')) {
                currentSection = 'ingredients';
                return;
            } else if (trimmedLine.startsWith('### Instructions')) {
                currentSection = 'instructions';
                return;
            }

            // Parse Content based on section
            if (currentSection === 'ingredients') {
                if (trimmedLine.startsWith('####')) {
                    hasSeenIngredientHeader = true;
                    ingredientsHtml += `<h4 class="ingredient-group-header">${trimmedLine.replace(/#/g, '').trim()}</h4>`;
                } else if (trimmedLine.startsWith('- [ ]')) {
                    const text = trimmedLine.replace('- [ ]', '').trim();
                    const indentClass = hasSeenIngredientHeader ? 'indented' : '';
                    ingredientsHtml += `
                        <div class="ingredient-item ${indentClass}">
                            <div class="checkbox"></div>
                            <span>${text}</span>
                        </div>
                    `;
                }
            } else if (currentSection === 'instructions') {
                // Check if this is a new step (starts with number)
                const stepMatch = trimmedLine.match(/^(\d+)\.\s*\*\*(.*?)\*\*$/);
                if (stepMatch) {
                    // Save previous step if exists
                    if (currentStep) {
                        // Convert markdown bold to HTML
                        const bodyHtml = currentStep.body.trim().replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        instructionsHtml += `
                            <div class="instruction-step">
                                <span class="step-number">${currentStep.number}</span>
                                <h4>${currentStep.title}</h4>
                                <p>${bodyHtml}</p>
                            </div>
                        `;
                    }
                    // Start new step
                    currentStep = {
                        number: stepMatch[1],
                        title: stepMatch[2],
                        body: ''
                    };
                } else if (currentStep && trimmedLine.length > 0 && !trimmedLine.startsWith('#')) {
                    // This is continuation of the current step
                    currentStep.body += ' ' + trimmedLine;
                }
            }
        });


        // Don't forget to add the last instruction step
        if (currentStep) {
            // Convert markdown bold to HTML
            const bodyHtml = currentStep.body.trim().replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            instructionsHtml += `
                <div class="instruction-step">
                    <span class="step-number">${currentStep.number}</span>
                    <h4>${currentStep.title}</h4>
                    <p>${bodyHtml}</p>
                </div>
            `;
        }

        return { ingredients: ingredientsHtml, instructions: instructionsHtml };
    }

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

    // Initialize
    handleRoute();
});
