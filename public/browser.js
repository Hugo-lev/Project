console.log("FrontEnd Js ishga tushdi");

function itemTemplate(item) {
  return `<li
          class="list-group-item d-flex align-items-center justify-content-between"
        >
          <span class="item-text">${item.reja}</span>
          <div>
            <button data-id="${item._id}" class="edit-me btn btn-sm mr-1">
              O'zgartirish
            </button>
            <button data-id="${item._id}" class="delete-me btn btn-sm">O'chirish</button>
          </div>
        </li>`;
}

// Ro'yxat bo'sh bo'lsa ko'rsatiladigan xabar
function emptyStateTemplate() {
  return `<li class="empty-state" id="empty-state-item">Hozircha rejalar yo'q. Birinchisini qo'shing! ✨</li>`;
}

let itemList = document.getElementById("item-list");
let createField = document.getElementById("create-field");

document.getElementById("create-form").addEventListener("submit", function (e) {
  e.preventDefault();

  // Bo'sh matn yuborilmasin
  if (!createField.value.trim()) {
    createField.focus();
    return;
  }

  axios
    .post("/create-item", { reja: createField.value })
    .then((response) => {
      // Agar "bo'sh ro'yxat" xabari turgan bo'lsa, uni olib tashlash
      let emptyState = document.getElementById("empty-state-item");
      if (emptyState) {
        emptyState.remove();
      }

      itemList.insertAdjacentHTML("beforeend", itemTemplate(response.data));
      createField.value = "";
      createField.focus();
    })
    .catch((err) => {
      console.log("Iltimos qaytadan harakat qiling!");
    });
});

document.addEventListener("click", function (e) {
  // delete oper
  if (e.target.classList.contains("delete-me")) {
    if (confirm("Aniq o'chirmoqchimisiz ?")) {
      axios
        .post("/delete-item", { id: e.target.getAttribute("data-id") })
        .then((response) => {
          console.log(response.data);
          e.target.parentElement.parentElement.remove();

          // Agar ro'yxatda hech narsa qolmasa, "bo'sh" xabarini ko'rsatish
          if (itemList.querySelectorAll("li.list-group-item").length === 0) {
            itemList.insertAdjacentHTML("beforeend", emptyStateTemplate());
          }
        })
        .catch((err) => {
          console.log("Iltimos qaytadan harakat qiling");
        });
    }
  }

  //edit oper
  // Hodisa tinglovchi (event listener) ichida edit tugmasi bosilganda ishlaydi
  if (e.target.classList.contains("edit-me")) {
    // Prompt orqali foydalanuvchidan yangi matn so‘raladi
    // Ikkinchi parametr sifatida hozirgi matn ko‘rsatiladi (eski qiymat)
    let userInput = prompt(
      "O'zgartirishni kriting ",
      e.target.parentElement.parentElement.querySelector(".item-text")
        .innerHTML,
    );

    // Agar foydalanuvchi biror matn kiritsa (bo‘sh yoki cancel bo‘lmasa)
    if (userInput && userInput.trim()) {
      // Serverga POST so‘rov yuboriladi
      axios
        .post("/edit-item", {
          // Elementning data-id atributidan id olinadi
          id: e.target.getAttribute("data-id"),
          // Foydalanuvchi kiritgan yangi matn yuboriladi
          new_input: userInput,
        })
        .then((response) => {
          // Serverdan kelgan javobni konsolga chiqarish
          console.log(response.data);

          // Sahifadagi matnni foydalanuvchi kiritgan yangi qiymatga almashtirish
          e.target.parentElement.parentElement.querySelector(
            ".item-text",
          ).innerHTML = userInput;
        })
        .catch((err) => {
          // Agar xatolik yuz bersa, konsolga xabar chiqarish
          console.log("Iltimos qaytadan harakat qiling");
        });
    }
  }
});

// "clean-all" id'li tugmaga click event qo'shilyapti
document.getElementById("clean-all").addEventListener("click", function () {
  if (!confirm("Rostdan ham hamma rejalarni o'chirmoqchimisiz?")) {
    return;
  }

  // Tugma bosilganda serverga POST so'rov yuboriladi
  // "/delete-all" endpointiga { delete_all: true } JSON yuboriladi
  axios.post("/delete-all", { delete_all: true }).then((response) => {
    // Serverdan kelgan javobni alert orqali ko'rsatadi
    // Masalan: "Hamma Rejalar o'chirildi"
    alert(response.data.state);

    // Keyin sahifani qayta yuklaydi, shunda o'chirilgan ma'lumotlar UI'dan ham yo'qoladi
    document.location.reload();
  });
});
