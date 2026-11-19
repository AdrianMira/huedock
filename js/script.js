// Global variables
const paletteObj = {
    paletteName: "Palette",
    colors: [
        "#FFFFFF",
        "#FFFFFF",
        "#FFFFFF"
    ]
};

const SAVED_PALETTES = [];

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

// DOM Elements -GENERATOR-

// Generate button & modals
const generateBtn = document.querySelector(".generation-buttons__generate");

const settingsBtn = document.querySelector(".generation-buttons__settings");
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
const editColorCloseBtn = editColorModal.querySelector(".dialog__buttons button")

const savePaletteBtn = document.querySelector(".palette-options__save");
const savePaletteModal = document.querySelector(".save-palette-dialog");
const savePaletteCloseBtn = savePaletteModal.querySelector("button[type=button]");
const savePaletteNameInput = savePaletteModal.querySelector("#palette-name");

// Generate colors
const settingsGenerationMode = settingsModal.querySelector("#generation-mode");

// Palette & color options
const palette = document.querySelector(".palette");
const colorCardList = document.querySelector(".palette__color-list");
const addColorBtn = document.querySelector(".palette__add-color");

const palettePreview = document.querySelector(".palette-preview");

// Color count
const paletteNColors = document.querySelector(".palette-options .number-of-colors");
const savePaletteModalNColors = savePaletteModal.querySelector(".number-of-colors");

// Mode links & Views
const generatorModeLink = document.querySelector("#generator-mode");
const savedPalettesModeLink = document.querySelector("#saved-palettes-mode");

const generatorModeView = document.querySelector(".generator-view");
const savedPalettesModeView = document.querySelector(".saved-palettes-view");

///////////
// DOM Elements -SAVED PALETTES-

// Modals
const deletePaleteModal = document.querySelector(".dialog-delete-palette");
const deletePaleteModalCancelBtn = deletePaleteModal.querySelector(".btn--secondary");
const deletePaleteModalConfirmBtn = deletePaleteModal.querySelector(".btn--danger");
const namePaleteModal = deletePaleteModal.querySelector(".palette-name");

// Palette list
const savedPalettesList = savedPalettesModeView.querySelector(".saved-palettes__list");
const numberPalettes = savedPalettesModeView.querySelector(".number-of-palettes");

///////////

/////////////////////////////////////////

// Initial web state
renderColorCards();
updateDeleteIcons();
renderSavedPalettes();

/////////////////////////////////////////

///////////
// DOM Events -GENERATOR-

// Nav links
generatorModeLink.addEventListener("click", (e) => {
    e.preventDefault();

    if (!generatorModeLink.classList.contains("nav-link--active")) {
        generatorModeLink.classList.add("nav-link--active");
        savedPalettesModeLink.classList.remove("nav-link--active");

        generatorModeView.classList.remove("hidden");
        savedPalettesModeView.classList.add("hidden");
    }
})

savedPalettesModeLink.addEventListener("click", (e) => {
    e.preventDefault();

    if (!savedPalettesModeLink.classList.contains("nav-link--active")) {
        savedPalettesModeLink.classList.add("nav-link--active");
        generatorModeLink.classList.remove("nav-link--active");

        generatorModeView.classList.add("hidden");
        savedPalettesModeView.classList.remove("hidden");
    }
})

// palette generation
generateBtn.addEventListener("click", () => {
    generatePalette();
})

/////////////////////////////////////////

// Modals

// settings modal
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

// save palette modal
savePaletteBtn.addEventListener("click", () => {
    savePaletteModal.showModal();

    // show colors in palette preview
    const palettePreviewColors = savePaletteModal.querySelectorAll(".palette-preview__color");
    const paletteColors = paletteObj.colors;

    palettePreviewColors.forEach((color, id) => {
        color.style.backgroundColor = paletteColors[id];
    })
})

savePaletteCloseBtn.addEventListener("click", () => {
    savePaletteModal.close();
})

// ID count for access to palette. With database this will change.
let idPalette = 0;

savePaletteModal.addEventListener("submit", (e) => {
    e.preventDefault();
    // save palette preview data => paletteObj to Database
    paletteObj.paletteName = savePaletteNameInput.value;

    const newPalette = {
        idPalette,
        paletteName: paletteObj.paletteName,
        colors: [...paletteObj.colors]
    };

    SAVED_PALETTES.push(newPalette);
    idPalette = idPalette + 1;

    savePaletteModal.close();
    savePaletteNameInput.value = "";

    console.log(SAVED_PALETTES);
    renderSavedPalettes();
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

                // update palette preview too
                let palettePreviewColors = (savePaletteModal.querySelectorAll(".palette-preview__color"));
                palettePreviewColors[0].remove(); // remove 1 color. Preview updates when use save palette BTN

                // update number colors text
                paletteNColors.textContent = palettePreviewColors.length - 1;
                savePaletteModalNColors.textContent = palettePreviewColors.length - 1;

                addColorBtn.classList.remove("hidden");
                updateDeleteIcons();
            }
        }
    }

    // Lock color
    const lockBtn = e.target.closest(".color-card__lock");

    if (lockBtn) {
        const colorCard = lockBtn.closest(".color-card");
        colorCard.classList.toggle("locked");

        const lockIcon = lockBtn.querySelector("img");

        if (colorCard.classList.contains("locked")) {
            lockIcon.src = "assets/icons/lock.svg";
            lockBtn.setAttribute("aria-label", "Unlock color");
        } else {
            lockIcon.src = "assets/icons/lock-open.svg";
            lockBtn.setAttribute("aria-label", "Lock color");
        }

        updateDeleteIcons();
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
        createColorCard();
        updatePalette();

        // update number colors text
        paletteNColors.textContent = paletteColorCards.length + 1;
        savePaletteModalNColors.textContent = paletteColorCards.length + 1;

        // update delete img
        updateDeleteIcons();
    }

    if (paletteColorCards.length === MAX_COLOR_CARDS - 1) {
        addColorBtn.classList.add("hidden");
    }
});

/////////////////////////////////////////
///////////
// DOM Events -SAVED PALETTES-

savedPalettesList.addEventListener("click", (e) => {
    // Load palette --> GENERATOR
    const paletteLoadBtn = e.target.closest(".saved-palette__buttons .btn--primary");

    if (paletteLoadBtn) {

        // Get saved palette by ID
        const paletteCardLoaded = paletteLoadBtn.closest(".saved-palette");
        const paletteId = Number(paletteCardLoaded.dataset.id);

        const paletteLoaded = SAVED_PALETTES.find((palette) => {
            return palette.idPalette === paletteId;
        });

        if (paletteLoaded) {

            // Update Generator state
            paletteObj.paletteName = paletteLoaded.paletteName;
            paletteObj.colors = [...paletteLoaded.colors];

            // Clear previous cards and preview
            colorCardList.innerHTML = "";
            palettePreview.innerHTML = "";

            // Create cards and render
            for (const color of paletteObj.colors) {
                createColorCard();
            }
            renderColorCards();

            // Update counters
            paletteNColors.textContent = paletteObj.colors.length;
            savePaletteModalNColors.textContent = paletteObj.colors.length;

            // Update delete icons
            updateDeleteIcons();

            // Show or hide Add Color
            if (paletteObj.colors.length >= MAX_COLOR_CARDS) {
                addColorBtn.classList.add("hidden");
            } else {
                addColorBtn.classList.remove("hidden");
            }

            // Switch to Generator
            savedPalettesModeLink.classList.remove("nav-link--active");
            generatorModeLink.classList.add("nav-link--active");

            generatorModeView.classList.remove("hidden");
            savedPalettesModeView.classList.add("hidden");
        }
    }

    // Delete palette --> Delete state too
    const paletteDeleteBtn = e.target.closest(".saved-palette__buttons .btn--danger");

    if (paletteDeleteBtn) {
        deletePaleteModal.showModal();

        const paletteCardLoaded = paletteDeleteBtn.closest(".saved-palette");
        const paletteName = paletteCardLoaded.querySelector("h3");
        namePaleteModal.textContent = paletteName.textContent;

        deletePaleteModal.dataset.idDelete = paletteCardLoaded.dataset.id;
    }
})

deletePaleteModalCancelBtn.addEventListener("click", () => {
    deletePaleteModal.close();
})

deletePaleteModalConfirmBtn.addEventListener("click", () => {
    // Borrar estado

    const paletteDeletedIndex = SAVED_PALETTES.findIndex((palette) => {
        return palette.idPalette === Number(deletePaleteModal.dataset.idDelete);
    });

    if (paletteDeletedIndex !== -1) {
        SAVED_PALETTES.splice(paletteDeletedIndex, 1);
        renderSavedPalettes();
    }

    deletePaleteModal.close();
})

/////////////////////////////////////////

// Create color card
function createColorCard() {
    // create
    const colorCard = document.createElement("div");
    const colorCardWrapper = document.createElement("div");
    const colorCardCode = document.createElement("p");

    const colorCardLockBtn = document.createElement("button");
    const colorCardLockIcon = document.createElement("img");

    const colorCardEditBtn = document.createElement("button");
    const colorCardEditIcon = document.createElement("img");

    const colorCardDeleteBtn = document.createElement("button");
    const colorCardDeleteIcon = document.createElement("img");

    // update values
    colorCard.classList.add("color-card");
    colorCardWrapper.classList.add("wrapper", "flex");
    colorCardCode.classList.add("color-card__code");

    colorCardLockBtn.classList.add("btn", "btn--color-action", "color-card__lock");
    colorCardLockBtn.ariaLabel = "block";
    colorCardLockIcon.classList.add("btn__icon");
    colorCardLockIcon.src = "assets/icons/lock-open.svg";

    colorCardEditBtn.classList.add("btn", "btn--color-action", "color-card__edit");
    colorCardEditBtn.ariaLabel = "edit";
    colorCardEditIcon.classList.add("btn__icon");
    colorCardEditIcon.src = "assets/icons/pencil-sparkles.svg"

    colorCardDeleteBtn.classList.add("btn", "btn--color-action", "color-card__delete");
    colorCardDeleteBtn.ariaLabel = "delete";
    colorCardDeleteIcon.classList.add("btn__icon");
    colorCardDeleteIcon.src = "assets/icons/trash.svg"

    colorCardLockBtn.type = "button";
    colorCardEditBtn.type = "button";
    colorCardDeleteBtn.type = "button";

    colorCard.style.backgroundColor = "#FFFFFF";
    colorCardCode.textContent = "#FFFFFF";

    // append
    colorCardWrapper.append(
        colorCardCode,
        colorCardLockBtn,
        colorCardEditBtn,
        colorCardDeleteBtn
    );

    colorCardLockBtn.append(colorCardLockIcon);
    colorCardEditBtn.append(colorCardEditIcon);
    colorCardDeleteBtn.append(colorCardDeleteIcon);

    colorCard.append(colorCardWrapper);
    colorCardList.append(colorCard);

    // create color for preview palette:
    const previewColor = document.createElement("div");
    previewColor.classList.add("palette-preview__color");
    previewColor.style.backgroundColor = "#FFFFFF"

    palettePreview.append(previewColor);
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

// Update Palette
function updatePalette() {
    const paletteColorCards = palette.querySelectorAll(".color-card");

    paletteObj.colors = [];

    for (const colorCard of paletteColorCards) {
        const color = colorCard.style.backgroundColor || "#FFFFFF";

        paletteObj.colors.push(color);
    }

    // console.log("Palette updated:", paletteObj);
}

/////////////////////////////////////////

// Render Saved Palettes

// Render Saved Palettes
function renderSavedPalettes() {
    savedPalettesList.innerHTML = "";

    numberPalettes.textContent = SAVED_PALETTES.length;

    if (SAVED_PALETTES.length === 0) {
        const emptyMessageDiv = document.createElement("div");
        emptyMessageDiv.classList.add("empty-message");

        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "No saved palettes yet...";

        emptyMessageDiv.append(emptyMessage);
        savedPalettesList.append(emptyMessageDiv);
        return;
    }

    for (const palette of SAVED_PALETTES) {

        // Create elements
        const savedPalette = document.createElement("article");
        const savedPaletteWrapper = document.createElement("div");

        const savedPaletteInfo = document.createElement("div");
        const savedPaletteName = document.createElement("h3");
        const savedPaletteNColors = document.createElement("p");
        const savedPaletteNColorsSpan = document.createElement("span");

        const savedPalettePreview = document.createElement("div");

        const savedPaletteButtons = document.createElement("div");
        const savedPaletteLoadBtn = document.createElement("button");
        const savedPaletteLoadIcon = document.createElement("img");
        const savedPaletteDeleteBtn = document.createElement("button");
        const savedPaletteDeleteIcon = document.createElement("img");

        // Classes
        savedPalette.classList.add("saved-palette");
        savedPaletteWrapper.classList.add("wrapper");

        savedPaletteInfo.classList.add("saved-palette__info");
        savedPaletteNColorsSpan.classList.add("saved-palette__number-of-colors");

        savedPalettePreview.classList.add("saved-palette__preview", "flex");

        savedPaletteButtons.classList.add("saved-palette__buttons", "flex");

        savedPaletteLoadBtn.classList.add("btn", "btn--primary");
        savedPaletteLoadIcon.classList.add("btn__icon");

        savedPaletteDeleteBtn.classList.add("btn", "btn--danger");
        savedPaletteDeleteIcon.classList.add("btn__icon");

        // Attributes and values
        savedPalette.dataset.id = palette.idPalette;

        savedPaletteName.textContent = palette.paletteName;
        savedPaletteNColorsSpan.textContent = palette.colors.length;

        savedPaletteLoadBtn.type = "button";
        savedPaletteLoadIcon.src = "assets/icons/move-up-right.svg";
        savedPaletteLoadIcon.alt = "";

        savedPaletteDeleteBtn.type = "button";
        savedPaletteDeleteBtn.setAttribute("aria-label", "Delete palette");
        savedPaletteDeleteIcon.src = "assets/icons/trash.svg";
        savedPaletteDeleteIcon.alt = "";

        // Create color preview
        for (const color of palette.colors) {
            const savedPaletteColor = document.createElement("div");

            savedPaletteColor.classList.add("saved-palette__color");
            savedPaletteColor.style.backgroundColor = color;

            savedPalettePreview.append(savedPaletteColor);
        }

        // Append info
        savedPaletteNColors.append(savedPaletteNColorsSpan, " colors");
        savedPaletteInfo.append(savedPaletteName, savedPaletteNColors);

        // Append buttons
        savedPaletteLoadBtn.append(savedPaletteLoadIcon, "Load");
        savedPaletteDeleteBtn.append(savedPaletteDeleteIcon);

        savedPaletteButtons.append(
            savedPaletteLoadBtn,
            savedPaletteDeleteBtn
        );

        // Append card content
        savedPaletteWrapper.append(
            savedPaletteInfo,
            savedPalettePreview,
            savedPaletteButtons
        );

        savedPalette.append(savedPaletteWrapper);

        // Insert into DOM
        savedPalettesList.append(savedPalette);
    }
    numberPalettes.textContent = SAVED_PALETTES.length;
}

/////////////////////////////////////////

// Setting modals
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

// Update color cards icons
function updateDeleteIcons() {
    const cards = colorCardList.querySelectorAll(".color-card");
    const isMinimum = cards.length <= MIN_COLOR_CARDS;

    for (const card of cards) {
        const deleteIcon = card.querySelector(".color-card__delete img");
        const isLocked = card.classList.contains("locked");

        if (isMinimum || isLocked) {
            deleteIcon.src = "assets/icons/trash-off.svg";
        } else {
            deleteIcon.src = "assets/icons/trash.svg";
        }
    }
}
