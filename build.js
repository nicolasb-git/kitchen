const fs = require('fs');
const path = require('path');

const recipesDir = path.join(__dirname, 'recipes');
const outputFile = path.join(__dirname, 'recipes.js');

// Ensure recipes directory exists
if (!fs.existsSync(recipesDir)) {
    console.error('Recipes directory not found!');
    process.exit(1);
}

const recipes = [];
const files = fs.readdirSync(recipesDir);

files.forEach(file => {
    if (path.extname(file) === '.md') {
        const content = fs.readFileSync(path.join(recipesDir, file), 'utf-8');

        // Simple Frontmatter Parser
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

            // Add body content
            data.content = body;

            // Ensure ID matches filename if not set
            if (!data.id) {
                data.id = path.basename(file, '.md');
            }

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

            // Enhance data for SEO
            data.isoPrepTime = toISO8601(data.prep_time);
            data.isoCookTime = toISO8601(data.cook_time);
            data.datePublished = new Date().toISOString().split('T')[0]; // Default to today for now, ideally from git

            recipes.push(data);
            console.log(`Processed: ${file}`);
        } else {
            console.warn(`Skipping ${file}: Invalid format`);
        }
    }
});

const jsContent = `window.recipes = ${JSON.stringify(recipes, null, 4)};`;
fs.writeFileSync(outputFile, jsContent);
console.log(`\nSuccessfully generated recipes.js with ${recipes.length} recipes.`);
