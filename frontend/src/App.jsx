import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import "./App.css";
import Statistics from "./components/Statistics";
import TransactionTable from "./components/TransactionTable";
import BarChart from "./components/BarChart";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const monthMapping = {
  January: "01",
  February: "02",
  March: "03",
  April: "04",
  May: "05",
  June: "06",
  July: "07",
  August: "08",
  September: "09",
  October: "10",
  November: "11",
  December: "12",
};

function App() {
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("March"); // Default to "March"
  const [category, setCategory] = useState("");
  const [totalSales, setTotalSales] = useState(0);
  const [totalSoldItems, setTotalSoldItems] = useState(0);
  const [totalNotSoldItems, setTotalNotSoldItems] = useState(0);
  const [priceRanges, setPriceRanges] = useState({});

  useEffect(() => {
    fetchTransactions();
  }, [selectedMonth, currentPage, searchQuery, category]);

  const fetchTransactions = async () => {
    try {
      let url = `http://localhost:3000/transactions?page=${currentPage}&perPage=${transactionsPerPage}`;
      if (selectedMonth) {
        url += `&month=${selectedMonth}`;
      }
      if (searchQuery) {
        url += `&search=${searchQuery}`;
      }
      if (category) {
        url += `&category=${category}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setTransactions(data.transactions || []);
      calculateSummary(data.transactions || []);
      calculatePriceRanges(data.transactions || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const calculateSummary = (transactions) => {
    let sales = 0;
    let soldItems = 0;
    let notSoldItems = 0;

    transactions.forEach((transaction) => {
      if (transaction.sold) {
        sales += transaction.price;
        soldItems++;
      } else {
        notSoldItems++;
      }
    });

    setTotalSales(sales);
    setTotalSoldItems(soldItems);
    setTotalNotSoldItems(notSoldItems);
  };

  const calculatePriceRanges = (transactions) => {
    const ranges = {
      "0-100": 0,
      "100-500": 0,
      "500-1000": 0,
      "1000-5000": 0,
      "5000+": 0,
    };

    transactions.forEach((transaction) => {
      if (transaction.price <= 100) {
        ranges["0-100"]++;
      } else if (transaction.price <= 500) {
        ranges["100-500"]++;
      } else if (transaction.price <= 1000) {
        ranges["500-1000"]++;
      } else if (transaction.price <= 5000) {
        ranges["1000-5000"]++;
      } else {
        ranges["5000+"]++;
      }
    });

    setPriceRanges(ranges);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleMonthChange = (event) => {
    const selectedMonth = event.target.value;
    setSelectedMonth(selectedMonth);
    setCurrentPage(1);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    setCurrentPage(1);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const barData = {
    labels: ["0-100", "100-500", "500-1000", "1000-5000", "5000+"],
    datasets: [
      {
        label: "Number of Items",
        data: Object.values(priceRanges),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  return (
    <div className="container">
      <h1>Transaction Dashboard</h1>
      <div className="search-filter">
        <input
          type="text"
          placeholder="Search Transaction"
          value={category}
          onChange={handleCategoryChange}
        />
        <select value={selectedMonth} onChange={handleMonthChange}>
          <option value="">Select Month</option>
          {Object.keys(monthMapping).map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>

      <TransactionTable
        transactions={transactions}
        currentPage={currentPage}
        transactionsPerPage={transactionsPerPage}
      />

      <BarChart barData={barData} />

      <Statistics
        totalSales={totalSales}
        totalSoldItems={totalSoldItems}
        totalNotSoldItems={totalNotSoldItems}
      />

      <div className="pagination">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={
            currentPage === Math.ceil(transactions.length / transactionsPerPage)
          }
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default App;
