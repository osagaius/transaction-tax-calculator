// App.tsx
import React from 'react';
import TotalPricePerCityChart from './TotalPricePerCityChart';
import TransactionDetails from './TransactionDetails';

const App: React.FC = () => {
  return (
    <div>
      <h1>Total Tax Liability Per Region</h1>
      <br></br>

      <TotalPricePerCityChart />
      <br></br>
      <br></br>
      <h1>Transaction Tax Details</h1>
      <br></br>

      <TransactionDetails />
    </div>
  );
};

export default App;
