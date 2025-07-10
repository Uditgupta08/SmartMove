require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const expressConfig = require("./config/expressConfig");
const app = express();
// Connect to MongoDB
connectDB();

// Apply express middleware and config
expressConfig(app);
const indexRoutes = require("./routes/index");

app.use("/walmart", indexRoutes);

app.get("/", (req, res) => {
	res.send("running on 3000");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
