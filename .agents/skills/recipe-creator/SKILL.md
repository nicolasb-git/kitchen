---
name: recipe-creator
description: Use this skill to create a new recipe markdown file in the `recipes/` directory. It automates the formatting and file creation process.
---

# Recipe Creator Skill

This skill helps you create a new recipe for the cooking blog. It ensures the markdown file follows the required project structure, including the necessary frontmatter and content sections.

## When to Use
- When the user provides a name and content for a new recipe.
- When the user wants to add a recipe to the blog.

## How to Use
1.  **Gather Information**: Ensure you have the recipe name and its content (ingredients and instructions).
2.  **Request Missing Details**: If any of the following are missing, ask the user for them (or suggest defaults):
    - Prep time (e.g., "15 mins")
    - Cook time (e.g., "30 mins")
    - Servings (e.g., "4")
    - Category (e.g., "Dinner", "Dessert", "Breakfast")
    - Tags (e.g., "Healthy", "Quick", "Traditional")
    - Description (a short 1-2 sentence summary)
3.  **Generate ID**: Create a kebab-case `id` from the recipe name (e.g., "Tomato Salad" -> "tomato-salad").
4.  **Format Markdown**:
    - Use the following frontmatter template:
      ```markdown
      ---
      id: [kebab-case-id]
      title: [Recipe Name]
      image: images/[kebab-case-id].jpg
      prep_time: [Prep Time]
      cook_time: [Cook Time]
      servings: [Servings]
      category: [Category]
      tags: [Tags]
      description: [Description]
      ---

      ### Ingredients
      [Ingredients list with - [ ] prefixes]

      ### Instructions
      [Numbered instructions with **Bold Step Titles**]
      ```
5.  **Save File**: Write the content to `recipes/[id].md`.
6.  **Next Steps**: Remind the user to:
    - Add the corresponding image to the `images/` directory.
    - Run `node build.js` to update the blog data and generate the HTML.
