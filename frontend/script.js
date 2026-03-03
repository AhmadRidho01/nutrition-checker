// ============================================
// script.js - Frontend Logic
// Nutrition Checker App
// ============================================

// DOM Elements

const tutorialModal = document.getElementById("tutorialModal");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalExamples = document.querySelectorAll(".modal-example");
const ingredientInput = document.getElementById("ingredient");
const calculateBtn = document.getElementById("calculateBtn");
const errorMsg = document.getElementById("errorMsg");
const resultsSection = document.getElementById("resultsSection");
const resultsTitle = document.getElementById("resultsTitle");
const resultsSubtitle = document.getElementById("resultsSubtitle");
const resultsGrid = document.getElementById("resultsGrid");
const btnText = calculateBtn.querySelector(".btn-text");
const btnLoading = calculateBtn.querySelector(".btn-loading");

// Event Listeners

modalCloseBtn.addEventListener("click", closeModal);

// Klik contoh → auto-fill input & tutup modal
modalExamples.forEach((example) => {
  example.addEventListener("click", () => {
    const query = example.getAttribute("data-query");
    ingredientInput.value = query;
    closeModal();
    ingredientInput.focus();
  });
});

// Klik tombol Calculate
calculateBtn.addEventListener("click", handleCalculate);

// Tekan Enter di salah satu input juga trigger calculate
ingredientInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleCalculate();
});

// Main Handler

async function handleCalculate() {
  // Ambil & bersihkan nilai input
  const ingredient = ingredientInput.value.trim();

  // Validasi: ingredient wajib diisi
  if (!ingredient) {
    showError("Please enter an ingredient name.");
    ingredientInput.focus();
    return;
  }

  // Reset UI sebelum fetch
  hideError();
  setLoadingState(true);
  clearResults();

  try {
    const params = new URLSearchParams({ query: ingredient });
    const response = await fetch(`/api/nutrition?${params}`);
    const data = await response.json();

    // Cek apakah response berhasil
    if (!response.ok) {
      // Tampilkan pesan error dari backend
      showError(data.error || "Something went wrong. Please try again.");
      return;
    }

    // Render hasil ke UI
    renderResults(data, ingredient);
  } catch (err) {
    // Error jaringan (server mati, dll)
    showError(
      "Could not connect to the server. Please make sure the server is running.",
    );
    console.error("Fetch error:", err);
  } finally {
    // Selalu kembalikan tombol ke state normal
    setLoadingState(false);
  }
}

// Render Functions

function renderResults(data, ingredient) {
  // Set judul hasil
  resultsTitle.textContent = ingredient;
  resultsSubtitle.textContent = "";

  // Buat satu card per item dari API
  data.forEach((item) => {
    const card = createNutritionCard(item);
    resultsGrid.appendChild(card);
  });

  // Tampilkan section hasil
  resultsSection.classList.remove("hidden");

  // Scroll ke hasil
  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function createNutritionCard(item) {
  // Data nutrisi yang ingin ditampilkan
  // Format: [label, nilai, satuan]
  const nutrients = [
    ["Serving Size", item.serving_size_g, "g"],
    ["Total Fat", item.fat_total_g, "g"],
    ["Saturated Fat", item.fat_saturated_g, "g"],
    ["Cholesterol", item.cholesterol_mg, "mg"],
    ["Sodium", item.sodium_mg, "mg"],
    ["Carbohydrates", item.carbohydrates_total_g, "g"],
    ["Fiber", item.fiber_g, "g"],
    ["Sugar", item.sugar_g, "g"],
    ["Potassium", item.potassium_mg, "mg"],
  ];

  // Buat elemen card
  const card = document.createElement("div");
  card.className = "nutrition-card";

  // Nama item (dari API)
  const nameEl = document.createElement("p");
  nameEl.className = "nutrition-card__name";
  nameEl.textContent = item.name || "Unknown Item";

  // Serving info
  const servingEl = document.createElement("p");
  servingEl.className = "nutrition-card__serving";
  servingEl.textContent = `Per ${item.serving_size_g}g serving`;

  // List nutrisi
  const list = document.createElement("ul");
  list.className = "nutrition-list";

  nutrients.forEach(([label, value, unit]) => {
    // Lewati jika nilai null/undefined
    if (value === null || value === undefined) return;

    const li = document.createElement("li");
    li.className = "nutrition-list__item";
    // Calories dapat styling khusus
    if (label === "Calories")
      li.classList.add("nutrition-list__item--calories");

    li.innerHTML = `
      <span class="nutrition-list__label">${label}</span>
      <span class="nutrition-list__value">${value} ${unit}</span>
    `;
    list.appendChild(li);
  });

  // Gabungkan semua ke card
  card.appendChild(nameEl);
  card.appendChild(servingEl);
  card.appendChild(list);

  return card;
}

// UI Helper Functions

// Tutup modal
function closeModal() {
  tutorialModal.classList.add("hidden");
}

// Tampilkan pesan error
function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.remove("hidden");
}

// Sembunyikan pesan error
function hideError() {
  errorMsg.textContent = "";
  errorMsg.classList.add("hidden");
}

// Bersihkan section hasil sebelumnya
function clearResults() {
  resultsGrid.innerHTML = "";
  resultsSection.classList.add("hidden");
}

function setLoadingState(isLoading) {
  calculateBtn.disabled = isLoading;

  if (isLoading) {
    btnText.classList.add("hidden");
    btnLoading.classList.remove("hidden");
  } else {
    btnText.classList.remove("hidden");
    btnLoading.classList.add("hidden");
  }
}
