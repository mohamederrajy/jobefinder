<footer class="footer">
  <div class="footer-container">
    <div class="footer-section main-section">
      <div class="logo">
        <img src="/static/images/logojob.png" alt="Visavar Logo" class="logo-image" />
        <div class="tagline">
          <p>Find your next job opportunity</p>
          <p class="subtitle">Join millions of people finding their perfect job match</p>
        </div>
      </div>

      <div class="social-links">
        <a href="https://linkedin.com/company/visavar" aria-label="LinkedIn">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
          </svg>
        </a>
        <a href="https://twitter.com/visavar" aria-label="Twitter">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
          </svg>
        </a>
      </div>
    </div>

    <div class="footer-section">
      <h3>For Job Seekers</h3>
      <ul>
        <li><a href="/dashboard">Browse Jobs</a></li>
        <li><a href="/companies">Companies</a></li>
        <li><a href="/salary-calculator">Salary Calculator</a></li>
        <li><a href="/career-advice">Career Advice</a></li>
      
      </ul>
    </div>

    <div class="footer-section">
      <h3>For Employers</h3>
      <ul>
        <li><a href="/post-job">Post a Job</a></li>
        <li><a href="/pricing">Pricing</a></li>
        <li><a href="/resources">Resources</a></li>
        <li><a href="/talent-solutions">Talent Solutions</a></li>
        <li><a href="/contact-sales">Contact Sales</a></li>
      </ul>
    </div>

    <div class="footer-section">
      <h3>Company</h3>
      <ul>
        <li><a href="/about">About Us</a></li>
        <li><a href="/contact">Contact</a></li>
        <li><a href="/privacy">Privacy Policy</a></li>
        <li><a href="/terms">Terms of Use</a></li>
        <li><a href="/help">Help Center</a></li>
      </ul>
    </div>
  </div>

  <div class="footer-bottom">
    <div class="legal-links">
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
 
      <button class="privacy-choices">Your Privacy Choices</button>
    </div>

    <div class="copyright">
      © {new Date().getFullYear()} Visavar. All rights reserved.
    </div>
  </div>
</footer>

<style>
  .footer {
    background: #f8f9fa;
    padding: 4rem 0 2rem;
    margin-top: auto;
    border-top: 1px solid #e0e0e0;
  }

  .footer-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: grid;
    grid-template-columns: 1.5fr 1fr 1fr 1fr;
    gap: 4rem;
  }

  .main-section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .logo {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .logo-image {
    height: 45px;
    width: auto;
    object-fit: contain;
  }

  .logo p {
    color: #666;
    font-size: 1.1rem;
  }

  .social-links {
    display: flex;
    gap: 1rem;
  }

  .social-links a {
    color: #666;
    transition: color 0.2s ease;
    padding: 0.5rem;
    border-radius: 50%;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .social-links a:hover {
    color: #6355FF;
    background: #e8e8e8;
  }

  .footer-section h3 {
    color: #333;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .footer-section ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .footer-section li {
    margin-bottom: 0.75rem;
  }

  .footer-section a {
    color: #666;
    text-decoration: none;
    font-size: 0.95rem;
    transition: color 0.2s;
  }

  .footer-section a:hover {
    color: #6355FF;
  }

  .footer-bottom {
    max-width: 1200px;
    margin: 3rem auto 0;
    padding: 2rem 2rem 0;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .legal-links {
    display: flex;
    gap: 2rem;
  }

  .legal-links a,
  .privacy-choices {
    color: #666;
    text-decoration: none;
    font-size: 0.85rem;
  }

  .privacy-choices {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-size: 0.85rem;
  }

  .copyright {
    color: #999;
    font-size: 0.85rem;
  }

  .tagline {
    margin-top: 1rem;
  }

  .tagline p {
    color: #666;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }

  .tagline .subtitle {
    font-size: 0.95rem;
    opacity: 0.8;
  }

  @media (max-width: 1024px) {
    .footer-container {
      grid-template-columns: repeat(2, 1fr);
      gap: 3rem;
    }

    .main-section {
      grid-column: 1 / -1;
      text-align: center;
      align-items: center;
    }

    .logo {
      align-items: center;
    }
    
    .logo-image {
      height: 40px;
    }
  }

  @media (max-width: 768px) {
    .footer {
      padding: 3rem 1.5rem 1.5rem;
    }

    .footer-bottom {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }

    .legal-links {
      justify-content: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
  }

  @media (max-width: 480px) {
    .footer-container {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .footer-section {
      text-align: center;
    }

    .social-links {
      justify-content: center;
    }

    .logo-image {
      height: 35px;
    }
  }
</style> 