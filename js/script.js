
// Global variables
const paletteObj = {
    paletteName: "Palette",
    colors: [
        "#FFFFFF",
        "#FFFFFF",
        "#FFFFFF"
    ]
};

// Settings
const settingsObj = {
    generationModes: {
        random: generateRandomPalette,
        harmonious: generateHarmoniousPalette
    },
    modeDescriptions: {
        random: "Creates palette with random colors",
        harmonious: "Fill palette with white colors"
    },
    actualMode: "random",
    referenceColor: null,
    useReferenceColor: false,
    referenceColorDescriptions: [
        [true, "The palette will be generated using this color as a reference."],
        [false, "A reference color will be chosen automatically."]
    ]
}

// random color
const MIN_COLOR_CARDS = 3;
const MAX_COLOR_CARDS = 5;

// edit color
let editingColorCard = null;

/////////////////////////////////////////

// DOM Elements

// Generate button & modals
const generateBtn = document.querySelector(".web-header__generate");

const settingsBtn = document.querySelector(".web-header__settings");
const settingsModal = document.querySelector(".settings-dialog");
const settingsForm = settingsModal.querySelector("#settings-dialog__form");
const settingsModeDescription = settingsModal.querySelector(".generation-mode__description");
const settingsColorCheckBox = settingsModal.querySelector("#reference-color-checkbox");
const settingsColorInput = settingsModal.querySelector("#reference-color");
const settingsColorCodeInput = settingsModal.querySelector("#reference-color-code");
const settingsColorDescription = settingsModal.querySelector(".reference-color-description");
const settingsCloseBtn = settingsModal.querySelector("button[type=button]");

const editColorModal = document.querySelector(".edit-color-dialog");
const editColorCodeInput = editColorModal.querySelector("#actual-color__code");
const editActualColorInput = editColorModal.querySelector(".actual-color");
const editColorCloseBtn = editColorModal.querySelector(".edit-color-dialog__buttons button")

// Generate colors
const settingsGenerationMode = settingsModal.querySelector("#generation-mode");

// Palette & color options
const palette = document.querySelector(".palette");
const colorCardList = document.querySelector(".palette__color-list");
const addColorBtn = document.querySelector(".palette__add-color");

/////////////////////////////////////////

// Initial palette
renderColorCards();

/////////////////////////////////////////

// DOM Events

// palette generation
generateBtn.addEventListener("click", () => {
    generatePalette();
})

/////////////////////////////////////////
// Settings modal
function updateReferenceControls() {
    const isRandom = settingsGenerationMode.value === "random";
    const useReferenceColor = settingsColorCheckBox.checked;

    settingsColorCheckBox.disabled = isRandom;

    settingsColorInput.disabled = isRandom || !useReferenceColor;
    settingsColorCodeInput.disabled = isRandom || !useReferenceColor;

    if (useReferenceColor && !isRandom) {
        settingsColorDescription.textContent =
            settingsObj.referenceColorDescriptions[0][1];
    } else {
        settingsColorDescription.textContent =
            settingsObj.referenceColorDescriptions[1][1];
    }
}

settingsBtn.addEventListener("click", () => {
    settingsGenerationMode.value = settingsObj.actualMode;

    settingsColorCheckBox.checked = settingsObj.actualMode !== "random" && settingsObj.useReferenceColor;

    const color = settingsObj.referenceColor || "#FFFFFF";
    settingsColorInput.value = color;
    settingsColorCodeInput.value = color;

    settingsModeDescription.textContent = settingsObj.modeDescriptions[settingsObj.actualMode];

    updateReferenceControls();
    settingsModal.showModal();
});

settingsGenerationMode.addEventListener("change", () => {
    settingsModeDescription.textContent =
        settingsObj.modeDescriptions[settingsGenerationMode.value];

    if (settingsGenerationMode.value === "random") {
        settingsColorCheckBox.checked = false;
    }

    updateReferenceControls();
});

settingsColorCheckBox.addEventListener("change", () => {
    updateReferenceControls();
});

settingsColorInput.addEventListener("input", () => {
    settingsColorCodeInput.value = settingsColorInput.value;
});

settingsColorCodeInput.addEventListener("input", () => {
    const color = settingsColorCodeInput.value.trim();
    settingsColorInput.value = color;
});

settingsForm.addEventListener("submit", (e) => {
    e.preventDefault();

    settingsObj.actualMode = settingsGenerationMode.value;
    settingsObj.useReferenceColor = settingsColorCheckBox.checked;
    settingsObj.referenceColor = settingsColorInput.value;

    settingsModal.close();
});

settingsCloseBtn.addEventListener("click", () => {
    settingsModal.close();
});


// edit color modal
editColorCodeInput.addEventListener("input", () => {
    editActualColorInput.style.backgroundColor = editColorCodeInput.value;
});

editColorModal.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!editingColorCard) return;

    const colorCards = [...colorCardList.querySelectorAll(".color-card")];
    const index = colorCards.indexOf(editingColorCard);

    if (index === -1) return;

    paletteObj.colors[index] = editColorCodeInput.value;

    renderColorCards();
    editColorModal.close();
});

editColorCloseBtn.addEventListener("click", () => {
    editColorModal.close();
})

// palette
palette.addEventListener("click", (e) => {

    // Delete color
    const deleteBtn = e.target.closest(".color-card__delete");

    if (deleteBtn) {
        const colorCard = deleteBtn.closest(".color-card");
        const paletteColorCards = palette.querySelectorAll(".color-card");

        if (paletteColorCards.length > MIN_COLOR_CARDS) {
            if (!colorCard.classList.contains("locked")) {
                colorCard.remove();
                updatePalette();

                if (addColorBtn.classList.contains("hidden"))
                    addColorBtn.classList.remove("hidden");
            }
        }
    }

    // Lock color
    const lockBtn = e.target.closest(".color-card__lock");

    if (lockBtn) {
        const colorCard = lockBtn.closest(".color-card");
        colorCard.classList.toggle("locked");
    }

    // Edit color
    const editBtn = e.target.closest(".color-card__edit");

    if (editBtn) {
        editingColorCard = editBtn.closest(".color-card");

        const currentColor = paletteObj.colors[
            [...colorCardList.children].indexOf(editingColorCard)
        ];

        console.log(currentColor)
        editColorCodeInput.value = currentColor;

        const actualColor = editColorModal.querySelector(".actual-color");
        actualColor.style.backgroundColor = currentColor;

        editColorModal.showModal();
    }
});

addColorBtn.addEventListener("click", () => {
    const paletteColorCards = palette.querySelectorAll(".color-card");

    if (paletteColorCards.length < MAX_COLOR_CARDS) {
        createColorCard(palette);
        updatePalette();
    }

    if (paletteColorCards.length === MAX_COLOR_CARDS - 1) {
        addColorBtn.classList.add("hidden");
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
    colorCardList.append(colorCard);
}

/////////////////////////////////////////

// Palette Generation Algorithms
function generatePalette() {
    const generationMode = settingsObj.generationModes[settingsObj.actualMode]
    generationMode();

    renderColorCards();
}

function generateRandomPalette() {
    const paletteColorCards = palette.querySelectorAll(".color-card");

    for (let i = 0; i < paletteColorCards.length; i++) {
        const colorCard = paletteColorCards[i];

        // Do not change locked colors
        if (colorCard.classList.contains("locked")) {
            continue;
        }
        paletteObj.colors[i] = generateRandomColor();
    }
}

function generateHarmoniousPalette() {
    const paletteColorCards = palette.querySelectorAll(".color-card");

    for (let i = 0; i < paletteColorCards.length; i++) {
        const colorCard = paletteColorCards[i];

        // Do not change locked colors
        if (colorCard.classList.contains("locked")) {
            continue;
        }
        paletteObj.colors[i] = "#FFFFFF";
    }
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
