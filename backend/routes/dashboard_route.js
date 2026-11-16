const express = require("express");
const prisma = require("../services/prisma_client");

const router = express.Router();


// fetching the stocks registered for the authenticated user
router.get("/", async (req, res) => {
  const userId = Number(req.user?.id);
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const userStocks = await prisma.user_Stock.findMany({
      where: { userId },
      select: { stock: true },
    });

    return res.json({ stocks: userStocks.map(({ stock }) => stock) });
  } catch (error) {
    console.error("Failed to fetch dashboard stocks:", error);
    return res.status(500).json({ message: "Failed to fetch dashboard stocks" });
  }
});

module.exports = router;
