console.log("Web Serverni boshlash");

const express = require("express");
const app = express();
const fs = require("fs");

// fs.readFile o‘rniga:
const data = fs.readFileSync("database/user.json", "utf8");
const user = JSON.parse(data);


// MongoDB chaqirish
const db = require("./server").db();
const mongoDB = require("mongodb");
const { json } = require("stream/consumers");

// 1-> bosqich ->Kirish codelari
// expressga kirib kelayotgan ma'lumotlarga oid boshqichlar yoziladi
app.use(express.static("public")); // -> kirib kelayotgan requestlar uchun public folderi ochiq deagn ma'noni anglatadi.
app.use(express.json()); //-> kirib kelayotgan json formatdagi datani objectga o'zhartirib beradi. Client va server ortasidagi data json korinishida boladi .
app.use(express.urlencoded({ extended: true })); // formdan kelgan requestlarni qabul qilish uchun

//2-bosqich Session boyicha bo'lim

//3-bosqich-> view backend yashash uchun , frontend yasaladi backendni ichida-> VIEWsgabog'liq codelar
app.set("views", "views"); // folderlarni korsatyapmiz ,
app.set("view engine", "ejs"); // view engine bu ejs ekanligi korsatilyapdi

//4-bosqich->Routing bog'liq codelar
// app.get("/hello", function(req,res){
//     res.end(`<h1>Hello World </h1>`);
// });
// app.get("/gift", function(req,res){
//     res.end(`<h1>Siz sovg'alar sahifasidasiz</h1>`);
// });
// app.get("/", function(req,res){
//     res.end(`<h1>Hello World </h1>`);
// });

app.post("/create-item", (req, res) => {
  console.log("You entered /create-item");
  console.log(req.body);
  const new_reja = req.body.reja;
  db.collection("plans").insertOne({ reja: new_reja }, (err, data) => {
    console.log(data.ops);
    res.json(data.ops[0]);
  });
});

app.post("/delete-item", (req, res) => {
  const id = req.body.id;
  db.collection("plans"   ).deleteOne(
    { _id: new mongoDB.ObjectId(id) },
    function (err, data) {
      res.json({ state: "success" });
    },
  );
});

// "edit-item" endpoint: ma'lumotni tahrirlash
app.post("/edit-item", (req, res) => {
  const data = req.body; // Foydalanuvchi yuborgan ma'lumotlarni olish
  console.log(data);     // Konsolda ko'rish uchun log qilish

  // MongoDB'da plans kolleksiyasidan id bo'yicha hujjatni topib yangilash
  db.collection("plans").findOneAndUpdate(
    {
      _id: new mongoDB.ObjectId(data.id), // Qaysi hujjatni yangilash kerakligini aniqlash
    },
    { 
      $set: { reja: data.new_input }      // "reja" maydonini yangi qiymatga o'zgartirish
    },
    function (err, data) {                // Callback: operatsiya tugagach ishlaydi
      res.json({ state: "Success" });     // Javob sifatida JSON qaytarish
    },
  );
});

// "delete-all" endpoint: hamma hujjatlarni o'chirish
app.post("/delete-all", (req, res) => {
  if (req.body.delete_all) {              // Agar foydalanuvchi delete_all flagini yuborsa
    db.collection(`plans`).deleteMany(function () { 
      // plans kolleksiyasidagi barcha hujjatlarni o'chirish
      res.json({ state: "Hamma Rejalar o'chirildi" }); // Javob qaytarish
    });
  }
});



app.get("/author", (req, res) => {
  res.render("author", { user: user });
});

app.get("/", function (req, res) {
  console.log("User entered /");
  db.collection("plans")
    .find()
    .toArray((err, data) => {
      if (err) {
        console.log(err);
        res.end("something went wrong");
      } else {
        res.render("reja", { items: data });
      }
    });
});

module.exports = app;




