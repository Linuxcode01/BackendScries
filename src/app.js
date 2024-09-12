import express from 'express';
import cookiesParser from 'cookies-parser'
import cors from 'cors'
const app = express();

app.use(cors(
    {
        origin:process.env.CORS_ORIGIN,
        credentials:true,

    }

))

app.use(express.json({ limit:"16kb"}))
app.use(express.urlencoded({
    limit:"16kb",
}))
app.use(express.static("public"))
app.use(cookiesParser())
app.get("/", (req,res) => {
    res.send("hello chandan")
})


export {app}