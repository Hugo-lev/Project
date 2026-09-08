console.log("Jack Ma Maslahatlari");

const list = [
  "yaxshi talaba boling", // 0–20
  "togri boshliq tanlang va koproq hato qiling", // 20–30
  "uzingizga ishlashingizni boshlang", // 30–40
  "siz kuchli bolgan narsalarni qiling", // 40–50
  "yoshlarga investitsiya qiling", // 50–60
  "endi dam oling, foydasi yoq endi", // 60+
];

// function maslahatBering(a, callback) {
//   if (typeof a !== "number") {
//     callback("insert a number", null);
//   } else if (a <= 20) {
//     callback(null, list[0]);
//   } else if (a > 20 && a <= 30) {
//     callback(null, list[1]);
//   } else if (a > 30 && a <= 40) {
//     callback(null, list[2]);
//   } else if (a > 40 && a <= 50) {
//     callback(null, list[3]);
//   } else if (a > 50 && a <= 60) {
//     callback(null, list[4]);
//   } else {
//     setTimeout(function () {
//       callback(null, list[5]);
//     }, 5000);
//   }
// }

// console.log("passed here 0");
// maslahatBering(65, (err, data) => {
//   if (err) {
//     console.log("ERROR:", err);
//   } else {
//     console.log("javob:", data);
//   }
// });
// console.log("you passed here 1")
// console.log("Jack Ma Maslahatlari");



async function maslahatBering(a) {
    if (typeof a !== "number") throw new Error("insert a number");
    else if (a < 20) return list[0];
    else if (a > 20 && a <= 30) return list[1];
    else if (a > 30 && a <= 40) return list[2];
    else if (a > 40 && a <= 50) return list[3];
    else if (a > 50 && a <= 60) return list[4];
    else {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(list[5]);
            }, 5000);
        });
    }
}


// then/catch
// console.log("passed here 0");
// maslahatBering(65)
//     .then((data) => {
//         console.log("javob:", data);
//     })
//     .catch((err) => {
//         console.log("ERROR:", err);
//     });
// console.log("passed here 1");

// async/await



async function run() {
    let javob = await maslahatBering(25);
    console.log(javob);
    javob = await maslahatBering(70);
    console.log(javob);
    javob = await maslahatBering(41);
    console.log(javob);
}
run();

function checkContent(str1, str2) {
  
  if (str1.length !== str2.length) return false;

 
  return str1.split('').sort().join('') === str2.split('').sort().join('');
}

// Misollar
console.log(checkContent("mitgroup", "gmtiprou")); 
console.log(checkContent("hello", "world"));       
// C Task
function checkContent(str1, str2) {
 let set1 = new Set(str1);
  let set2 = new Set(str2);
  let arr1 = [...set1].sort();
  let arr2 = [...set2].sort();
  return arr1.join('') === arr2.join('');
}
console.log(checkContent("mitgroup", "gmtiprou")); 
console.log(checkContent("hello", "world"));       

//C TASK
class Shop {
  constructor(non, lagmon, cola) {
    this.non = non;
    this.lagmon = lagmon;
    this.cola = cola;
  }
  vaqt() {
    const hozir = new Date();
    const soat = hozir.getHours().toString().padStart(2, "0");
    const minut = hozir.getMinutes().toString().padStart(2, "0");
    return `${soat}:${minut}`;
  }
  qoldiq() {
    console.log(
      `Hozir ${this.vaqt()}da ${this.non}ta non, ${this.lagmon}ta lagmon va ${this.cola}ta cola mavjud!`
    );
  }
  sotish(mahsulot, soni) {
    if (this[mahsulot] >= soni) {
      this[mahsulot] -= soni;
      console.log(
        `Hozir ${this.vaqt()}da ${soni}ta ${mahsulot} sotildi!`
      );
    } else {
      console.log(
        `Hozir ${this.vaqt()}da ${mahsulot} yetarli emas!`
      );
    }
  }
  qabul(mahsulot, soni) {
    this[mahsulot] += soni;
    console.log(
      `Hozir ${this.vaqt()}da ${soni}ta ${mahsulot} qabul qilindi!`
    );
  }
}
const shop = new Shop(4, 5, 2);
shop.qoldiq();
shop.sotish("non", 3);
shop.qabul("cola", 4);
shop.qoldiq(); 


//B TASK
function countDigits(str) {
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    if (!isNaN(str[i]) && str[i] !== ' ') { 
      count++;
    }
  }
  return count;
}


console.log(countDigits("ad2a54y79wet0sfgb9"));

//A TASK
function countLetter(letter, word) {
  let count = 0;
  for (let i = 0; i < word.length; i++) {
    if (word[i] === letter) {
      count++;
    }
  }
  return count;
}

console.log(countLetter("e", "engineer")); // 3




