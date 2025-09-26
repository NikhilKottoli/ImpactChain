require("dotenv").config();
const express = require("express");

const sponsorRoutes = require("./routes/sponsorRoutes");
const influencerRoutes = require("./routes/influencerRoutes");
const campaignRoutes = require("./routes/campaignRoutes");

const app = express();
app.use(express.json());

app.use("/sponsors", sponsorRoutes);
app.use("/influencers", influencerRoutes);
app.use("/campaigns", campaignRoutes);
app.get("/",(req,res)=>{
  res.send("Successfully setup")
})

app.listen(4000, () => {
  console.log("Server running at http://localhost:4000");
});
