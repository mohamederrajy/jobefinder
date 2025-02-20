<script>
  import { APP_NAME } from '$lib/config';
</script>

<nav>
  <div class="nav-container">
    <a href="/" class="logo">
      <span class="logo-text">{APP_NAME}</span>
    </a>
    
    <div class="nav-links">
      <a href="/jobs">Find Jobs</a>
      <a href="/companies">Companies</a>
      <a href="/salary">Salary Guide</a>
      <div class="auth-buttons">
        <a href="/login" class="login-btn">Log in</a>
        <a href="/signup" class="signup-btn">Sign up</a>
      </div>
    </div>
  </div>
</nav>

<style>
  nav {
    background: white;
    border-bottom: 1px solid #e0e0e0;
    padding: 1rem 0;
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 100;
  }

  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    text-decoration: none;
  }

  .logo-text {
    color: #6355FF;
    font-size: 1.5rem;
    font-weight: bold;
    font-family: serif;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .nav-links a {
    color: #333;
    text-decoration: none;
    font-weight: 500;
  }

  .auth-buttons {
    display: flex;
    gap: 1rem;
    margin-left: 2rem;
  }

  .login-btn {
    padding: 0.5rem 1rem;
  }

  .signup-btn {
    padding: 0.5rem 1.5rem;
    background: #6355FF;
    color: white !important;
    border-radius: 50px;
  }

  @media (max-width: 768px) {
    .nav-container {
      padding: 0 1rem;
    }

    .nav-links {
      gap: 1rem;
    }
  }
</style> 