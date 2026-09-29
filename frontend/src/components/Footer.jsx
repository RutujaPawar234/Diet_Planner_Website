import { Link } from 'react-router-dom';
import Logo from './Logo';
import { DISCLAIMER } from '../utils/constants';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div>
            <Logo />
            <p className="footer-note">
              Personalised diet planning, calorie tracking and progress insights — in one clean, simple place.
            </p>
          </div>
          <div className="footer-links">
            <div>
              <h4>Product</h4>
              <a href="/#features">Features</a>
              <a href="/#how-it-works">How it works</a>
              <Link to="/calculator">BMI & calorie calculator</Link>
            </div>
            <div>
              <h4>Account</h4>
              <Link to="/register">Create account</Link>
              <Link to="/login">Log in</Link>
              <Link to="/dashboard">Dashboard</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} NutriPlan. Built with the MERN stack.</span>
          <span>{DISCLAIMER}</span>
        </div>
      </div>
    </footer>
  );
}
