import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; // Default import
import { estimatesApi } from '../api/axios'; // Named import for estimatesApi
import './App.css';

function Logistics() {
  const [selectedService, setSelectedService] = useState(null);
  const navigate = useNavigate();

  const services = [
    {
      id: 1,
      title: 'Part Load',
      description: 'Small quantity transport (1-5 tons)',
      form: <PartLoadForm onBack={() => setSelectedService(null)} />
    },
    {
      id: 2,
      title: 'Full Truck Load',
      description: 'Large volume transport',
      form: <FullTruckForm onBack={() => setSelectedService(null)} />
    },
    {
      id: 3,
      title: 'Monthly Dedicated Vehicle',
      description: 'Fixed vehicle for your route',
      form: <DedicatedVehicleForm onBack={() => setSelectedService(null)} />
    }
  ];

  return (
    <div className="logistics-container">
      <div className="service-header">
        <h1>Logistics</h1>
        <h2>Move Anything With Us</h2>
        <button className="back-button" onClick={() => navigate(-1)}>
          &larr; Back
        </button>
      </div>

      {!selectedService ? (
        <div className="service-options">
          <h3>Choose Logistics</h3>
          {services.map((service) => (
            <div 
              key={service.id}
              className="service-card"
              onClick={() => setSelectedService(service)}
            >
              <h4>{service.title}</h4>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      ) : (
        selectedService.form
      )}

      <nav className="bottom-nav">
        {/* Add your navigation links here */}
      </nav>
    </div>
  );
}

// Common form submission handler
const handleFormSubmit = async (formData, serviceType, navigate, onBack) => {
  try {
    const distanceResponse = await api.get('/maps/distance', {
      params: {
        pickup: formData.pickupLocation,
        drop: formData.dropLocation
      }
    });

    // Handle backend error responses
    if (distanceResponse.data.error) {
      throw new Error(distanceResponse.data.error);
    }

    // Get pricing configuration from backend
    const pricingResponse = await api.get('/estimates/pricing/config');
    const pricingConfig = pricingResponse.data;

    // Convert form data to proper types
    const distanceKm = distanceResponse.data.distance.value / 1000;
    const quantity = parseInt(formData.quantity);
    const temperature = parseInt(formData.temperature);

    // Calculate base price
    const serviceRate = pricingConfig[serviceType]?.rate || 25; // Default 25/km
    let basePrice = distanceKm * serviceRate;

    // Apply vehicle multiplier
    const vehicleMultiplier = pricingConfig.vehicles?.[formData.vehicleType] || 1;
    basePrice *= vehicleMultiplier;

    // Apply temperature control multiplier
    const tempMultiplier = temperature < 5 ? pricingConfig.temperatureMultiplier || 1.2 : 1;
    basePrice *= tempMultiplier;

    // Apply product type multiplier
    const productMultiplier = pricingConfig.products?.[formData.productType] || 1;
    basePrice *= productMultiplier;

    // Apply quantity discount
    if (quantity > 5) {
      basePrice *= pricingConfig.bulkDiscount || 0.9;
    }

    // Calculate delivery days (1 day per 500km)
    const estimatedDeliveryDays = Math.ceil(distanceKm / 500);

    // Prepare result data
    const resultData = {
      serviceType: serviceType.replace('_', ' '),
      vehicleType: formData.vehicleType.replace(/(part|full|dedicated)-/i, ''),
      totalPrice: basePrice.toFixed(2),
      productType: formData.productType,
      estimatedDeliveryDays,
      breakdown: {
        basePrice: (distanceKm * serviceRate).toFixed(2),
        distance: distanceKm.toFixed(0),
        vehicleMultiplier,
        tempMultiplier,
        productMultiplier
      },
      duration: distanceResponse.data.duration,
      distance: distanceResponse.data.distance
    };
    navigate('/estimation-result', { state: resultData });
    
  } catch (error) {
    console.error('Estimation error:', error);
    alert(error.response?.data?.error || error.message || 'Estimation calculation failed');
    onBack();
  }
};

// Modified Part Load Form
const PartLoadForm = ({ onBack }) => {
  // For all form components (PartLoadForm, FullTruckForm, DedicatedVehicleForm)
  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropLocation: '',
    pickupDate: '',
    dropDate: '',
    vehicleType: '',
    temperature: '',  // Changed from undefined to empty string
    quantity: '',
    productType: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.pickupLocation || !formData.dropLocation) {
        throw new Error('Please enter both pickup and drop locations');
      }

      if (new Date(formData.dropDate) < new Date(formData.pickupDate)) {
        throw new Error('Drop date cannot be before pickup date');
      }

    await handleFormSubmit(formData, 'PART_LOAD', navigate, onBack);
    } catch (error) {
      console.error('Failed to get distance:', error.message);
      alert('Unable to fetch distance. Please check location inputs.');
    }
  };

  return (
    <form className="logistics-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h3>Part Load Request</h3>
        <button type="button" onClick={onBack} className="back-button">
          &larr; Back to Services
        </button>
      </div>

      <div className="form-section">
        <h4>Destination</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Pickup Location</label>
            <input
              type="text"
              required
              value={formData.pickupLocation}
              onChange={(e) => setFormData({...formData, pickupLocation: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Drop Location</label>
            <input
              type="text"
              required
              value={formData.dropLocation}
              onChange={(e) => setFormData({...formData, dropLocation: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Date</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Pickup Date</label>
            <input
              type="date"
              required
              value={formData.pickupDate}
              onChange={(e) => setFormData({...formData, pickupDate: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Drop Date</label>
            <input
              type="date"
              required
              value={formData.dropDate}
              onChange={(e) => setFormData({...formData, dropDate: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Vehicle & Requirements</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Select Vehicle</label>
            <select
              required
              value={formData.vehicleType}
              onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
            >
              <option value="">Choose Vehicle</option>
              <option value="chiller">Chiller</option>
              <option value="frozen">Frozen</option>
            </select>
          </div>
          <div className="form-group">
              <label>Temperature Control</label>
              <input
                type="number"
                min="-10"
                required
                value={formData.temperature}
                onChange={(e) => setFormData({...formData, temperature: e.target.value})}                
              />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Packaging Details</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Quantity of Loads</label>
            <input
              type="number"
              min="1"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Product Type</label>
            <select
              required
              value={formData.productType}
              onChange={(e) => setFormData({...formData, productType: e.target.value})}
            >
              <option value="">Select Product Type</option>
              <option value="perishable">Perishable Goods</option>
              <option value="fragile">Fragile Items</option>
              <option value="general">General Merchandise</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="primary-button">
          Get Estimation
        </button>
      </div>
    </form>
  );
};

// Modified Full Truck Form
const FullTruckForm = ({ onBack }) => {
  // For all form components (PartLoadForm, FullTruckForm, DedicatedVehicleForm)
  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropLocation: '',
    pickupDate: '',
    dropDate: '',
    vehicleType: '',
    temperature: '',  // Changed from undefined to empty string
    quantity: '',
    productType: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleFormSubmit(formData, 'FULL_TRUCK', navigate, onBack);
  };
  
    return (
      <form className="logistics-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <h3>Full Truck Load</h3>
          <button type="button" onClick={onBack} className="back-button">
            &larr; Back to Services
          </button>
        </div>
  
        <div className="form-section">
          <h4>Destination</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Pickup Location</label>
              <input
                type="text"
                required
                value={formData.pickupLocation}
                onChange={(e) => setFormData({...formData, pickupLocation: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Drop Location</label>
              <input
                type="text"
                required
                value={formData.dropLocation}
                onChange={(e) => setFormData({...formData, dropLocation: e.target.value})}
              />
            </div>
          </div>
        </div>
  
        <div className="form-section">
          <h4>Date</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Pickup Date</label>
              <input
                type="date"
                required
                value={formData.pickupDate}
                onChange={(e) => setFormData({...formData, pickupDate: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Drop Date</label>
              <input
                type="date"
                required
                value={formData.dropDate}
                onChange={(e) => setFormData({...formData, dropDate: e.target.value})}
              />
            </div>
          </div>
        </div>
  
        <div className="form-section">
          <h4>Vehicle & Requirements</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Select Vehicle</label>
              <select
                required
                value={formData.vehicleType}
                onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
              >
                <option value="">Choose Vehicle</option>
                <option value="chiller">Chiller</option>
                <option value="frozen">Frozen</option>
              </select>
            </div>
            <div className="form-group">
              <label>Temperature Control</label>
              <input
                type="number"
                min="-10"
                required
                value={formData.temperature}
                onChange={(e) => setFormData({...formData, temperature: e.target.value})}                
              />
            </div>
          </div>
        </div>
  
        <div className="form-section">
          <h4>Packaging Details</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Quantity of Loads</label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Product Type</label>
              <select
                required
                value={formData.productType}
                onChange={(e) => setFormData({...formData, productType: e.target.value})}
              >
                <option value="">Select Product Type</option>
                <option value="perishable">Perishable Goods</option>
                <option value="fragile">Fragile Items</option>
                <option value="general">General Merchandise</option>
              </select>
            </div>
          </div>
        </div>
  
        <div className="form-actions">
          <button type="submit" className="primary-button">
            Get Estimation
          </button>
        </div>
      </form>
    );
  };

// Modified Dedicated Vehicle Form
const DedicatedVehicleForm = ({ onBack }) => {
  // For all form components (PartLoadForm, FullTruckForm, DedicatedVehicleForm)
  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropLocation: '',
    pickupDate: '',
    dropDate: '',
    vehicleType: '',
    temperature: '',  // Changed from undefined to empty string
    quantity: '',
    productType: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleFormSubmit(formData, 'DEDICATED', navigate, onBack);
  };
  
    return (
      <form className="logistics-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <h3>Monthly Dedicated Vehicle</h3>
          <button type="button" onClick={onBack} className="back-button">
            &larr; Back to Services
          </button>
        </div>
  
        <div className="form-section">
          <h4>Destination</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Pickup Location</label>
              <input
                type="text"
                required
                value={formData.pickupLocation}
                onChange={(e) => setFormData({...formData, pickupLocation: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Drop Location</label>
              <input
                type="text"
                required
                value={formData.dropLocation}
                onChange={(e) => setFormData({...formData, dropLocation: e.target.value})}
              />
            </div>
          </div>
        </div>
  
        <div className="form-section">
          <h4>Date</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Pickup Date</label>
              <input
                type="date"
                required
                value={formData.pickupDate}
                onChange={(e) => setFormData({...formData, pickupDate: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Drop Date</label>
              <input
                type="date"
                required
                value={formData.dropDate}
                onChange={(e) => setFormData({...formData, dropDate: e.target.value})}
              />
            </div>
          </div>
        </div>
  
        <div className="form-section">
          <h4>Vehicle & Requirements</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Select Vehicle</label>
              <select
                required
                value={formData.vehicleType}
                onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
              >
                <option value="">Choose Vehicle</option>
                <option value="chiller">Chiller</option>
                <option value="frozen">Frozen</option>
              </select>
            </div>
            <div className="form-group">
              <label>Temperature Control</label>
              <input
                type="number"
                min="-10"
                required
                value={formData.temperature}
                onChange={(e) => setFormData({...formData, temperature: e.target.value})}                
              />
            </div>
          </div>
        </div>
  
        <div className="form-section">
          <h4>Packaging Details</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Quantity of Loads</label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Product Type</label>
              <select
                required
                value={formData.productType}
                onChange={(e) => setFormData({...formData, productType: e.target.value})}
              >
                <option value="">Select Product Type</option>
                <option value="perishable">Perishable Goods</option>
                <option value="fragile">Fragile Items</option>
                <option value="general">General Merchandise</option>
              </select>
            </div>
          </div>
        </div>
  
        <div className="form-actions">
          <button type="submit" className="primary-button">
            Get Estimation
          </button>
        </div>
      </form>
    );
  };

// Add similar components for FullTruckForm and DedicatedVehicleForm

export default Logistics;