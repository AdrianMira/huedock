// Global variables
const paletteObj = {
    paletteName: "Palette",
    colors: [
        "#FFFFFF",
        "#FFFFFF",
        "#FFFFFF"
    ]
};

let savedPalettes = [];

// Settings
const settingsObj = {
    generationModes: {
        random: generateRandomPalette,
        complementary: generateComplementaryPalette,
        analogous: generateAnalogousPalette,
        triadic: generateTriadicPalette,
        monochromatic: generateMonochromaticPalette,
        splitComplementary: generateSplitComplementaryPalette,
        tetradic: generateTetradicPalette
    },
    modeDescriptions: {
        random: "Creates palette with random colors",
        complementary: "Fill palette with complementary colors",
        analogous: "Creates palettes using neighboring colors on the color wheel",
        triadic: "Creates palettes using three colors equally spaced on the color wheel",
        monochromatic: "Creates palettes using variations of a single hue",
        splitComplementary: "Creates palettes using a base hue and two hues near its complement",
        tetradic: "Creates palettes using two pairs of complementary hues"
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

savedPalettesModeLink.addEventListener("click", async (e) => {
    e.preventDefault();

    if (!savedPalettesModeLink.classList.contains("nav-link--active")) {
        savedPalettesModeLink.classList.add("nav-link--active");
        generatorModeLink.classList.remove("nav-link--active");

        generatorModeView.classList.add("hidden");
        savedPalettesModeView.classList.remove("hidden");
    }

    // Fetch --> Show all palettes (GET)
    const url = "/api/palettes";
    const headers = new Headers({ "Content-Type": "application/json" });
    const obj = {
        method: "GET",
        headers
    }
    try {
        const response = await fetch(url, obj);
        if (!response.ok) {
            throw new Error(`HTTP ERROR: ${response.status}`)
        }
        const data = await response.json();
        console.log(data);

        savedPalettes = [...data];
        console.log(savedPalettes);
        renderSavedPalettes();

    } catch (error) {
        console.error("Error finding palettes:", error);
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
// let idPalette = 0;
console.log(paletteObj.colors);
console.log(savedPalettes);

savePaletteModal.addEventListener("submit", async (e) => {
    e.preventDefault();
    // save palette preview data => paletteObj to Database
    paletteObj.paletteName = savePaletteNameInput.value;

    const newPalette = {
        paletteName: paletteObj.paletteName,
        colors: [...paletteObj.colors]
    };

    // fetch -> Send request

    const url = "/api/palettes";
    const headers = new Headers({ "Content-Type": "application/json" });
    const obj = {
        method: "POST",
        headers,
        body: JSON.stringify(newPalette)
    }

    try {
        const response = await fetch(url, obj);
        if (!response.ok) {
            throw new Error(`HTTP ERROR: ${response.status}`)
        }
        const data = await response.json();
        savedPalettes.push(data);

        console.log("Paleta guardada:", data);
        // console.log(SAVED_PALETTES);

        savePaletteModal.close();
        savePaletteNameInput.value = "";

        renderSavedPalettes();

    } catch (error) {
        console.error("Error al guardar la paleta:", error);
        return;
    }

})

// palette
palette.addEventListener("click", (e) => {

    // Delete color
    const deleteBtn = e.target.closest(".color-card__delete");

    if (deleteBtn) {
        const colorCard = deleteBtn.closest(".color-card");
        const paletteColorCards = [...palette.querySelectorAll(".color-card")];

        if (paletteColorCards.length > MIN_COLOR_CARDS) {
            if (!colorCard.classList.contains("locked")) {
                const colorIndex = paletteColorCards.indexOf(colorCard);

                colorCard.remove();
                updatePalette();

                // Update palette preview
                const palettePreviewColors = savePaletteModal.querySelectorAll(".palette-preview__color");
                palettePreviewColors[colorIndex].remove();

                // Update number of colors
                paletteNColors.textContent = paletteColorCards.length - 1;
                savePaletteModalNColors.textContent = paletteColorCards.length - 1;

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

        const paletteLoaded = savedPalettes.find((palette) => {
            return palette.id === paletteId;
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
        console.log(deletePaleteModal.dataset.idDelete);
    }
})

deletePaleteModalCancelBtn.addEventListener("click", () => {
    deletePaleteModal.close();
})

deletePaleteModalConfirmBtn.addEventListener("click", async () => {
    // Fetch --> DELETE palette
    const paletteDeletedIndex = savedPalettes.findIndex((palette) => {
        return palette.id === Number(deletePaleteModal.dataset.idDelete);
    });

    console.log("id", savedPalettes[paletteDeletedIndex]);

    const url = `/api/palettes/${savedPalettes[paletteDeletedIndex].id}`;
    const headers = new Headers({ "Content-Type": "application/json" });
    const obj = {
        method: "DELETE",
        headers
    }

    try {
        const response = await fetch(url, obj);
        if (!response.ok) {
            throw new Error(`HTTP ERROR: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);

        // Borrar estado
        if (paletteDeletedIndex !== -1) {
            savedPalettes.splice(paletteDeletedIndex, 1);
            renderSavedPalettes();
        }
    } catch (error) {
        console.error("Error deleting palette:", error);
    } finally {
        deletePaleteModal.close();
    }

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
    const colorCards = palette.querySelectorAll(".color-card");
    const unlockedIndexes = [];

    // Find unlocked cards
    for (let i = 0; i < colorCards.length; i++) {
        if (!colorCards[i].classList.contains("locked")) {
            unlockedIndexes.push(i);
        }
    }

    if (unlockedIndexes.length === 0) return;

    const generationMode = settingsObj.generationModes[settingsObj.actualMode];

    if (settingsObj.actualMode === "random") {
        generationMode();
    } else {
        // First pass: generate hues
        const hues = generationMode(unlockedIndexes.length);

        // Second pass: apply a visual style
        const colors = applyRandomStyle(hues);

        // Update unlocked colors
        for (let i = 0; i < unlockedIndexes.length; i++) {
            const originalIndex = unlockedIndexes[i];
            paletteObj.colors[originalIndex] = colors[i];
        }
    }

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
        paletteObj.colors[i] = rgbStringToHex(generateRandomColor());
    }
}

function getReferenceHue() {
    if (settingsObj.useReferenceColor) {
        const referenceColor = hexToHsl(settingsObj.referenceColor);
        return referenceColor.h;
    }

    return randomNumberGenerator(0, 359);
}

function generateComplementaryPalette(totalColors) {
    const h = getReferenceHue();
    const hComp = (h + 180) % 360;
    const mainColorsCount = Math.ceil(totalColors / 2);
    const hues = [];

    for (let i = 0; i < totalColors; i++) {
        if (i < mainColorsCount) {
            hues.push(h);
        } else {
            hues.push(hComp);
        }
    }

    return hues;
}

function generateAnalogousPalette(totalColors) {
    const h = getReferenceHue();
    const direction = randomNumberGenerator(0, 1);
    const hues = [];

    for (let i = 0; i < totalColors; i++) {
        let hueOffset = i * 15;

        if (direction === 0) {
            hueOffset = -hueOffset;
        }

        const newHue = (h + hueOffset + 360) % 360;
        hues.push(newHue);
    }

    return hues;
}

function generateTriadicPalette(totalColors) {
    const h = getReferenceHue();
    const hues = [];
    const triadicHues = [h, (h + 120) % 360, (h + 240) % 360];

    for (let i = 0; i < totalColors; i++) {
        const hueIndex = i % 3;
        hues.push(triadicHues[hueIndex]);
    }

    return hues;
}

function generateMonochromaticPalette(totalColors) {
    const h = getReferenceHue();
    const hues = [];

    for (let i = 0; i < totalColors; i++) {
        hues.push(h);
    }

    return hues;
}

function generateSplitComplementaryPalette(totalColors) {
    const h = getReferenceHue();
    const hues = [];
    const splitHues = [h, (h + 150) % 360, (h + 210) % 360];

    for (let i = 0; i < totalColors; i++) {
        const hueIndex = i % 3;
        hues.push(splitHues[hueIndex]);
    }

    return hues;
}

function generateTetradicPalette(totalColors) {
    const h = getReferenceHue();
    const hues = [];
    const tetradicHues = [h, (h + 60) % 360, (h + 180) % 360, (h + 240) % 360];

    for (let i = 0; i < totalColors; i++) {
        const hueIndex = i % 4;
        hues.push(tetradicHues[hueIndex]);
    }

    return hues;
}

function applyRandomStyle(hues) {
    const colors = [];
    const style = randomNumberGenerator(1, 5);
    const mainColorIndex = randomNumberGenerator(0, hues.length - 1);
    const neutralIndexes = [];

    // Choose neutral color positions
    if (style === 5 && hues.length >= 3) {
        let neutralCount = 1;

        if (hues.length >= 4) {
            neutralCount = randomNumberGenerator(1, 2);
        }

        while (neutralIndexes.length < neutralCount) {
            const index = randomNumberGenerator(0, hues.length - 1);

            if (!neutralIndexes.includes(index)) {
                neutralIndexes.push(index);
            }
        }
    }

    // Set lightness range depending on style
    let minLightness = 30;
    let maxLightness = 80;

    if (style === 1) {
        // Pastel
        minLightness = 56;
        maxLightness = 92;
    } else if (style === 2) {
        // Vibrant
        minLightness = 30;
        maxLightness = 75;
    } else if (style === 3) {
        // Dark with light accent
        minLightness = 25;
        maxLightness = 45;
    } else if (style === 4) {
        // Main and secondary
        minLightness = 30;
        maxLightness = 82;
    }

    // Generate different lightness levels
    const lightnessLevels = [];
    let levelsCount = hues.length;

    if (style === 3) {
        levelsCount--;
    }

    for (let i = 0; i < levelsCount; i++) {
        let l;

        if (levelsCount === 1) {
            l = Math.round((minLightness + maxLightness) / 2);
        } else {
            const step = (maxLightness - minLightness) / (levelsCount - 1);
            l = Math.round(minLightness + step * i);
        }

        lightnessLevels.push(l);
    }

    // Add one light color to the dark style
    if (style === 3) {
        lightnessLevels.push(75);
    }

    // Shuffle lightness levels
    for (let i = lightnessLevels.length - 1; i > 0; i--) {
        const randomIndex = randomNumberGenerator(0, i);
        const temporaryValue = lightnessLevels[i];

        lightnessLevels[i] = lightnessLevels[randomIndex];
        lightnessLevels[randomIndex] = temporaryValue;
    }

    // Apply visual style
    for (let i = 0; i < hues.length; i++) {
        const h = hues[i];
        const l = lightnessLevels[i];
        let s;

        if (style === 1) {
            // Pastel
            s = randomNumberGenerator(40, 70);
        } else if (style === 2) {
            // Vibrant
            s = randomNumberGenerator(70, 95);
        } else if (style === 3) {
            // Dark with light accent
            s = randomNumberGenerator(35, 80);
        } else if (style === 4) {
            // Main and secondary
            if (i === mainColorIndex) {
                s = randomNumberGenerator(80, 95);
            } else {
                s = randomNumberGenerator(15, 50);
            }
        } else {
            // Colors with neutrals
            if (neutralIndexes.includes(i)) {
                s = randomNumberGenerator(0, 12);
            } else {
                s = randomNumberGenerator(60, 90);
            }
        }

        colors.push(hslToHex(h, s, l));
    }

    console.log("Visual style:", style);
    return colors;
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

        paletteObj.colors.push(rgbStringToHex(color));
    }

    // console.log("Palette updated:", paletteObj);
}

/////////////////////////////////////////

// Render Saved Palettes

// Render Saved Palettes
function renderSavedPalettes() {
    savedPalettesList.innerHTML = "";

    numberPalettes.textContent = savedPalettes.length;

    if (savedPalettes.length === 0) {
        const emptyMessageDiv = document.createElement("div");
        emptyMessageDiv.classList.add("empty-message");

        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "No saved palettes yet...";

        emptyMessageDiv.append(emptyMessage);
        savedPalettesList.append(emptyMessageDiv);
        return;
    }

    for (const palette of savedPalettes) {

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
        savedPalette.dataset.id = palette.id;

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
    numberPalettes.textContent = savedPalettes.length;
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


////////////////////////////////////
//COLOR CONVERSION

function rgbToHex(r, g, b) {
    let hexCode = "#"
    const hexRed = (r).toString(16).padStart(2, "0");
    const hexGreen = (g).toString(16).padStart(2, "0");
    const hexBlue = (b).toString(16).padStart(2, "0");

    hexCode = hexCode.concat(hexRed, hexGreen, hexBlue);
    return hexCode.toUpperCase();
}

function rgbStringToHex(rgbString) {
    if (rgbString.startsWith("#") && rgbString.length === 7) {
        return rgbString;
    }

    const values = rgbString.replace("rgb(", "").replace(")", "");

    const channels = values.split(",");

    const r = Number(channels[0].trim());
    const g = Number(channels[1].trim());
    const b = Number(channels[2].trim());

    return rgbToHex(r, g, b);
}

function hexToRgb(hex) {
    const normalizedHex = hex.replace("#", "");

    if (!/^[0-9a-fA-F]{6}$/.test(normalizedHex)) {
        throw new Error("Invalid HEX color");
    }

    return {
        r: parseInt(normalizedHex.slice(0, 2), 16),
        g: parseInt(normalizedHex.slice(2, 4), 16),
        b: parseInt(normalizedHex.slice(4, 6), 16)
    };
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const difference = max - min;

    let h = 0;
    let s = 0;
    let l = (max + min) / 2;

    if (difference !== 0) {
        s = difference / (1 - Math.abs(2 * l - 1));

        switch (max) {
            case r:
                h = ((g - b) / difference) % 6;
                break;
            case g:
                h = (b - r) / difference + 2;
                break;
            case b:
                h = (r - g) / difference + 4;
                break;
        }

        h *= 60;
    }

    if (h < 0) {
        h += 360;
    }

    return {
        h: Math.round(h),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

function hexToHsl(hex) {
    const rgb = hexToRgb(hex);

    return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360;
    s /= 100;
    l /= 100;

    const chroma = (1 - Math.abs(2 * l - 1)) * s;
    const x = chroma * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - chroma / 2;

    let r = 0;
    let g = 0;
    let b = 0;

    if (h < 60) {
        r = chroma;
        g = x;
    } else if (h < 120) {
        r = x;
        g = chroma;
    } else if (h < 180) {
        g = chroma;
        b = x;
    } else if (h < 240) {
        g = x;
        b = chroma;
    } else if (h < 300) {
        r = x;
        b = chroma;
    } else {
        r = chroma;
        b = x;
    }

    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
    };
}

function hslToHex(h, s, l) {
    const rgb = hslToRgb(h, s, l);

    return rgbToHex(rgb.r, rgb.g, rgb.b);
}
