import { Link } from 'react-router-dom'
import '../styles/footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <span>🎓</span>
              Teach<strong>ify</strong>
            </Link>
            <p>Learn in-demand skills from world-class instructors. Start your journey today.</p>
            <div className="footer__social">
              {['T', 'L', 'Y', 'G'].map(s => (
                <a key={s} href="#" className="footer__social-link">{s}</a>
              ))}
            </div>
          </div>

          <div className="footer__col">
            <h4>For Learners</h4>
            <Link to="/courses">Browse Courses</Link>
            <Link to="/courses?category=Web Development">Web Dev</Link>
            <Link to="/courses?category=Data Science">Data Science</Link>
            <Link to="/signup">Sign Up Free</Link>
          </div>

          <div className="footer__col">
            <h4>For Instructors</h4>
            <Link to="/signup?role=seller">Become an Instructor</Link>
            <Link to="/seller">Instructor Dashboard</Link>
            <a href="#">Teaching Center</a>
            <a href="#">Instructor FAQ</a>
          </div>

          <div className="footer__col">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Blog</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© 2024 Teachify, Inc. All rights reserved.</p>
          <div className="footer__legal">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  )
}