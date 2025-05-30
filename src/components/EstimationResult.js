import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './App.css';

function EstimationResult() {
  const { state } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="estimation-container">
      <h2>Price Estimation Details</h2>
      
      <div className="estimation-card">
        <div className="estimation-header">
          <h3>{state?.serviceType.replace('_', ' ')} Service</h3>
          <p>Vehicle Type: {state?.vehicleType}</p>
        </div>

        <div className="price-section">
          <div className="total-price">
            <span>Total Estimated Price:</span>
            <h2>₹{state?.totalPrice?.toLocaleString()}</h2>
          </div>

          <div className="breakdown">
            <h4>Price Breakdown</h4>
            <ul>
              <li>Base Price: ₹{state?.breakdown?.basePrice?.toLocaleString()}</li>
              <li>Distance: {state?.breakdown?.distance} km</li>
              <li>Vehicle Multiplier: {state?.breakdown?.vehicleMultiplier}x</li>
              <li>Temperature Multiplier: {state?.breakdown?.tempMultiplier}x</li>
              <li>Product Multiplier: {state?.breakdown?.productMultiplier}x</li>
            </ul>
          </div>
        </div>

        <div className="delivery-info">
          <p>Estimated Delivery Days: {state?.estimatedDeliveryDays}</p>
          <p>Product Type: {state?.productType}</p>
        </div>

        <button 
          className="back-button"
          onClick={() => navigate(-1)}
        >
          ← Back to Services
        </button>
      </div>
    </div>
  );
}

export default EstimationResult;