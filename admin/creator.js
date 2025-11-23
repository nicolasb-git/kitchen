document.addEventListener('DOMContentLoaded', () => {
    // Set default date
    const today = new Date().toISOString().split('T')[0];

    // Initialize dynamic lists
    setupDynamicList('ingredients-list', 'ingredient-template');
    setupDynamicList('instructions-list', 'instruction-template');

    // Auto-generate ID from title
    const titleInput = document.getElementById('title');
    const idInput = document.getElementById('id');

    titleInput.addEventListener('input', () => {
        const slug = titleInput.value
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
        idInput.value = slug;
        generateMarkdown();
    });

    // Add event listeners to all inputs for real-time preview
    document.querySelectorAll('input, textarea, select').forEach(input => {
        input.addEventListener('input', generateMarkdown);
    });

    // Copy and Download buttons
    document.getElementById('btn-copy').addEventListener('click', copyToClipboard);
    document.getElementById('btn-download').addEventListener('click', downloadMarkdown);
});

function setupDynamicList(listId, templateId) {
    const list = document.getElementById(listId);
    const addBtn = document.getElementById(`btn-add-${listId.split('-')[0]}`);

    addBtn.addEventListener('click', () => {
        const item = document.createElement('div');
        item.className = 'dynamic-item';
        item.innerHTML = `
            <input type="text" class="form-control" placeholder="Item content">
            <button type="button" class="btn-icon" onclick="this.parentElement.remove(); generateMarkdown()">×</button>
        `;
        list.appendChild(item);

        // Add listener to new input
        item.querySelector('input').addEventListener('input', generateMarkdown);
    });
}

function generateMarkdown() {
    const title = document.getElementById('title').value;
    const id = document.getElementById('id').value;
    const image = document.getElementById('image').value;
    const prepTime = document.getElementById('prep_time').value;
    const cookTime = document.getElementById('cook_time').value;
    const servings = document.getElementById('servings').value;
    const category = document.getElementById('category').value;
    const tags = document.getElementById('tags').value;
    const description = document.getElementById('description').value;

    // Collect Ingredients
    const ingredients = Array.from(document.querySelectorAll('#ingredients-list input')).map(input => {
        const val = input.value.trim();
        if (!val) return null;
        // Check if it looks like a header (ends with :)
        if (val.endsWith(':')) return `\n#### ${val}`;
        return `- [ ] ${val}`;
    }).filter(Boolean).join('\n');

    // Collect Instructions
    const instructions = Array.from(document.querySelectorAll('#instructions-list input')).map((input, index) => {
        const val = input.value.trim();
        if (!val) return null;
        // Simple formatting: Bold the first part if it looks like a title
        // This is a basic heuristic, user can edit later
        return `${index + 1}. ${val}`;
    }).filter(Boolean).join('\n\n');

    const markdown = `---
id: ${id}
title: ${title}
image: ${image || 'images/placeholder.jpg'}
prep_time: ${prepTime}
cook_time: ${cookTime}
servings: ${servings}
category: ${category}
tags: ${tags}
description: ${description}
---

### Ingredients
${ingredients}

---

### Instructions

${instructions}
`;

    document.getElementById('markdownOutput').value = markdown;
}

function copyToClipboard() {
    const output = document.getElementById('markdownOutput');
    output.select();
    document.execCommand('copy');
    alert('Markdown copied to clipboard!');
}

function downloadMarkdown() {
    const content = document.getElementById('markdownOutput').value;
    const filename = (document.getElementById('id').value || 'recipe') + '.md';

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
