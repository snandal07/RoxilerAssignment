const cors = require("cors");
const express = require("express");
const { Transaction, initializeDatabase } = require("./models");
const app = express();

const PORT = 3000;
app.use(cors());
app.use(express.json());

initializeDatabase()
  .then(() => {
    console.log("Database initialized");
  })
  .catch((error) => {
    console.error("Error initializing database:", error);
  });

const monthMapping = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

app.get("/transactions", async (req, res) => {
  try {
    const { search, page = 1, perPage = 10, month, category } = req.query;

    let query = {};

    if (search) {
      query = {
        $or: [
          { title: new RegExp(search, "i") },
          { description: new RegExp(search, "i") },
          { price: new RegExp(search, "i") },
        ],
      };
    }

    if (month) {
      const monthNumber = monthMapping[month];
      if (monthNumber) {
        query = {
          ...query,
          $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] },
        };
      }
    }

    if (category) {
      query = {
        ...query,
        category: new RegExp(category, "i"),
      };
    }

    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage, 10));
    const count = await Transaction.countDocuments(query);

    res.json({ count, transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Error fetching transactions" });
  }
});

app.get("/statistics", async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ message: "Month is required" });
    }

    const monthNumber = monthMapping[month];
    if (!monthNumber) {
      return res.status(400).json({ message: "Invalid month" });
    }

    const start = new Date(
      `2000-${String(monthNumber).padStart(2, "0")}-01T00:00:00.000Z`
    );
    const end = new Date(start);
    end.setMonth(start.getMonth() + 1);

    const totalSaleAmount = await Transaction.aggregate([
      { $match: { dateOfSale: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);

    const totalSoldItems = await Transaction.countDocuments({
      dateOfSale: { $gte: start, $lt: end },
      sold: true,
    });

    const totalNotSoldItems = await Transaction.countDocuments({
      dateOfSale: { $gte: start, $lt: end },
      sold: false,
    });

    res.json({
      totalSaleAmount: totalSaleAmount[0]?.total || 0,
      totalSoldItems,
      totalNotSoldItems,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ message: "Error fetching statistics" });
  }
});

app.get("/barchart", async (req, res) => {
  const { month } = req.query;
  const start = new Date(`${month} 1 00:00:00`);
  const end = new Date(start);
  end.setMonth(start.getMonth() + 1);
  const barChartData = await Transaction.aggregate([
    { $match: { dateOfSale: { $gte: start, $lt: end } } },
    {
      $bucket: {
        groupBy: "$price",
        boundaries: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, Infinity],
        default: "901-above",
        output: { count: { $sum: 1 } },
      },
    },
  ]);
  res.json(barChartData);
});

app.get("/piechart", async (req, res) => {
  const { month } = req.query;
  console.log("Received month:", month);
  const start = new Date(`${month} 1 00:00:00`);
  const end = new Date(start);
  end.setMonth(start.getMonth() + 1);
  const pieChartData = await Transaction.aggregate([
    { $match: { dateOfSale: { $gte: start, $lt: end } } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  res.json(pieChartData);
});

app.get("/combined", async (req, res) => {
  const { month } = req.query;

  const start = new Date(`${month} 1 00:00:00`);
  const end = new Date(start);
  end.setMonth(start.getMonth() + 1);

  const transactions = await Transaction.find({
    dateOfSale: { $gte: start, $lt: end },
  });

  const totalSaleAmount = await Transaction.aggregate([
    { $match: { dateOfSale: { $gte: start, $lt: end } } },
    { $group: { _id: null, total: { $sum: "$price" } } },
  ]);
  const totalSoldItems = await Transaction.countDocuments({
    dateOfSale: { $gte: start, $lt: end },
    sold: true,
  });
  const totalNotSoldItems = await Transaction.countDocuments({
    dateOfSale: { $gte: start, $lt: end },
    sold: false,
  });

  const barChartData = await Transaction.aggregate([
    { $match: { dateOfSale: { $gte: start, $lt: end } } },
    {
      $bucket: {
        groupBy: "$price",
        boundaries: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, Infinity],
        default: "901-above",
        output: { count: { $sum: 1 } },
      },
    },
  ]);

  const pieChartData = await Transaction.aggregate([
    { $match: { dateOfSale: { $gte: start, $lt: end } } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);

  res.json({
    transactions,
    statistics: {
      totalSaleAmount: totalSaleAmount[0]?.total || 0,
      totalSoldItems,
      totalNotSoldItems,
    },
    barChart: barChartData,
    pieChart: pieChartData,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
