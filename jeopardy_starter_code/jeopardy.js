// You only need to touch comments with the todo of this file to complete the assignment!

/*
=== How to build on top of the starter code? ===

Problems have multiple solutions.
We have created a structure to help you on solving this problem.
On top of the structure, we created a flow shaped via the below functions.
We left descriptions, hints, and to-do sections in between.
If you want to use this code, fill in the to-do sections.
However, if you're going to solve this problem yourself in different ways, you can ignore this starter code.
 */

/*
=== Terminology for the API ===

Clue: The name given to the structure that contains the question and the answer together.
Category: The name given to the structure containing clues on the same topic.
 */

/*
=== Data Structure of Request the API Endpoints ===

/categories:
[
  {
    "id": <category ID>,
    "title": <category name>,
    "clues_count": <number of clues in the category where each clue has a question, an answer, and a value>
  },
  ... more categories
]

/category:
{
  "id": <category ID>,
  "title": <category name>,
  "clues_count": <number of clues in the category>,
  "clues": [
    {
      "id": <clue ID>,
      "answer": <answer to the question>,
      "question": <question>,
      "value": <value of the question (be careful not all questions have values) (Hint: you can assign your own value such as 200 or skip)>,
      ... more properties
    },
    ... more clues
  ]
}
 */

const API_URL = "https://rithm-jeopardy.herokuapp.com/api/"; // The URL of the API.
const NUMBER_OF_CATEGORIES = 6; // The number of categories you will be fetching. You can change this number.
const NUMBER_OF_CLUES_PER_CATEGORY = 5; // The number of clues you will be displaying per category. You can change this number.

let categories = []; // The categories with clues fetched from the API.
/*
[
  {
    "id": <category ID>,
    "title": <category name>,
    "clues": [
      {
        "id": <clue ID>,
        "value": <value (e.g. $200)>,
        "question": <question>,
        "answer": <answer>
      },
      ... more categories
    ]
  },
  ... more categories
]
 */

let activeClue = null; // Currently selected clue data.
let activeClueMode = 0; // Controls the flow of #active-clue element while selecting a clue, displaying the question of selected clue, and displaying the answer to the question.
/*
0: Empty. Waiting to be filled. If a clue is clicked, it shows the question (transits to 1).
1: Showing a question. If the question is clicked, it shows the answer (transits to 2).
2: Showing an answer. If the answer is clicked, it empties (transits back to 0).
 */

let isPlayButtonClickable = true; // Only clickable when the game haven't started yet or ended. Prevents the button to be clicked during the game.

$("#play").on("click", handleClickOfPlay);

/**
 * Manages the behavior of the play button (start or restart) when clicked.
 * Sets up the game.
 *
 * Hints:
 * - Sets up the game when the play button is clickable.
 */
function handleClickOfPlay() {

  // todo set the game up if the play button is clickable
  // Check if button is clickable (prevents multiple game starts)
  if (isPlayButtonClickable) {
    isPlayButtonClickable = false; // Disable button during game
    setupTheGame(); // Start the game
  }
}

/**
 * Sets up the game.
 *
 * 1. Cleans the game since the user can be restarting the game.
 * 2. Get category IDs
 * 3. For each category ID, get the category with clues.
 * 4. Fill the HTML table with the game data.
 *
 * Hints:
 * - The game play is managed via events.
 */
async function setupTheGame() {
  // todo show the spinner while setting up the game
  // Show loading spinner while fetching data
  document.getElementById("spinner").classList.remove("disabled");

  // todo reset the DOM (table, button text, the end text)
  // Clear all game data from previous games
  categories = []; // Empty the categories array
  activeClue = null; // No active clue selected
  activeClueMode = 0; // Reset mode to empty
  $("#active-clue").html(""); // Clear question/answer display
  $("#categories").empty(); // Remove category headers
  $("tbody").empty(); // Remove all clue tiles
  $("#play").text("Game in progress..."); // Update button text

  try {
    // todo fetch the game data (categories with clues)
    // Get 6 random category IDs from the API
    const ids = await getCategoryIds();
    console.log("Got category IDs:", ids);
    
    // Fetch data for each category
    for (let id of ids) {
      const cat = await getCategoryData(id);
      // Only add categories that have valid clues
      if (cat && cat.clues && cat.clues.length > 0) {
        categories.push(cat);
      }
    }
    
    console.log("Categories loaded:", categories);
    
    // todo fill the table
    // Build the game board with all categories and clues
    fillTable(categories);
  } catch (err) {
    console.error("Error loading game:", err);
    alert("Error loading game. Check console.");
    isPlayButtonClickable = true;
    $("#play").text("Start the Game!");
  } finally {
    // hide the spinner
    document.getElementById("spinner").classList.add("disabled");
  }
}

/**
 * Gets as many category IDs as in the `NUMBER_OF_CATEGORIES` constant.
 * Returns an array of numbers where each number is a category ID.
 *
 * Hints:
 * - Use /categories endpoint of the API.
 * - Request as many categories as possible, such as 100. Randomly pick as many categories as given in the `NUMBER_OF_CATEGORIES` constant, if the number of clues in the category is enough (<= `NUMBER_OF_CLUES` constant).
 */
async function getCategoryIds() {
  const ids = []; // todo set after fetching
// Had Sort clues by value but it ran into a column problem, so commented now
//"" validClues.sort((a, b) => a.value - b.value);""
  //Now its a loop index instead for consitency
// todo fetch NUMBER_OF_CATEGORIES amount of categories
  // Fetch 100 categories from the API
  const response = await fetch(`${API_URL}categories?count=100`);
  const allCategories = await response.json();
  
  // filter categories that have enough clues
  // Only keep categories with at least 5 clues
  const goodCategories = allCategories.filter(c => c.clues_count >= NUMBER_OF_CLUES_PER_CATEGORY);
  
  // shuffle and pick the first NUMBER_OF_CATEGORIES
  // Randomly shuffle and pick 6 categories
  const chosen = _.shuffle(goodCategories).slice(0, NUMBER_OF_CATEGORIES);
  
  // Extract just the IDs from the chosen categories
  for (let c of chosen) {
    ids.push(c.id);
  }

  return ids;
}

/**
 * Gets category with as many clues as given in the `NUMBER_OF_CLUES` constant.
 * Returns the below data structure:
 *  {
 *    "id": <category ID>
 *    "title": <category name>
 *    "clues": [
 *      {
 *        "id": <clue ID>,
 *        "value": <value of the question>,
 *        "question": <question>,
 *        "answer": <answer to the question>
 *      },
 *      ... more clues
 *    ]
 *  }
 *
 * Hints:
 * - You need to call this function for each category ID returned from the `getCategoryIds` function.
 * - Use /category endpoint of the API.
 * - In the API, not all clues have a value. You can assign your own value or skip that clue.
 */
async function getCategoryData(categoryId) {
  const categoryWithClues = {
    id: categoryId,
    title: undefined, // todo set after fetching
    clues: [] // todo set after fetching
  };

  // todo fetch the category with NUMBER_OF_CLUES_PER_CATEGORY amount of clues
  // Fetch full category data from the API
  const response = await fetch(`${API_URL}category?id=${categoryId}`);
  const data = await response.json();
  
  // Set the category title
  categoryWithClues.title = data.title;
  
  // filter clues that have question and answer
  // Only keep clues that have both a question and answer
  let validClues = data.clues.filter(cl => cl.question && cl.answer);
  
  // shuffle and take the number we need
  // Randomly pick 5 clues from the valid ones
  validClues = _.shuffle(validClues).slice(0, NUMBER_OF_CLUES_PER_CATEGORY);
  
  // assign consistent values ($200, $400, $600, $800, $1000)
  // Create clue objects with assigned dollar values
  for (let i = 0; i < validClues.length; i++) {
    const cl = validClues[i];
    categoryWithClues.clues.push({
      id: cl.id,
      value: (i + 1) * 200, // $200, $400, $600, $800, $1000
      question: cl.question,
      answer: cl.answer
    });
  }

  return categoryWithClues;
}

/**
 * Fills the HTML table using category data.
 *
 * Hints:
 * - You need to call this function using an array of categories where each element comes from the `getCategoryData` function.
 * - Table head (thead) has a row (#categories).
 *   For each category, you should create a cell element (th) and append that to it.
 * - Table body (tbody) has a row (#clues).
 *   For each category, you should create a cell element (td) and append that to it.
 *   Besides, for each clue in a category, you should create a row element (tr) and append it to the corresponding previously created and appended cell element (td).
 * - To this row elements (tr) should add an event listener (handled by the `handleClickOfClue` function) and set their IDs with category and clue IDs. This will enable you to detect which clue is clicked.
 */
function fillTable(categoriesData) {
  // clear existing table content
  // Remove any previous game data from the table
  $("#categories").empty();
  $("tbody").empty();
  
  console.log("Filling table with", categoriesData.length, "categories");
  
  // add category headers
  // Create header row with category names
  for (let cat of categoriesData) {
    const th = $("<th>").text(cat.title);
    $("#categories").append(th);
  }
  
  // create rows for each clue level (0-4 for 5 clues per category)
  // Build 5 rows, one for each dollar value
  for (let clueIndex = 0; clueIndex < NUMBER_OF_CLUES_PER_CATEGORY; clueIndex++) {
    const row = $("<tr>"); // Create a new row
    
    // add one clue from each category to this row
    // Each row has 6 clues (one from each category)
    for (let cat of categoriesData) {
      const clue = cat.clues[clueIndex]; // Get clue at this index
      const td = $("<td>"); // Create table cell
      
      if (clue) {
        // Create clickable clue div with dollar amount
        const clueDiv = $("<div>")
          .addClass("clue")
          .attr("data-cat-id", cat.id) // Store category ID
          .attr("data-clue-id", clue.id) // Store clue ID
          .text(`$${clue.value}`); // Display dollar value
        td.append(clueDiv);
      }
      
      row.append(td); // Add cell to row
    }
    
    $("tbody").append(row); // Add row to table
  }
}
// Use event delegation for dynamically created clues
$("tbody").on("click", ".clue", handleClickOfClue);

/**
 * Manages the behavior when a clue is clicked.
 * Displays the question if there is no active question.
 *
 * Hints:
 * - Control the behavior using the `activeClueMode` variable.
 * - Identify the category and clue IDs using the clicked element's ID.
 * - Remove the clicked clue from categories since each clue should be clickable only once. Don't forget to remove the category if all the clues are removed.
 * - Don't forget to update the `activeClueMode` variable.
 *
 */
function handleClickOfClue(event) {
  // todo find and remove the clue from the categories
  const $clue = $(event.target); // Get the clicked element
  
  // don't allow clicking already viewed clues
  // Exit if this clue was already clicked
  if ($clue.hasClass("viewed")) return;
  
  // Get the category and clue IDs from the data attributes
  const catId = Number($clue.attr("data-cat-id"));
  const clueId = Number($clue.attr("data-clue-id"));
  
  console.log("Clue clicked - Cat ID:", catId, "Clue ID:", clueId);
  
  // find the category and clue
  // Find which category this clue belongs to
  const catIndex = categories.findIndex(c => c.id === catId);
  if (catIndex === -1) return; // Category not found
  
  // Find the specific clue within that category
  const clueIndex = categories[catIndex].clues.findIndex(cl => cl.id === clueId);
  if (clueIndex === -1) return; // Clue not found
  
  // remove the clue from categories
  // Remove and store the clue (so it can't be clicked again)
  activeClue = categories[catIndex].clues.splice(clueIndex, 1)[0];
  
  // remove category if no clues left
  // Clean up empty categories
  if (categories[catIndex].clues.length === 0) {
    categories.splice(catIndex, 1);
  }

  // mark clue as viewed (class used in style.css), display the question at #active-clue
  // Mark clue as used (makes it invisible)
  $clue.addClass("viewed");
  $clue.text(""); // Clear the dollar amount
  
  // Set mode to showing question and display it
  activeClueMode = 1;
  $("#active-clue").html(activeClue.question);
  console.log("Showing question:", activeClue.question);
}

$("#active-clue").on("click", handleClickOfActiveClue);

/**
 * Manages the behavior when a displayed question or answer is clicked.
 * Displays the answer if currently displaying a question.
 * Clears if currently displaying an answer.
 *
 * Hints:
 * - Control the behavior using the `activeClueMode` variable.
 * - After clearing, check the categories array to see if it is empty to decide to end the game.
 * - Don't forget to update the `activeClueMode` variable.
 */
function handleClickOfActiveClue(event) {
  // display answer if displaying a question
  console.log("Active clue clicked - Mode:", activeClueMode);
  
  // If showing a question, switch to showing the answer
  if (activeClueMode === 1) {
    activeClueMode = 2; // Change mode to showing answer
    $("#active-clue").html(activeClue.answer); // Display the answer
    console.log("Showing answer:", activeClue.answer);
  }
  // clear if displaying an answer
  // after clear end the game when no clues are left
  // If showing an answer, clear it
  else if (activeClueMode === 2) {
    activeClueMode = 0; // Reset to empty mode
    activeClue = null; // Clear active clue

    // check if any clues remain
    // Check if all clues have been used
    const anyCluesLeft = categories.some(c => c.clues && c.clues.length > 0);
    
    // If no clues left, end the game
    if (!anyCluesLeft) {
      isPlayButtonClickable = true; // Allow restart
      $("#play").text("Restart the Game!"); // Update button
      $("#active-clue").html("The End!"); // Show game over message
    } else {
      $("#active-clue").html(""); // Clear the display if game continues
    }
  }
}
//Sources Used:
//- Google and some use of AI(To make sure nothing is missing) for implementation guidance and debugging
//- jQuery documentation for DOM manipulation
//- Lodash library for array shuffling