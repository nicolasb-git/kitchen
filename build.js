const fs = require('fs');
const path = require('path');

const recipesDir = path.join(__dirname, 'recipes');
const outputFile = path.join(__dirname, 'recipes.js');
const templatePath = path.join(__dirname, 'index.html');

// Ensure recipes directory exists
if (!fs.existsSync(recipesDir)) {
    console.error('Recipes directory not found!');
    process.exit(1);
}

const recipes = [];
const files = fs.readdirSync(recipesDir);

// Helper: Parse Markdown (same logic as script.js)
function parseRecipeMarkdown(markdown) {
    const lines = markdown.split(/\r?\n/);
    let ingredientsHtml = '';
    let instructionsHtml = '';
    let currentSection = null;
    let hasSeenIngredientHeader = false;
    let currentStep = null;

    lines.forEach(line => {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('### Ingredients')) {
            currentSection = 'ingredients';
            return;
        } else if (trimmedLine.startsWith('### Instructions')) {
            currentSection = 'instructions';
            return;
        }

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
            const stepMatch = trimmedLine.match(/^(\d+)\.\s*\*\*(.*?)\*\*$/);
            if (stepMatch) {
                if (currentStep) {
                    const bodyHtml = currentStep.body.trim().replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    instructionsHtml += `
                        <div class="instruction-step">
                            <span class="step-number">${currentStep.number}</span>
                            <h4>${currentStep.title}</h4>
                            <p>${bodyHtml}</p>
                        </div>
                    `;
                }
                currentStep = {
                    number: stepMatch[1],
                    title: stepMatch[2],
                    body: ''
                };
            } else if (currentStep && trimmedLine.length > 0 && !trimmedLine.startsWith('#')) {
                currentStep.body += ' ' + trimmedLine;
            }
        }
    });

    if (currentStep) {
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

// Process Recipes
files.forEach(file => {
    if (path.extname(file) === '.md') {
        const content = fs.readFileSync(path.join(recipesDir, file), 'utf-8');
        const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);

        if (match) {
            const frontmatter = match[1];
            const body = match[2];
            const data = {};
            const lines = frontmatter.split('\n');

            lines.forEach(line => {
                const parts = line.split(':');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const value = parts.slice(1).join(':').trim();
                    data[key] = value;
                }
            });

            data.content = body;
            if (!data.id) data.id = path.basename(file, '.md');

            // ISO 8601 Duration Helper
            const toISO8601 = (str) => {
                if (!str) return 'PT0M';
                const match = str.match(/(\d+)\s*(min|hour|h|m)/i);
                if (match) {
                    const val = parseInt(match[1]);
                    const unit = match[2].toLowerCase().startsWith('h') ? 'H' : 'M';
                    return `PT${val}${unit}`;
                }
                return 'PT0M';
            };

            data.isoPrepTime = toISO8601(data.prep_time);
            data.isoCookTime = toISO8601(data.cook_time);
            data.datePublished = new Date().toISOString().split('T')[0];

            recipes.push(data);
            console.log(`Processed: ${file}`);
        } else {
            console.warn(`Skipping ${file}: Invalid format`);
        }
    }
});

// 1. Generate recipes.js (Keep existing functionality)
const jsContent = `window.recipes = ${JSON.stringify(recipes, null, 4)};`;
fs.writeFileSync(outputFile, jsContent);
console.log(`\nSuccessfully generated recipes.js with ${recipes.length} recipes.`);

// 2. Generate Static HTML Pages
const template = fs.readFileSync(templatePath, 'utf-8');

recipes.forEach(recipe => {
    const recipeDir = path.join(__dirname, 'recipes', recipe.id);
    if (!fs.existsSync(recipeDir)) {
        fs.mkdirSync(recipeDir, { recursive: true });
    }

    const { ingredients, instructions } = parseRecipeMarkdown(recipe.content);

    // Render Recipe HTML (Same structure as script.js)
    const recipeHtml = `
        <div class="container">
            <div style="margin-top: 2rem;">
                <a href="../../index.html" style="color: var(--color-text-light); font-weight: 500;">← Back to Recipes</a>
            </div>
            <div class="recipe-header">
                <div class="card-meta" style="justify-content: center;">${recipe.category} • ${recipe.tags}</div>
                <div style="display: flex; align-items: center; justify-content: center; gap: 1rem;">
                    <h1>${recipe.title}</h1>
                    <button id="detail-favorite-btn" 
                            class="favorite-btn detail-view" 
                            data-id="${recipe.id}"
                            onclick="toggleFavorite('${recipe.id}', event)"
                            style="position: static; font-size: 2rem; background: none; border: none; cursor: pointer;">
                        ♡
                    </button>
                </div>
                <div class="recipe-meta-large">
                    <span>Prep: ${recipe.prep_time}</span>
                    <span>Cook: ${recipe.cook_time}</span>
                    <span>Serves: ${recipe.servings}</span>
                </div>
            </div>

            <img src="../../${recipe.image}" alt="${recipe.title}" class="recipe-hero-image">

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

    // Inject into Template
    let html = template;

    // Replace Main Content
    html = html.replace(/<main>[\s\S]*?<\/main>/, `<main>${recipeHtml}</main>`);

    // Fix Relative Paths for CSS/JS/Images
    html = html.replace('href="styles.css"', 'href="../../styles.css"');
    html = html.replace('src="script.js"', 'src="../../script.js"');
    html = html.replace('src="recipes.js"', 'src="../../recipes.js"');
    // Note: Images in recipeHtml are already handled with ../../ prefix above

    // SEO Metadata Injection
    const titleTag = `<title>${recipe.title} | Kaerith's Kitchen</title>`;
    const descTag = `<meta name="description" content="${recipe.description}">`;
    const canonicalTag = `<link rel="canonical" href="https://kaerithskitchen.com/recipes/${recipe.id}/">`;

    html = html.replace(/<title>.*?<\/title>/, titleTag);
    html = html.replace(/<meta name="description".*?>/, descTag);
    html = html.replace(/<link rel="canonical".*?>/, canonicalTag);

    // Open Graph
    html = html.replace(/property="og:title" content=".*?"/, `property="og:title" content="${recipe.title}"`);
    html = html.replace(/property="og:description" content=".*?"/, `property="og:description" content="${recipe.description}"`);
    html = html.replace(/property="og:image" content=".*?"/, `property="og:image" content="https://kaerithskitchen.com/${recipe.image}"`);
    html = html.replace(/property="og:url" content=".*?"/, `property="og:url" content="https://kaerithskitchen.com/recipes/${recipe.id}/"`);

    // Schema.org JSON-LD
    const schema = {
        "@context": "https://schema.org/",
        "@type": "Recipe",
        "name": recipe.title,
        "image": [`https://kaerithskitchen.com/${recipe.image}`],
        "description": recipe.description,
        "keywords": recipe.tags,
        "author": {
            "@type": "Person",
            "name": "Kaerith"
        },
        "datePublished": recipe.datePublished,
        "prepTime": recipe.isoPrepTime,
        "cookTime": recipe.isoCookTime,
        "recipeCategory": recipe.category,
        "recipeYield": recipe.servings,
        "recipeIngredient": recipe.content.match(/- \[ \] (.*)/g)?.map(l => l.replace('- [ ] ', '')) || [],
        "recipeInstructions": [] // Simplified for now, could parse steps
    };

    const schemaScript = `<script type="application/ld+json">\n${JSON.stringify(schema, null, 4)}\n</script>`;
    html = html.replace('</head>', `${schemaScript}\n</head>`);

    fs.writeFileSync(path.join(recipeDir, 'index.html'), html);
    console.log(`Generated HTML: recipes/${recipe.id}/index.html`);
});

// 3. Generate Sitemap.xml
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://kaerithskitchen.com/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>`;

recipes.forEach(recipe => {
    sitemap += `
    <url>
        <loc>https://kaerithskitchen.com/recipes/${recipe.id}/</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`;
});

sitemap += `\n</urlset>`;
fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap);
console.log('Generated sitemap.xml');

// 4. Generate Robots.txt
const robots = `User-agent: *
Allow: /
Sitemap: https://kaerithskitchen.com/sitemap.xml`;
fs.writeFileSync(path.join(__dirname, 'robots.txt'), robots);
console.log('Generated robots.txt');
