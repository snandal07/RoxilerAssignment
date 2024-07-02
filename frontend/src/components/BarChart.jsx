import React from "react";
import { Bar } from "react-chartjs-2";

const BarChart = ({ barData }) => {
  return <Bar data={barData} />;
};

export default BarChart;
