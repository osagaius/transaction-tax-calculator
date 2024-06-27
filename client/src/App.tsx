import React from 'react';
import TotalPricePerCityChart from './TotalPricePerCityChart';
import TransactionDetails from './TransactionDetails';

const App: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center my-4">Total Tax Liability Per Region</h1>
      <TotalPricePerCityChart />
      <h1 className="text-4xl font-bold text-center my-4">Transaction Tax Details</h1>
      <TransactionDetails />
    </div>
  );
};

export default App;
