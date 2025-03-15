let diceURL = "";
let dices = [];
let modifiers = [];
const display = document.getElementById("roll-display");
const negativeToggle = document.getElementById("negativeToggle");
const modifierButtons = document.querySelectorAll(".modifier-btn");
const throwName = document.getElementById("throw-name");

// Function to refresh the display
function refreshDisplay() {
    display.textContent = generateURL();
}

function initialize() {
    console.log("Checking previous info...");
    let playerThrows = localStorage.getItem("playerThrows");
    if (playerThrows) {
        // Parse the stored data to an object
        playerThrows = JSON.parse(playerThrows);
        console.log(playerThrows);

        // Loop over the object keys and create buttons
        for (let i = 0; i < Object.keys(playerThrows).length; i++) {
            let throwName = Object.keys(playerThrows)[i];
            let throwURL = playerThrows[throwName];
            createButton("custom", throwName, throwURL);
        }
    }
}

initialize();

function createButton(containerId, buttonText, url) {
    // Create the button element for the saved throw
    const button = document.createElement("button");

    // Add Tailwind styling
    button.classList.add(
        "bg-purple-500",
        "hover:bg-purple-600",
        "text-white",
        "font-bold",
        "py-3",
        "px-6",
        "rounded",
        "text-lg",
        "cursor-pointer",
        "md:text-xl"
    );

    // Set the button's text content
    button.textContent = buttonText;

    // Create the tooltip element
    const tooltip = document.createElement("div");
    tooltip.id = `tooltip-${buttonText}`;
    tooltip.setAttribute("role", "tooltip");
    tooltip.classList.add(
        "absolute",
        "z-10",
        "invisible",
        "inline-block",
        "px-3",
        "py-2",
        "text-sm",
        "font-medium",
        "text-white",
        "bg-gray-900",
        "rounded-lg",
        "shadow-xs",
        "opacity-0",
        "tooltip",
        "dark:bg-gray-700"
    );
    tooltip.textContent = `${url}`;
    
    // Create tooltip arrow
    const tooltipArrow = document.createElement("div");
    tooltipArrow.classList.add("tooltip-arrow");
    tooltip.appendChild(tooltipArrow);

    // Set data attributes for the button (targeting the tooltip)
    button.setAttribute("data-tooltip-target", `tooltip-${buttonText}`);
    button.setAttribute("data-tooltip-placement", "top");

    // Add the button click event
    button.addEventListener("click", function() {
        diceURL = url;
        display.textContent = url;
    });

    // Create delete button
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add(
        "bg-red-500",
        "hover:bg-red-600",
        "text-white",
        "font-bold",
        "py-1",
        "px-3",
        "rounded",
        "ml-2",
        "text-sm",
        "cursor-pointer"
    );
    
    // Add delete button click event
    deleteButton.addEventListener("click", function() {
        // Remove the throw from localStorage
        let playerdata = JSON.parse(localStorage.getItem('playerThrows')) || {};
        delete playerdata[buttonText];
        localStorage.setItem('playerThrows', JSON.stringify(playerdata));

        // Remove the button and tooltip from the DOM
        button.remove();
        tooltip.remove();
        deleteButton.remove();
        console.log(`Deleted throw: ${buttonText}`);
    });

    // Append the button, delete button, and tooltip to the container
    const container = document.getElementById(containerId);
    if (container) {
        container.appendChild(button);
        container.appendChild(deleteButton);
        container.appendChild(tooltip);  // Append the tooltip
    } else {
        console.error("Container not found!");
    }

    // Add hover effect for the tooltip to show/hide it
    button.addEventListener("mouseenter", function() {
        tooltip.classList.remove("invisible", "opacity-0");
        tooltip.classList.add("visible", "opacity-100");
    });

    button.addEventListener("mouseleave", function() {
        tooltip.classList.remove("visible", "opacity-100");
        tooltip.classList.add("invisible", "opacity-0");
    });
}

function setDefaultName() {
    throwName.value = generateURL();
}

function saveThrow() {
    // Initialize playerdata if it doesn't exist
    let playerdata = JSON.parse(localStorage.getItem('playerThrows')) || {};

    // Check if a throw name already exists
    if (playerdata[throwName.value] !== undefined) {
        console.log("This throw name already exists!");
    } else {
        // Save the new throw with its name as the key
        playerdata[throwName.value] = generateURL();
        localStorage.setItem('playerThrows', JSON.stringify(playerdata));
        console.log(`Saved throw with name: ${throwName.value}`);

        // Create the button for the saved throw
        createButton("custom", throwName.value, playerdata[throwName.value]);
    }
}

// Function to add a dice to the list
function addDice(number) {
    // Convert dices array to an object to track counts if it's not already
    if (!window.diceCount) {
        window.diceCount = {};
    }
    
    // Initialize or increment the count for this dice
    window.diceCount[`d${number}`] = (window.diceCount[`d${number}`] || 0) + 1;
    
    // Update dices array to reflect the current state
    dices = [];
    for (let [dice, count] of Object.entries(window.diceCount)) {
        if (count > 0) {
            dices.push(count > 1 ? `${count}${dice}` : dice);
        }
    }
    
    console.log(`Added d${number}, total: ${window.diceCount[`d${number}`]}${`d${number}`}`);
    refreshDisplay();
}

// Function to add a modifier
function addModifier(number) {
    let modifier = negativeToggle.checked ? -Math.abs(number) : Math.abs(number);
    modifiers.push(modifier >= 0 ? `+${modifier}` : `${modifier}`);
    refreshDisplay();
}

// Function to generate the dice roll URL
function generateURL() {
    diceURL = ""; // Reset before generating new URL
    let first = true;

    for (let i = 0; i < dices.length; i++) {
        if (first) {
            diceURL += dices[i];
        } else {
            diceURL += "+" + dices[i];
        }
        first = false;
    }
    
    for (let j = 0; j < modifiers.length; j++) {
        diceURL += modifiers[j]; 
    }

    console.log(diceURL);
    return diceURL;
}

function Roll() {
    window.open("talespire://dice/" + diceURL, "_self");
    diceURL = "";
    display.value = "";
    dices = [];
    modifiers = [];
    window.diceCount = {};
    refreshDisplay();
}

// Function to update the modifier button text based on toggle state
function updateModifierButtons() {
    modifierButtons.forEach((button, index) => {
        let value = index + 1; // Button values range from +1 to +9
        button.textContent = negativeToggle.checked ? `Add -${value}` : `Add +${value}`;
    });
}

// Attach event listener to the toggle switch
negativeToggle.addEventListener("change", updateModifierButtons);
