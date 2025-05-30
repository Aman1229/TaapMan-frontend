// Dashboard.js
import { Link, useNavigate } from 'react-router-dom';
import './App.css';

function Dashboard() {
  const navigate = useNavigate(); // Initialize navigate function
  const services = []; // Empty array for demo

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Taapman</h1>
        <div className="user-profile">
          <span>Hey Paresh</span>
        </div>
      </header>

      <main className="dashboard-main">
        <h2 className="greeting">How Can We Serve You!</h2>
        
        <div className="services-section">
          <h3>Select Services</h3>
          <div className="services-grid">
            <div className="service-card" onClick={() => navigate('/logistics')} style={{ cursor: 'pointer' }}>
              <h4>Logistics</h4>
              <p>Refer Vehicle</p>
            </div>
            
            <div className="service-card">
              <h4>Storage</h4>
              <p>Cold Storage</p>
            </div>

            <div className="service-card">
              <h4>Integrated</h4>
              <p>Procure, Store and Dispatch</p>
            </div>
          </div>
        </div>

        {services.length === 0 && (
          <div className="empty-state">
            <p>Empty List!</p>
            <p>We Are Waiting To Serve You!</p>
          </div>
        )}
      </main>

      <nav className="bottom-nav">
        <Link to="/" className="nav-item active">
          <span>🏠</span>Home
        </Link>
        <Link to="/enquiry" className="nav-item">
          <span>📝</span>Enquiry
        </Link>
        <Link to="/orders" className="nav-item">
          <span>📦</span>Orders
        </Link>
        <Link to="/payments" className="nav-item">
          <span>💳</span>Payments
        </Link>
        <Link to="/account" className="nav-item">
          <span>👤</span>Account
        </Link>
      </nav>
    </div>
  );
}

export default Dashboard;