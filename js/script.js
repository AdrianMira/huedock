
// Global variables
const MIN_COLOR_CARDS = 3;
const MAX_COLOR_CARDS = 5;

const paletteObj = {
    paletteName: "Palette",
    colors: [
        "#FFFFFF",
        "#FFFFFF",
        "#FFFFFF"
    ]
};

/////////////////////////////////////////

// DOM Elements

// Generate button & modal
const generateBtn = document.querySelector(".web-header__generate");
const generateModal = document.querySelector(".generator-dialog");
const formModal = generateModal.querySelector("#generator-form");

// Generate colors
const palette = document.querySelector(".palette");
const generatorOption = generateModal.querySelector("#generation-mode");

// Palette & color options
const addColor = document.querySelector(".palette-options__add-color");

/////////////////////////////////////////

// Initial palette
renderColorCards();

/////////////////////////////////////////

// DOM Events

generateBtn.addEventListener("click", () => {
    generateModal.showModal();
});

formModal.addEventListener("submit", (e) => {
    e.preventDefault();

    generatePalette();
    generateModal.close();
});

palette.addEventListener("click", (e) => {

    // Delete color
    const deleteBtn = e.target.closest(".color-card__delete");

    if (deleteBtn) {
        const colorCard = deleteBtn.closest(".color-card");
        const paletteColorCards = palette.querySelectorAll(".color-card");

        if (paletteColorCards.length > MIN_COLOR_CARDS) {
            colorCard.remove();
            updatePalette();
        }
    }

    // Lock color
    const lockBtn = e.target.closest(".color-card__lock");

    if (lockBtn) {
        const colorCard = lockBtn.closest(".color-card");
        colorCard.classList.toggle("locked");
    }
});

addColor.addEventListener("click", () => {
    const paletteColorCards = palette.querySelectorAll(".color-card");

    if (paletteColorCards.length < MAX_COLOR_CARDS) {
        createColorCard(palette);
        updatePalette();
    }
});

/////////////////////////////////////////

// Create color card

function createColorCard(palette) {
    const colorCard = document.createElement("div");
    const colorCardWrapper = document.createElement("div");
    const colorCardCode = document.createElement("p");
    const colorCardLockBtn = document.createElement("button");
    const colorCardEditBtn = document.createElement("button");
    const colorCardDeleteBtn = document.createElement("button");

    colorCard.classList.add("color-card");
    colorCardWrapper.classList.add("wrapper", "flex");
    colorCardCode.classList.add("color-card__code");

    colorCardLockBtn.classList.add("btn", "color-card__lock");
    colorCardEditBtn.classList.add("btn", "color-card__edit");
    colorCardDeleteBtn.classList.add("btn", "color-card__delete");

    colorCardLockBtn.type = "button";
    colorCardEditBtn.type = "button";
    colorCardDeleteBtn.type = "button";

    colorCard.style.backgroundColor = "#FFFFFF";
    colorCardCode.textContent = "#FFFFFF";

    colorCardLockBtn.textContent = "LOCK";
    colorCardEditBtn.textContent = "EDIT";
    colorCardDeleteBtn.textContent = "DELETE";

    colorCardWrapper.append(
        colorCardCode,
        colorCardLockBtn,
        colorCardEditBtn,
        colorCardDeleteBtn
    );

    colorCard.append(colorCardWrapper);
    palette.append(colorCard);
}

/////////////////////////////////////////

// Palette Generation Algorithm

function generatePalette() {
    const paletteColorCards = palette.querySelectorAll(".color-card");

    for (let i = 0; i < paletteColorCards.length; i++) {
        const colorCard = paletteColorCards[i];

        // Do not change locked colors
        if (colorCard.classList.contains("locked")) {
            continue;
        }

        if (generatorOption.value === "random") {
            paletteObj.colors[i] = generateRandomColor();
        }
    }

    renderColorCards();
}

function generateRandomColor() {
    const red = randomNumberGenerator(0, 255);
    const green = randomNumberGenerator(0, 255);
    const blue = randomNumberGenerator(0, 255);

    return `rgb(${red}, ${green}, ${blue})`;
}

function randomNumberGenerator(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/////////////////////////////////////////

// Render Color Cards

function renderColorCards() {
    const paletteColorCards = palette.querySelectorAll(".color-card");

    for (let i = 0; i < paletteColorCards.length; i++) {
        const colorCard = paletteColorCards[i];
        const colorCode = colorCard.querySelector(".color-card__code");

        const currentColor = paletteObj.colors[i];

        if (currentColor != null) {
            colorCard.style.backgroundColor = currentColor;
            colorCode.textContent = currentColor;
        }
    }
}

/////////////////////////////////////////

// Update Palette

function updatePalette() {
    const paletteColorCards = palette.querySelectorAll(".color-card");

    paletteObj.colors = [];

    for (const colorCard of paletteColorCards) {
        const color = colorCard.style.backgroundColor || "#FFFFFF";

        paletteObj.colors.push(color);
    }

    console.log("Palette updated:", paletteObj);
}
