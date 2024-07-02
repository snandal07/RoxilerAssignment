const mongoose = require("mongoose");
const axios = require("axios");

mongoose.connect(
  "mongodb+srv://sahilnandalsahil:iMBORZhAPMlZIlGU@cluster0.njdpjd7.mongodb.net/transactions?retryWrites=true&w=majority&appName=Cluster0"
);

const transactionSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  price: Number,
  dateOfSale: Date,
  category: String,
  sold: Boolean,
});

const Transaction = mongoose.model("Transaction", transactionSchema);

const initializeDatabase = async () => {
  const response = await axios.get(
    "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
  );
  const transactions = response.data;
  await Transaction.deleteMany({});
  await Transaction.insertMany(transactions);
};

module.exports = { Transaction, initializeDatabase };
