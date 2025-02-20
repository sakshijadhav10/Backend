import path from "path"
import express from "express"
import dotenv from "dotenv"
// import {products} from "./data/products.js"
import cors from "cors"
import connectDB from "./config/db.js"
import { errorHandler, notFound } from "./middleware/errorMiddleware.js"
import cookieParser from "cookie-parser"
import productRoutes from "./routes/productRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import passportUtil from "./utils/passport.js"
import authRoutes from "./routes/authRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
//import stripeUtil from "./utils/stripe.js"
import stripe from "./utils/stripe.js"
import uploadRoutes from "./routes/uploadRoutes.js"

import bodyParser from "body-parser"
import successScreenRoute from "./routes/successScreenRoute.js"
import deliverySuccessRoute from "./routes/deliverySuccessRoute.js"
//import PaymentEmail from "./utils/PaymentEmail.js"

dotenv.config()

connectDB()

const PORT = process.env.PORT || 5000

//https://stackoverflow.com/questions/57009371/access-to-xmlhttprequest-at-from-origin-localhost3000-has-been-blocked

const app=express()

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000")
    next()
  })
  
  app.use(
    cors({
      origin: ["http://127.0.0.1:3000", "http://localhost:3000"],
      methods: "GET, POST, PATCH, DELETE, PUT",
      credentials: true,
    })
  )
// app.use(cors())
app.use(cookieParser())
passportUtil(app);


app.use(express.json())
app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}))
stripe(app);

  
  
  
const __dirname = path.resolve()
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

if (process.env.NODE_ENV === "production") {
  const __dirname = path.resolve()
  app.use("/uploads", express.static(path.join(__dirname, "uploads")))
  app.use(express.static(path.join(__dirname, "/client/dist")))
  app.use("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"))
  )
} else {
  app.use("/uploads", express.static(path.join(__dirname, "uploads")))
  app.get("/", (req, res) => {
    res.send("Api is running...")
  })
}

  


app.use("/api/products", productRoutes)
app.use("/api/users", userRoutes)
app.use("/auth", authRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/upload",uploadRoutes)
app.use("/success-screen", successScreenRoute,deliverySuccessRoute);
app.use("/order/:id",deliverySuccessRoute) 



app.use(notFound)
app.use(errorHandler)

    
  
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})