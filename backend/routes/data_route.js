require("dotenv").config();

const express = require("express");
const router = express.Router();
const { market_price, statistics } = require("../services/data_service");
const prisma = require("../services/prisma_client");

router.use(express.json());
const dataKey = process.env.DATA_KEY;

// Convert provider numeric values to numbers before passing them to Prisma.
function requiredNumber(value, field) {
  const number = Number(value);
  if (value === undefined || value === null || value === "" || !Number.isFinite(number)) {
    throw new Error(`Twelve Data response is missing a valid ${field}`);
  }
  return number;
}

// The Stock model requires valid date values for the price, fiscal year, and quarter.
function requiredDate(value, field) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) {
    throw new Error(`Twelve Data response is missing a valid ${field}`);
  }
  return date;
}

// Convert the two Twelve Data responses into the required Prisma Stock fields.
function toStockRecord(ticker, marketData, statsData) {
  const meta = statsData.statistics?.meta ?? statsData.meta ?? {};
  const valuations = statsData.statistics?.valuations_metrics;
  const financials = statsData.statistics?.financials;
  const income = financials?.income_statement;
  const balance = financials?.balance_sheet;

  return {
    ticker,
    name: meta.name || meta.symbol || ticker,
    price: requiredNumber(marketData.close, "closing price"),
    last_price_date: requiredDate(marketData.datetime, "price date"),
    market_cap: requiredNumber(valuations?.market_capitalization, "market capitalization"),
    price_to_sales: requiredNumber(valuations?.price_to_sales_ttm, "price-to-sales ratio"),
    year: requiredDate(financials?.fiscal_year_ends, "fiscal year end"),
    quarter: requiredDate(financials?.most_recent_quarter, "most recent quarter"),
    gross_margin: requiredNumber(financials?.gross_margin, "gross margin"),
    operating_margin: requiredNumber(financials?.operating_margin, "operating margin"),
    return_on_assets: requiredNumber(financials?.return_on_assets_ttm, "return on assets"),
    return_on_equity: requiredNumber(financials?.return_on_equity_ttm, "return on equity"),
    revenue: requiredNumber(income?.revenue_ttm, "revenue"),
    ebitda: requiredNumber(income?.ebitda, "EBITDA"),
    pat: requiredNumber(income?.net_income_to_common_ttm, "net income"),
    total_cash: requiredNumber(balance?.total_cash_mrq, "total cash"),
    total_debt: requiredNumber(balance?.total_debt_mrq, "total debt"),
    debt_to_equity: requiredNumber(balance?.total_debt_to_equity_mrq, "debt-to-equity ratio"),
    current_ratio: requiredNumber(balance?.current_ratio_mrq, "current ratio"),
  };
}

// Record the many-to-many link without duplicating stocks already tracked by this user.
function linkStockToUser(userId, stockId) {
  return prisma.user_Stock.upsert({
    where: { userId_stockId: { userId, stockId } },
    update: {},
    create: { userId, stockId },
  });
}

// router used to fetch data from the api
router.get("/fetch/:id", async (req, res) => {
  // Validate and normalize the requested ticker before querying the unique database field.
  const id = req.params.id;
  if (typeof id !== "string" || !id.trim()) {
    return res.status(400).json({ message: "Invalid ticker" });
  }
  const ticker = id.trim().toUpperCase();
  const userId = Number(req.user?.id);
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Return the cached database entry immediately when it already exists.
  let cachedStock;
  try {
    cachedStock = await prisma.stock.findUnique({
      where: { ticker },
    });
  } catch (error) {
    console.error("Failed to check the stock cache:", error);
    return res.status(500).json({ message: "Failed to read stock data" });
  }

  if (cachedStock) {
    try {
      await linkStockToUser(userId, cachedStock.id);
      return res.json(cachedStock);
    } catch (error) {
      console.error("Failed to link cached stock to user:", error);
      return res.status(500).json({ message: "Failed to save stock to your list" });
    }
  }

  // A cache miss requires the configured provider key before either external request.
  if (!dataKey) {
    return res.status(500).json({ message: "DATA_KEY must be configured" });
  }

  let stockData;
  try {
    // Fetch price and statistics concurrently because neither request depends on the other.
    const [marketData, statsData] = await Promise.all([
      // fetches market price
      market_price(ticker, dataKey),
      // fetches company statsitics
      statistics(ticker, dataKey),
    ]);

    // Twelve Data can return API errors as JSON even when the HTTP request succeeds.
    for (const response of [marketData, statsData]) {
      if (response?.status === "error") {
        throw new Error(response.message || "Twelve Data returned an error");
      }
    }

    stockData = toStockRecord(ticker, marketData, statsData);
  } catch (error) {
    console.error(`Failed to fetch data for ${ticker}:`, error);
    return res.status(502).json({
      message: error.message || "Failed to fetch stock data",
    });
  }

  // Save the fetched data so later requests can use the database cache.
  try {
    const stock = await prisma.stock.create({ data: stockData });
    await linkStockToUser(userId, stock.id);
    return res.status(201).json(stock);
  } catch (error) {
    // Another request may have populated the cache while this request fetched the provider data.
    if (error.code === "P2002") {
      try {
        const cachedStock = await prisma.stock.findUnique({
          where: { ticker },
        });
        if (cachedStock) {
          await linkStockToUser(userId, cachedStock.id);
          return res.json(cachedStock);
        }
      } catch (lookupError) {
        console.error("Failed to read the stock cache after a duplicate insert:", lookupError);
        return res.status(500).json({ message: "Failed to read stock data" });
      }
    }

    console.error(`Failed to save data for ${ticker}:`, error);
    return res.status(500).json({ message: "Failed to save stock data" });
  }
});

module.exports = router;
