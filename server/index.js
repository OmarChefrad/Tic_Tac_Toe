import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { StreamChat } from "stream-chat"
import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcrypt"

const app = express()
const PORT2 = 5000
dotenv.config()

//midleware
app.use(cors())
app.use(express.json())
const api_key = process.env.API_KEY
const api_secret = process.env.API_SECRET
const serverClient = StreamChat.getInstance(api_key, api_secret)

app.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, username, password } = req.body
    const userId = uuidv4()
    const hashedPassword = await bcrypt.hash(password, 10)
    const token = serverClient.createToken(userId)
    res.json({ token, userId, firstName, lastName, username, hashedPassword })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body
    const { users } = await serverClient.queryUsers({
      name: username,
    })
    if (users.length === 0) res.status(400).json({ error: "User not found" })

    const token = serverClient.createToken(users[0].id)
    const passwordMatch = await bcrypt.compare(
      password,
      users[0].hashedPassword
    )

    if (passwordMatch) {
      res.json({
        token,
        userId: users[0].id,
        firstName: users[0].firstName,
        lastName: users[0].lastName,
        username: users[0].username,
      })
    }
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.listen(process.env.PORT || PORT2, () => {
  console.log(`Server Up running on ${PORT2}`)
})
