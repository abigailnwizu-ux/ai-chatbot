require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");


app.use(session({
    secret:process.env.SESSION_SECRET ||"dev-secret",
    resave:false,
    saveUnitialised:true,
    cookie:{secure:false}
}));

app.use((req,res,next) =>{
    res.locals.user = req.session.user ||null;
    next();
})


app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Import routes
const authRoutes = require("./route/auth");
const straRoutes = require("./route/stra");
const campaignRoutes = require("./route/campaign");
const assetRoutes = require("./route/assets");
const calendarRoutes = require("./route/calendar");
const publishingRoutes = require("./route/publishing");
const analyticsRoutes = require("./route/analytics");
const viewRoutes = require("./route/view");
const goalsRoutes = require("./route/goals");
const companiesRoutes = require("./route/companies");
const aiRoutes = require("./utilis/ai");
app.use("/ai", aiRoutes);


app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));


console.log("viewRoutes:",viewRoutes);
console.log("straRoutes:",straRoutes);
console.log("campaignRoutes:",campaignRoutes);
console.log("assetRoutes:",assetRoutes);
console.log("calendarRoutes:",calendarRoutes);
console.log("publishingRoutes:",publishingRoutes);
console.log("analyticsRoutes:",analyticsRoutes);
console.log("goalsRoutes:",goalsRoutes);
console.log("companiesRoutes:",companiesRoutes);

// Mount routes
app.use("/auth", authRoutes);
app.use("/stra", straRoutes);
app.use("/campaign", campaignRoutes);
app.use("/assets", assetRoutes);
app.use("/calendar", calendarRoutes);
app.use("/publishing", publishingRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/", viewRoutes);
app.use("/goals",goalsRoutes);
app.use("/companies",companiesRoutes);
app.get("/api/search", (req, res) => {
    const query = req.query.q;    
    if (!query) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
