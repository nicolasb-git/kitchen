# Kaerith's Kitchen - Static Cooking Blog

A premium, static cooking blog that uses a local build process to generate content. No database or server-side code required.

## Prerequisites

- **Node.js**: You need Node.js installed on your computer to run the build script. [Download Node.js](https://nodejs.org/)

## Project Structure

- `index.html`: The main landing page.
- `styles.css`: Global styles.
- `script.js`: Frontend logic (routing, interactions).
- `build.js`: The build script that generates `recipes.js`.
- `recipes/`: Folder containing your recipe Markdown files.
- `images/`: Folder containing your recipe images.

## How to Add a New Recipe

1.  **Create the Markdown File**:
    - Create a new file in the `recipes/` folder (e.g., `my-new-recipe.md`).
    - Use the following format (Frontmatter + Markdown):

    ```markdown
    ---
    id: my-new-recipe
    title: My Delicious Recipe
    image: images/my-new-recipe.jpg
    prep_time: 15 mins
    cook_time: 30 mins
    servings: 4
    category: Dinner
    tags: Healthy, Quick
    description: A short description that appears on the card.
    ---

    ### Ingredients
    - [ ] 1 cup Flour
    - [ ] 2 Eggs

    ### Instructions
    1. **Step One**
       Mix the ingredients...

    2. **Step Two**
       Cook for 30 minutes...
    ```

    > **Note**: The `id` field must match the filename (without extension) and is used for the URL (e.g., `?recipe=my-new-recipe`).

2.  **Add the Image**:
    - Place your image in the `images/` folder.
    - Ensure the filename matches what you put in the `image` field in the Markdown file.

## How to Build

After adding or editing recipes, you must rebuild the data file.

1.  Open your terminal/command prompt in the project folder.
2.  Run the build command:

    ```bash
    node build.js
    ```

3.  This will generate `recipes.js`, which contains all your recipe data.

## How to Preview

Simply open `index.html` in your web browser. No local server is needed!

## How to Deploy

1.  Run `node build.js` to ensure everything is up to date.
2.  Upload the **entire project folder** (or just the changed files) to your web server via FTP.
3.  That's it!
