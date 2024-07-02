import React from "react";

const Statistics = ({ totalSales, totalSoldItems, totalNotSoldItems }) => {
  return (
    <div className="summary">
      <div>Total Sales: ${totalSales.toFixed(2)}</div>
      <div>Total Sold Items: {totalSoldItems}</div>
      <div>Total Not Sold Items: {totalNotSoldItems}</div>
    </div>
  );
};

export default Statistics;
