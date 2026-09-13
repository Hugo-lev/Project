console.log("🚀 Web Serverni boshlash");

const express = require("express");
const app = express();
const fs = require("fs");
const session = require("express-session");
const bcrypt = require("bcryptjs");

// MongoDB chaqirish
const db = require("./server").db();
const mongoDB = require("mongodb");

// ============================================
// 1. MIDDLEWARELAR
// ============================================
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// 2. SESSION
// ============================================
app.use(
  session({
    secret: "reja-app-maxfiy-kalit-buni-ozgartiring",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

// ============================================
// 3. LOGIN MIDDLEWARE
// ============================================
function requireLogin(req, res, next) {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.redirect("/login");
  }
}

// ============================================
// 4. VIEW ENGINE
// ============================================
app.set("views", "views");
app.set("view engine", "ejs");

// ============================================
// 5. KATEGORIYA CRUD (BACKEND)
// ============================================

// 5.1. Barcha kategoriyalarni olish (GET)
app.get("/api/categories", requireLogin, (req, res) => {
  console.log("📌 Kategoriyalar so'ralmoqda...");

  db.collection("categories")
    .find({ userId: new mongoDB.ObjectId(req.session.userId) })
    .toArray((err, categories) => {
      if (err) {
        console.log("❌ Xatolik:", err);
        return res.status(500).json({ error: "Xatolik yuz berdi" });
      }
      console.log("✅ Kategoriyalar topildi:", categories.length);
      res.json(categories);
    });
});

// 5.2. Yangi kategoriya yaratish (POST)
app.post("/api/categories", requireLogin, (req, res) => {
  console.log("📌 Yangi kategoriya qo'shish so'rovi keldi:", req.body);

  const { name, description, color } = req.body;

  if (!name || !name.trim()) {
    console.log("❌ Kategoriya nomi yo'q");
    return res.status(400).json({ error: "Kategoriya nomi kerak" });
  }

  const slug = name
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const newCategory = {
    name: name.trim(),
    slug: slug,
    description: description || "",
    color: color || "#6c757d",
    userId: new mongoDB.ObjectId(req.session.userId),
    createdAt: new Date(),
  };

  console.log("📝 Yangi kategoriya:", newCategory);

  db.collection("categories").insertOne(newCategory, (err, data) => {
    if (err) {
      console.log("❌ Xatolik:", err);
      return res.status(500).json({ error: "Kategoriya yaratilmadi" });
    }
    console.log("✅ Kategoriya qo'shildi:", data.ops[0]);
    res.status(201).json(data.ops[0]);
  });
});

// 5.3. Kategoriyani tahrirlash (PUT)
app.put("/api/categories/:id", requireLogin, (req, res) => {
  console.log(
    "📌 Kategoriya tahrirlash so'rovi keldi:",
    req.params.id,
    req.body,
  );

  const { name, description, color } = req.body;
  const id = req.params.id;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Kategoriya nomi kerak" });
  }

  const slug = name
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-z0-9-]/g, "");

  db.collection("categories").findOneAndUpdate(
    {
      _id: new mongoDB.ObjectId(id),
      userId: new mongoDB.ObjectId(req.session.userId),
    },
    {
      $set: {
        name: name.trim(),
        slug: slug,
        description: description || "",
        color: color || "#6c757d",
      },
    },
    { returnOriginal: false },
    (err, result) => {
      if (err || !result.value) {
        console.log("❌ Kategoriya topilmadi");
        return res.status(404).json({ error: "Kategoriya topilmadi" });
      }
      console.log("✅ Kategoriya tahrirlandi:", result.value);
      res.json(result.value);
    },
  );
});

// 5.4. Kategoriyani o'chirish (DELETE)
app.delete("/api/categories/:id", requireLogin, (req, res) => {
  console.log("📌 Kategoriya o'chirish so'rovi keldi:", req.params.id);

  const id = req.params.id;

  db.collection("categories").deleteOne(
    {
      _id: new mongoDB.ObjectId(id),
      userId: new mongoDB.ObjectId(req.session.userId),
    },
    (err, data) => {
      if (err || data.deletedCount === 0) {
        console.log("❌ Kategoriya topilmadi");
        return res.status(404).json({ error: "Kategoriya topilmadi" });
      }
      console.log("✅ Kategoriya o'chirildi");
      res.json({ message: "Kategoriya o'chirildi" });
    },
  );
});

// ============================================
// 6. AUTH (LOGIN / REGISTER / LOGOUT)
// ============================================

app.get("/login", (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect("/");
  }
  res.render("login", { error: null });
});

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

app.get("/register", (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect("/");
  }
  res.render("register", { error: null });
});

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

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// ============================================
// 7. REJA CRUD (Kategoriya bilan)
// ============================================

// CREATE
app.post("/create-item", requireLogin, (req, res) => {
  console.log("📌 Reja qo'shish so'rovi:", req.body);

  const new_reja = req.body.reja;
  const categoryId = req.body.categoryId || null;

  db.collection("plans").insertOne(
    {
      reja: new_reja,
      categoryId: categoryId,
      userId: new mongoDB.ObjectId(req.session.userId),
      createdAt: new Date(),
    },
    (err, data) => {
      if (err) {
        console.log("❌ Xatolik:", err);
        return res.status(500).json({ error: "Yaratilmadi" });
      }
      console.log("✅ Reja qo'shildi");
      res.json(data.ops[0]);
    },
  );
});

// READ
app.get("/", requireLogin, function (req, res) {
  console.log("📌 Bosh sahifa so'rovi");

  db.collection("plans")
    .find({ userId: new mongoDB.ObjectId(req.session.userId) })
    .toArray((err, plans) => {
      if (err) {
        console.log("❌ Xatolik:", err);
        return res.end("something went wrong");
      }

      db.collection("categories")
        .find({ userId: new mongoDB.ObjectId(req.session.userId) })
        .toArray((err, categories) => {
          const plansWithCategory = plans.map((plan) => {
            const category = categories.find(
              (c) => c._id.toString() === plan.categoryId?.toString(),
            );
            return { ...plan, category };
          });

          res.render("reja", {
            items: plansWithCategory,
            username: req.session.username,
            categories: categories,
          });
        });
    });
});

// DELETE
app.post("/delete-item", requireLogin, (req, res) => {
  const id = req.body.id;
  db.collection("plans").deleteOne(
    { _id: new mongoDB.ObjectId(id) },
    function (err, data) {
      res.json({ state: "success" });
    },
  );
});

// EDIT
app.post("/edit-item", requireLogin, (req, res) => {
  const data = req.body;

  db.collection("plans").findOneAndUpdate(
    {
      _id: new mongoDB.ObjectId(data.id),
    },
    {
      $set: { reja: data.new_input },
    },
    function (err, data) {
      res.json({ state: "Success" });
    },
  );
});

// DELETE ALL
app.post("/delete-all", requireLogin, (req, res) => {
  if (req.body.delete_all) {
    db.collection("plans").deleteMany(function () {
      res.json({ state: "Hamma Rejalar o'chirildi" });
    });
  }
});

// FILTER
app.get("/filter/:categoryId", requireLogin, (req, res) => {
  const categoryId = req.params.categoryId;

  db.collection("plans")
    .find({
      userId: new mongoDB.ObjectId(req.session.userId),
      categoryId: categoryId,
    })
    .toArray((err, data) => {
      if (err) {
        return res.status(500).json({ error: "Xatolik" });
      }
      res.json(data);
    });
});

// ============================================
// 8. AUTHOR
// ============================================
app.get("/author", (req, res) => {
  const user = JSON.parse(fs.readFileSync("database/user.json", "utf8"));
  res.render("author", { user: user });
});

module.exports = app;
