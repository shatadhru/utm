const app = require("./app")
const PORT = 5000;


app.listen(PORT, (req, res) => {
    console.log(`Server is running at http://localhost:${PORT}`)
})