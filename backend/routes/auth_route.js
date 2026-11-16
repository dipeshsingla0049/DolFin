require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const prisma = require("../services/prisma_client");
const jwt = require("jsonwebtoken");

let router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const existingUser = await prisma.user.findUnique({
    where: { username },
  });
  if (existingUser) {
    return res.status(409).json({ message: "Username already exists" });
  }


  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });
    res.status(201).json({ message: "User registered successfully", userId: user.id });
    }

  catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }


}); 


router.post("/login", async (req, res) => {
  const { username, password } = req.body;


  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }


  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(user, process.env.SECRET_KEY);

    res.status(200).json({ message: "Login successful", userId: user.id, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
