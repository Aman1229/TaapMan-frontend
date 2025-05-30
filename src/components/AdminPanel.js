import { useState, useEffect } from 'react';
import { estimatesApi } from '../api/axios';

function AdminPanel() {
  const [pricing, setPricing] = useState([]);
  const [editedPrices, setEditedPrices] = useState({});

  useEffect(() => {
    const loadPricing = async () => {
      try {
        const response = await estimatesApi.getPricing();
        setPricing(response.data);
      } catch (error) {
        console.error('Failed to load pricing:', error);
      }
    };
    loadPricing();
  }, []);

  const handleUpdate = async (serviceType) => {
    try {
      const response = await estimatesApi.updatePricing(
        serviceType,
        editedPrices[serviceType]
      );
      setPricing(pricing.map(p => 
        p.serviceType === serviceType ? response.data : p
      ));
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  return (
    <div className="admin-panel">
      <h2>Pricing Configuration</h2>
      {pricing.map((config) => (
        <div key={config.serviceType} className="price-config">
          <h3>{config.serviceType.replace('_', ' ')}</h3>
          
          <div className="form-group">
            <label>Base Price (₹)</label>
            <input
              type="number"
              value={editedPrices[config.serviceType]?.basePrice || config.basePrice}
              onChange={(e) => setEditedPrices({
                ...editedPrices,
                [config.serviceType]: {
                  ...editedPrices[config.serviceType],
                  basePrice: parseFloat(e.target.value)
                }
              })}
            />
          </div>

          <button 
            className="update-button"
            onClick={() => handleUpdate(config.serviceType)}
          >
            Update Pricing
          </button>
        </div>
      ))}
    </div>
  );
}

export default AdminPanel;