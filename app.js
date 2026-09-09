console.log("Web Serverni boshlash");

const express = require("express");
const app = express();
const fs = require("fs");
const session = require("express-session");
const bcrypt = require("bcryptjs");

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
app.use(
  session({
    secret: "reja-app-maxfiy-kalit-buni-ozgartiring", // <-- bu qatorni albatta o'zingizga xos matnga o'zgartiring
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // sessiya 1 kun amal qiladi
    },
  }),
);

// Login qilinganligini tekshiruvchi middleware
// Bu funksiyani himoyalanishi kerak bo'lgan har bir route oldiga qo'yamiz
function requireLogin(req, res, next) {
  if (req.session && req.session.userId) {
    next(); // foydalanuvchi login qilgan -> davom etsin
  } else {
    res.redirect("/login"); // login qilmagan -> login sahifasiga yuborish
  }
}

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

// ---------- LOGIN / REGISTER / LOGOUT ----------

// Login sahifasini ko'rsatish
app.get("/login", (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect("/"); // agar login qilgan bo'lsa, bosh sahifaga
  }
  res.render("login", { error: null });
});

// Login qilish (formdan kelgan ma'lumotni tekshirish)
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.collection("users").findOne({ username: username }, (err, foundUser) => {
    if (err || !foundUser) {
      return res.render("login", { error: "Login yoki parol noto'g'ri" });
    }

    bcrypt.compare(password, foundUser.password, (err, isMatch) => {
      if (isMatch) {
        req.session.userId = foundUser._id;
        req.session.username = foundUser.username;
        res.redirect("/");
      } else {
        res.render("login", { error: "Login yoki parol noto'g'ri" });
      }
    });
  });
});

// Ro'yxatdan o'tish sahifasini ko'rsatish
app.get("/register", (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect("/");
  }
  res.render("register", { error: null });
});

// Yangi foydalanuvchi yaratish
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render("register", { error: "Hamma maydonlarni to'ldiring" });
  }

  db.collection("users").findOne({ username: username }, (err, existing) => {
    if (existing) {
      return res.render("register", {
        error: "Bu foydalanuvchi nomi band, boshqasini tanlang",
      });
    }

    bcrypt.hash(password, 10, (err, hash) => {
      db.collection("users").insertOne(
        { username: username, password: hash },
        (err, data) => {
          res.redirect("/login");
        },
      );
    });
  });
});

// Chiqish (logout)
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// ---------- CRUD (endi faqat login qilganlar uchun) ----------

app.post("/create-item", requireLogin, (req, res) => {
  console.log("You entered /create-item");
  console.log(req.body);
  const new_reja = req.body.reja;
  db.collection("plans").insertOne({ reja: new_reja }, (err, data) => {
    console.log(data.ops);
    res.json(data.ops[0]);
  });
});

app.post("/delete-item", requireLogin, (req, res) => {
  const id = req.body.id;
  db.collection("plans").deleteOne(
    { _id: new mongoDB.ObjectId(id) },
    function (err, data) {
      res.json({ state: "success" });
    },
  );
});

// "edit-item" endpoint: ma'lumotni tahrirlash
app.post("/edit-item", requireLogin, (req, res) => {
  const data = req.body; // Foydalanuvchi yuborgan ma'lumotlarni olish
  console.log(data); // Konsolda ko'rish uchun log qilish

  // MongoDB'da plans kolleksiyasidan id bo'yicha hujjatni topib yangilash
  db.collection("plans").findOneAndUpdate(
    {
      _id: new mongoDB.ObjectId(data.id), // Qaysi hujjatni yangilash kerakligini aniqlash
    },
    {
      $set: { reja: data.new_input }, // "reja" maydonini yangi qiymatga o'zgartirish
    },
    function (err, data) {
      // Callback: operatsiya tugagach ishlaydi
      res.json({ state: "Success" }); // Javob sifatida JSON qaytarish
    },
  );
});

// "delete-all" endpoint: hamma hujjatlarni o'chirish
app.post("/delete-all", requireLogin, (req, res) => {
  if (req.body.delete_all) {
    // Agar foydalanuvchi delete_all flagini yuborsa
    db.collection(`plans`).deleteMany(function () {
      // plans kolleksiyasidagi barcha hujjatlarni o'chirish
      res.json({ state: "Hamma Rejalar o'chirildi" }); // Javob qaytarish
    });
  }
});

app.get("/author", (req, res) => {
  res.render("author", { user: user });
});

// Bosh sahifa - endi faqat login qilganlar kira oladi
app.get("/", requireLogin, function (req, res) {
  console.log("User entered /");
  db.collection("plans")
    .find()
    .toArray((err, data) => {
      if (err) {
        console.log(err);
        res.end("something went wrong");
      } else {
        res.render("reja", { items: data, username: req.session.username });
      }
    });
});

module.exports = app;
