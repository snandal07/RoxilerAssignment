import React from "react";

const TransactionTable = ({
  transactions,
  currentPage,
  transactionsPerPage,
}) => {
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Description</th>
          <th>Price</th>
          <th>Category</th>
          <th>Sold</th>
          <th>Image</th>
        </tr>
      </thead>
      <tbody>
        {currentTransactions.map((transaction) => (
          <tr key={transaction.id}>
            <td>{transaction.id}</td>
            <td>{transaction.title}</td>
            <td>{transaction.description}</td>
            <td>${transaction.price.toFixed(2)}</td>
            <td>{transaction.category}</td>
            <td>{transaction.sold ? "Yes" : "No"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TransactionTable;
