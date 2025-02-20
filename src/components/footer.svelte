<script>
  import { APP_NAME } from '$lib/config';
</script>

<footer>
  <div class="footer-container">
    <div class="footer-section main-section">
      <div class="logo">
        <h3>
          <span class="job">Job</span><span class="finder">Finder</span>
        </h3>
      </div>
      <p>Find your next job opportunity</p>
      <div class="social-links">
        <a href="https://twitter.com/jobfinder" aria-label="Twitter">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
          </svg>
        </a>
        <a href="https://linkedin.com/company/jobfinder" aria-label="LinkedIn">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
          </svg>
        </a>
        <a href="https://facebook.com/jobfinder" aria-label="Facebook">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"/>
          </svg>
        </a>
      </div>
    </div>

    <div class="footer-section">
      <h4>For Job Seekers</h4>
      <ul>
        <li><a href="/jobs">Browse Jobs</a></li>
        <li><a href="/companies">Companies</a></li>
        <li><a href="/salary">Salary Guide</a></li>
        <li><a href="/career-advice">Career Advice</a></li>
      </ul>
    </div>

    <div class="footer-section">
      <h4>For Employers</h4>
      <ul>
        <li><a href="/post-job">Post a Job</a></li>
        <li><a href="/pricing">Pricing</a></li>
        <li><a href="/employer-resources">Resources</a></li>
        <li><a href="/employer-blog">Employer Blog</a></li>
      </ul>
    </div>

    <div class="footer-section">
      <h4>Company</h4>
      <ul>
        <li><a href="/about">About Us</a></li>
        <li><a href="/contact">Contact</a></li>
        <li><a href="/privacy">Privacy Policy</a></li>
        <li><a href="/terms">Terms of Use</a></li>
      </ul>
    </div>
  </div>

  <div class="footer-bottom">
    <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
  </div>
</footer>

<style>
  footer {
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
    gap: 3rem;
  }

  .main-section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .logo {
    margin-bottom: 1rem;
  }

  .logo h3 {
    font-family: serif;
    font-size: 1.75rem;
    font-weight: bold;
    margin-bottom: 1rem;
  }

  .job {
    color: #333;
  }

  .finder {
    color: #6355FF;
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
  }

  .social-links a:hover {
    color: #6355FF;
  }

  .footer-section h4 {
    color: #333;
    margin-bottom: 1.25rem;
    font-weight: 600;
    font-size: 1.1rem;
  }

  .footer-section ul {
    list-style: none;
    padding: 0;
  }

  .footer-section ul li {
    margin-bottom: 0.75rem;
  }

  .footer-section ul li a {
    color: #666;
    text-decoration: none;
    transition: color 0.2s ease;
    font-size: 0.95rem;
  }

  .footer-section ul li a:hover {
    color: #6355FF;
  }

  .footer-bottom {
    max-width: 1200px;
    margin: 3rem auto 0;
    padding: 2rem 2rem 0;
    border-top: 1px solid #e0e0e0;
    text-align: center;
    color: #666;
    font-size: 0.9rem;
  }

  @media (max-width: 1024px) {
    .footer-container {
      grid-template-columns: repeat(2, 1fr);
    }

    .main-section {
      grid-column: 1 / -1;
      text-align: center;
      align-items: center;
    }
  }

  @media (max-width: 768px) {
    footer {
      padding: 3rem 0 1rem;
    }

    .footer-container {
      padding: 0 1rem;
      gap: 2rem;
    }

    .footer-bottom {
      margin-top: 2rem;
      padding: 1rem 1rem 0;
    }
  }

  @media (max-width: 480px) {
    .footer-container {
      grid-template-columns: 1fr;
    }

    .main-section {
      margin-bottom: 1rem;
    }
  }
</style> 