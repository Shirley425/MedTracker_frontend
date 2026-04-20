import { Link } from "react-router-dom";
import './Navbar.css';
import { useAuth } from "../../AuthContext";

const Navbar = () => {
  const { currentUser, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="logo">MedTracker</div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/features">Features</Link></li>
        <li><Link to="/openfda">OpenFDA</Link></li>
        <li><Link to="/about">About Us</Link></li>
        {currentUser ? (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li>
              <button type="button" className="nav-button" onClick={logout}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <li><Link to="/login">Login</Link></li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
