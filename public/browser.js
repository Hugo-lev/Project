console.log("🚀 FrontEnd Js ishga tushdi");

// ==========================================
// SEARCH
// ==========================================
function searchTable() {
  const input = document.getElementById("search-input");
  if (!input) return;

  const filter = input.value.toLowerCase();
  const rows = document.querySelectorAll("#item-list tr");

  rows.forEach((row) => {
    const text = row.getAttribute("data-search") || "";
    row.style.display = text.toLowerCase().includes(filter) ? "" : "none";
  });
}

// ==========================================
// FILTER
// ==========================================
function filterTable() {
  const filter = document.getElementById("category-filter");
  if (!filter) return;

  const value = filter.value;
  const rows = document.querySelectorAll("#item-list tr");

  rows.forEach((row) => {
    const category = row.getAttribute("data-category") || "";
    row.style.display = value === "" || category === value ? "" : "none";
  });
}

// ==========================================
// CREATE REJA
// ==========================================
const createForm = document.getElementById("create-form");
if (createForm) {
  createForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const reja = document.getElementById("create-field").value.trim();
    const categoryId = document.getElementById("category-select").value;

    if (!reja) {
      alert("Iltimos reja matnini kiriting!");
      return;
    }

    axios
      .post("/create-item", { reja, categoryId })
      .then(() => {
        location.reload();
      })
      .catch((err) => {
        alert("Xatolik yuz berdi!");
        console.error(err);
      });
  });
}

// ==========================================
// EDIT REJA
// ==========================================
function openEditModal(btn) {
  const id = btn.dataset.id;
  const text = btn.dataset.text;
  const category = btn.dataset.category;

  document.getElementById("edit-id").value = id;
  document.getElementById("edit-field").value = text;
  document.getElementById("edit-category").value = category || "";

  $("#editModal").modal("show");
}

const editForm = document.getElementById("edit-form");
if (editForm) {
  editForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const id = document.getElementById("edit-id").value;
    const newInput = document.getElementById("edit-field").value.trim();

    if (!newInput) {
      alert("Iltimos reja matnini kiriting!");
      return;
    }

    axios
      .post("/edit-item", { id, new_input: newInput })
      .then(() => {
        location.reload();
      })
      .catch((err) => {
        alert("Xatolik yuz berdi!");
        console.error(err);
      });
  });
}

// ==========================================
// DELETE REJA
// ==========================================
function deleteItem(btn) {
  if (!confirm("Bu rejani o'chirmoqchimisiz?")) return;

  const id = btn.dataset.id;

  axios
    .post("/delete-item", { id })
    .then(() => {
      location.reload();
    })
    .catch((err) => {
      alert("Xatolik yuz berdi!");
      console.error(err);
    });
}

// ==========================================
// KATEGORIYA CRUD (FRONTEND)
// ==========================================

// 1. Kategoriyalarni yuklash
function loadCategories() {
  console.log("📌 Kategoriyalar yuklanmoqda...");

  axios
    .get("/api/categories")
    .then((response) => {
      console.log("✅ Kategoriyalar yuklandi:", response.data);

      const categories = response.data;
      const categoryList = document.getElementById("category-list");
      const categorySelect = document.getElementById("category-select");
      const categoryFilter = document.getElementById("category-filter");
      const editCategory = document.getElementById("edit-category");

      // Kategoriya ro'yxatini yangilash
      if (categoryList) {
        if (!categories || categories.length === 0) {
          categoryList.innerHTML = `
            <div class="text-center py-4 text-muted">
              <i class="fas fa-tags" style="font-size: 32px; opacity: 0.3; display: block; margin-bottom: 10px;"></i>
              Hozircha kategoriya yo'q
              <br><small>Yuqoridagi formadan qo'shing</small>
            </div>
          `;
        } else {
          let html = `<div class="category-items">`;
          categories.forEach((cat) => {
            html += `
              <div class="category-item d-flex align-items-center justify-content-between p-2 mb-2 rounded" 
                   style="background: rgba(255,255,255,0.05); border-left: 4px solid ${cat.color || "#6c757d"};">
                <span>
                  <span class="badge rounded-pill me-2" style="background-color: ${cat.color || "#6c757d"}; color: #fff; padding: 5px 14px;">
                    ${cat.name}
                  </span>
                  <small class="text-muted">${cat.description || ""}</small>
                </span>
                <div>
                  <button class="btn btn-sm btn-outline-warning edit-category-btn me-1" 
                          data-id="${cat._id}" data-name="${cat.name}" 
                          data-desc="${cat.description || ""}" data-color="${cat.color || "#6c757d"}">
                    <i class="fas fa-pen"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger delete-category-btn" data-id="${cat._id}">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            `;
          });
          html += `</div>`;
          categoryList.innerHTML = html;
        }
      }

      // Selectlarni yangilash
      const selects = [categorySelect, categoryFilter, editCategory];
      selects.forEach((select) => {
        if (!select) return;

        const firstOption = select.options[0];
        select.innerHTML = "";
        if (firstOption) {
          select.appendChild(firstOption.cloneNode(true));
        }

        if (categories && categories.length) {
          categories.forEach((cat) => {
            const option = document.createElement("option");
            option.value = cat._id;
            option.textContent = cat.name;
            option.style.color = cat.color || "#6c757d";
            select.appendChild(option);
          });
        }
      });
    })
    .catch((err) => {
      console.error("❌ Kategoriyalar yuklanmadi:", err);
      const categoryList = document.getElementById("category-list");
      if (categoryList) {
        categoryList.innerHTML = `<p class="text-danger text-center">⚠️ Kategoriyalar yuklanmadi: ${err.message}</p>`;
      }
    });
}

// 2. Kategoriya qo'shish
const categoryForm = document.getElementById("category-form");
if (categoryForm) {
  categoryForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("category-name").value.trim();
    const description = document.getElementById("category-desc").value.trim();
    const color = document.getElementById("category-color").value;

    if (!name) {
      alert("Iltimos kategoriya nomini kiriting!");
      return;
    }

    console.log("📌 Kategoriya qo'shish so'rovi:", {
      name,
      description,
      color,
    });

    axios
      .post("/api/categories", { name, description, color })
      .then((response) => {
        console.log("✅ Kategoriya qo'shildi:", response.data);
        document.getElementById("category-name").value = "";
        document.getElementById("category-desc").value = "";
        loadCategories();
        alert("✅ Kategoriya qo'shildi!");
        // Selectlarni yangilash
        setTimeout(() => location.reload(), 500);
      })
      .catch((err) => {
        console.error("❌ Xatolik:", err);
        alert("❌ Xatolik: " + (err.response?.data?.error || err.message));
      });
  });
}

// 3. Kategoriya o'chirish va tahrirlash
document.addEventListener("click", function (e) {
  // DELETE CATEGORY
  if (
    e.target.classList.contains("delete-category-btn") ||
    e.target.closest(".delete-category-btn")
  ) {
    const btn = e.target.closest(".delete-category-btn") || e.target;
    if (!confirm("Bu kategoriyani o'chirmoqchimisiz?")) return;

    const id = btn.dataset.id;
    console.log("📌 Kategoriya o'chirish so'rovi:", id);

    axios
      .delete(`/api/categories/${id}`)
      .then(() => {
        console.log("✅ Kategoriya o'chirildi");
        loadCategories();
        alert("✅ Kategoriya o'chirildi!");
        setTimeout(() => location.reload(), 500);
      })
      .catch((err) => {
        console.error("❌ Xatolik:", err);
        alert("❌ Xatolik: " + (err.response?.data?.error || err.message));
      });
  }

  // EDIT CATEGORY
  if (
    e.target.classList.contains("edit-category-btn") ||
    e.target.closest(".edit-category-btn")
  ) {
    const btn = e.target.closest(".edit-category-btn") || e.target;
    const id = btn.dataset.id;
    const currentName = btn.dataset.name;
    const currentDesc = btn.dataset.desc || "";
    const currentColor = btn.dataset.color || "#6c757d";

    const newName = prompt("Yangi nom:", currentName);
    if (newName === null) return;

    if (newName.trim() && newName.trim() !== currentName) {
      const newDesc = prompt("Tavsif:", currentDesc);
      const newColor = prompt("Rang (HEX, masalan #00d9c0):", currentColor);

      console.log("📌 Kategoriya tahrirlash so'rovi:", {
        id,
        name: newName.trim(),
        description: newDesc,
        color: newColor,
      });

      axios
        .put(`/api/categories/${id}`, {
          name: newName.trim(),
          description: newDesc || "",
          color: newColor || "#6c757d",
        })
        .then(() => {
          console.log("✅ Kategoriya tahrirlandi");
          loadCategories();
          alert("✅ Kategoriya tahrirlandi!");
          setTimeout(() => location.reload(), 500);
        })
        .catch((err) => {
          console.error("❌ Xatolik:", err);
          alert("❌ Xatolik: " + err.message);
        });
    }
  }
});

// ==========================================
// SAHIFA YUKLANGANDA
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
  console.log("📌 Sahifa yuklandi, kategoriyalar yuklanmoqda...");

  // Kategoriyalarni yuklash
  loadCategories();

  // Modal ochilganda kategoriyalarni yangilash
  const categoryModal = document.getElementById("categoryModal");
  if (categoryModal) {
    categoryModal.addEventListener("show.bs.modal", function () {
      loadCategories();
    });
  }

  // Add modal ochilganda create-field ga fokus
  const addModal = document.getElementById("addModal");
  if (addModal) {
    addModal.addEventListener("shown.bs.modal", function () {
      document.getElementById("create-field").focus();
    });
  }

  // Search inputga event listener
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("keyup", searchTable);
  }

  // Filter selectga event listener
  const categoryFilter = document.getElementById("category-filter");
  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterTable);
  }
});
