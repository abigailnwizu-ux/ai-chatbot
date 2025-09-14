// routes/view.js
const express = require("express");
const router = express.Router();
const {PrismaClient} = require("@prisma/client");
const { id } = require("zod/locales");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

function authenticateToken(req, res, next) {
  // Example JWT/session check placeholder
  if (req.session && req.session.user) {
    res.locals.user = req.session.user; // available in EJS
    next();
  } else {
    res.redirect("/login");
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    const user = req.session?.user;
    if (!user) return res.redirect("/login");
    if (!roles.includes(user.role)) return res.status(403).send("Forbidden");
    next();
  };
}


router.get("/", (req, res) => {
  const user = req.session?.user;
  res.render("index", { title: "Welcome" });
});


router.get("/privacy",(req,res) =>{
  res.render("privacy",{title:"Privacy"});
});

router.get("/terms",(req,res) =>{
  res.render("terms",{title:"Terms"});
});
router.get("/ai",(req,res) =>{
  res.render("ai", {
    title:"AI",
    question: req.session.lastQuestion,
    answer: req.session.lastAnswer,
    user: req.session.user || null
  });
});
router.post("/ai", async (req,res) =>{
  try{
    const question = req.body.q;
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: question }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          topP: 0.8,
        }
    });
  res.render("ai", {title:"AI",question:question,answer:answer,user: req.session.user || null});
} catch (error) {
  console.error("Error generating content:", error);
  res.render("ai", { title: "AI", question:req.body.q, answer: "Sorry, there was an error processing your request.", user: req.session.user || null });
}
});
router.get("/login", (req, res) => {
  res.render("login", { title: "Login" ,});
});

router.post("/login", async (req, res) => {
  console.log("Login request:", req.body);

  if(!req.body) {
    console.log("ERROR: No request body received");
    return res.status(400).send("No data recieved");
  }

  const email = req.body.email;
  const password = req.body.password;

  console.log("Email",email);
  console.log("Password",password);
  console.log("password",!!password);
  
  try{
   
    const user = await prisma.user.findUnique({
    where: {email:email},
  });

  if(!user) {
     return res.status(401).send("User not found");
  }

    console.log("Password:", user.password);
    console.log("Stored hash:", user.password);

    if(!password) {
      console.log("ERROR: No password");
      return res.status(401).send("Password is required");
    }
    if(!user.password) {
      console.log("Error: NO Password from form");
      return res.status(400).send("User Account Error");
    }
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("Password match:",  isMatch);
      
      if (!isMatch) {
         return res.status(400).send("Invalid password");
            }
       req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
      console.log("Login Success");
  res.redirect("/dashboard");
} catch(err) {
  console.error("Login error:",err);
  console.error("Error message:", err.message);
  console.error("Error stack:",err.stack);
  
  res.status(500).send("Something went wrong");
}
});

router.get("/register", (req, res) => {
  res.render("register", { title: "Sign Up"});
});

router.post("/register", async (req, res) => {
  console.log("Register Request Body");
  
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  console.log("Name:",name);
  console.log("Email:",email);
  console.log("Password:",password);
  try{
    const existUser = await prisma.user.findUnique({
      where:{email: email},
    });

    if (existUser) {
      return res.status(400).send("Email already registerd. Please log in.");
    }

    if(password === "?" || password === null || password === undefined) {
      console.log("ERROR:No password");
      return res.status(400).send("Password is required");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed Password", hashedPassword);

    const newUser = await prisma.user.create({
    data: {
      email:email,
      name:name,
      password:hashedPassword
    }
  
  });

  console.log("User created successfully", newUser);
  res.redirect("/login");
} catch (err) {
  console.error("Register error:",err);
  res.status(500).send("Something went wrong");
}  
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

router.get("/dashboard", authenticateToken, (req, res) => {
  res.render("dashboard", { title: "Dashboard", stats:{}
  });
});

router.get("/goals", authenticateToken, (req, res) => {
  res.render("goals", { title: "Goals"});
});

router.post("/goals", authenticateToken, (req, res) => {
  // TODO: save goal
  res.redirect("/goals");
});

// Changed from /strategy → /stra
router.get("/stra", authenticateToken, (req, res) => {
  res.render("stra", { title: "Strategy"});
});

router.post("/stra", authenticateToken, (req, res) => {
  // TODO: save strategy
  res.redirect("/stra");
});

router.get("/campaign", authenticateToken, (req, res) => {
  res.render("campaign", { title: "Campaigns"});
});

router.post("/campaign", authenticateToken, (req, res) => {
  // TODO: save campaign
  res.redirect("/campaign",{title:"Campaign"});
});

router.get("/assets", authenticateToken, (req, res) => {
  res.render("assets", { title: "Assets"});
});

router.post("/assets", authenticateToken, (req, res) => {
  // TODO: save asset
  res.render("/assets",{title:"Assets"});
});

router.get("/analytics",authenticateToken,(req,res) => {
  res.render("analytics",{title:"Analytics"});
});

router.get("/calendar", authenticateToken, (req, res) => {
  res.render("calendar", { title: "Calendar"});
});

router.get("/settings", async (req, res) => {
  if(!req.session.user) {
    return res.redirect("login")
  }
  res.render("settings", {title: "Settings",user: req.session.user});
});
router.post("/settings/profile", async (req, res) => {
  if(!req.session.user) {
    return res.redirect("/login");
  }
  console.log("Update profile",req.body);

  const {name,email } = req.body;

  console.log("New Name:", name);
  console.log("New Email", email);

  try{
   await prisma.user.update({
    where: { id: req.session.user.id},
    data: {name:name,
      email:email }
  });

  req.session.user.name = name;
  req.session.user.email = email;
   
  console.log("Profile Updated")
  res.redirect("/profile");
} catch (err) {
  console.error("Settings update error:", err);
  res.status(500).send("Something went wrong");
}
  });
  router.post("settings/password",async (req,res) => {
    if (!req.session.user) {
      return res.redirect("/login");
    }
    const {password} = req.body;

    try{
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: {id: req.session.user.id},
        data:{password: hashedPassword}
      });
      res.redirect("/profile");
    } catch(err) {
      console.error("Password update error:",err);
      res.status(500).send("Error updating password");
    }
  });

router.get("/profile", (req, res) => {
  if(!req.session.user) {
    return res.redirect("/login")
  }
  res.render("profile", { title: "Your Profile",user:req.session.user});
});  
  

module.exports = router;
