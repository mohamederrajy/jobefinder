<footer class="footer">
  <div class="footer-content">
    <div class="footer-section">
      <h3>Job Seekers</h3>
      <ul>
        <li><a href="/jobs-hub">Explore our Jobs Hub</a></li>
        <li><a href="/browse-jobs">Browse Jobs</a></li>
        <li><a href="/salary-calculator">Salary Calculator</a></li>
        <li><a href="/blog">Visit our Job Advice Blog</a></li>
        <li><a href="/security">Learn about Security</a></li>
        <li><a href="/contact">Contact Us</a></li>
      </ul>
    </div>

    <div class="footer-section">
      <h3>Employers</h3>
      <ul>
        <li><a href="/enterprise">Enterprise Solutions</a></li>
        <li><a href="/small-business">Small Business</a></li>
        <li><a href="/why-us">Why Sneagajob?</a></li>
        <li><a href="/recruiting">Recruiting and Hiring Advice</a></li>
        <li><a href="/contact-employers">Contact Us</a></li>
      </ul>
    </div>

    <div class="footer-section">
      <h3>About</h3>
      <ul>
        <li><a href="/careers">Careers</a></li>
        <li><a href="/about">About Sneagajob</a></li>
      </ul>
    </div>

    <div class="footer-section app-section">
      <div class="app-downloads">
        <a href="https://apps.apple.com" class="app-button">
          <img src="/images/app-store-badge.svg" alt="Download on the App Store" />
        </a>
        <a href="https://play.google.com" class="app-button">
          <img src="/images/google-play-badge.svg" alt="Get it on Google Play" />
        </a>
      </div>
    </div>
  </div>

  <div class="footer-bottom">
    <div class="social-links">
      <a href="https://facebook.com" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
      <a href="https://twitter.com" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
      <a href="https://instagram.com" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
      <a href="https://youtube.com" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
    </div>

    <div class="legal-links">
      <a href="/legal">Legal Information</a>
      <a href="/terms">Terms</a>
      <a href="/privacy">Privacy</a>
      <button class="privacy-choices">Your Privacy Choices</button>
      <a href="/california-privacy">California Privacy Notice</a>
    </div>

    <div class="copyright">
      © 2025 Sneagajob.com, Inc. All rights reserved.
    </div>
  </div>
</footer>

<style>
  .footer {
    background: #f8f8f8;
    padding: 4rem 2rem 2rem;
  }

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
  }

  .footer-section h3 {
    color: #333;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
  }

  .footer-section ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .footer-section li {
    margin-bottom: 1rem;
  }

  .footer-section a {
    color: #666;
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.2s;
  }

  .footer-section a:hover {
    color: #6355FF;
  }

  .app-section {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .app-downloads {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .app-button img {
    height: 40px;
    width: auto;
  }

  .footer-bottom {
    max-width: 1200px;
    margin: 3rem auto 0;
    padding-top: 2rem;
    border-top: 1px solid #eee;
  }

  .social-links {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .social-links a {
    color: #666;
    font-size: 1.2rem;
  }

  .legal-links {
    display: flex;
    gap: 2rem;
    margin-bottom: 1rem;
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

  @media (max-width: 1024px) {
    .footer-content {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .footer {
      padding: 3rem 1.5rem 1.5rem;
    }

    .legal-links {
      flex-wrap: wrap;
      gap: 1rem;
    }
  }

  @media (max-width: 480px) {
    .footer-content {
      grid-template-columns: 1fr;
    }

    .app-section {
      align-items: center;
    }

    .social-links,
    .legal-links {
      justify-content: center;
    }

    .copyright {
      text-align: center;
    }
  }
</style> 