const fs = require('fs');
const path = require('path');

// Test the NEW instruction parsing
function parseRecipeMarkdown(markdown) {
    const lines = markdown.split(/\r?\n/);
    let instructionsHtml = '';
    let currentSection = null;
    let currentStep = null;

    lines.forEach((line, index) => {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('### Instructions')) {
            console.log("Found Instructions Section");
            currentSection = 'instructions';
            return;
        }

        if (currentSection === 'instructions') {
            const stepMatch = trimmedLine.match(/^(\d+)\.\s*\*\*(.*?)\*\*$/);
            if (stepMatch) {
                if (currentStep) {
                    console.log(`Saving step ${currentStep.number}: "${currentStep.title}"`);
                    console.log(`  Body length: ${currentStep.body.trim().length}`);
                }
                currentStep = {
                    number: stepMatch[1],
                    title: stepMatch[2],
                    body: ''
                };
                console.log(`Started step ${currentStep.number}`);
            } else if (currentStep && trimmedLine.length > 0 && !trimmedLine.startsWith('#')) {
                currentStep.body += ' ' + trimmedLine;
                console.log(`  Added to body: "${trimmedLine.substring(0, 50)}..."`);
            }
        }
    });

    if (currentStep) {
        console.log(`Saving final step ${currentStep.number}: "${currentStep.title}"`);
        console.log(`  Body length: ${currentStep.body.trim().length}`);
    }
}

const filePath = path.join(__dirname, 'recipes', 'pasta.md');
try {
    const content = fs.readFileSync(filePath, 'utf8');
    parseRecipeMarkdown(content);
} catch (err) {
    console.error("Error reading file:", err);
}
