<script>
  import { onMount } from 'svelte';

  let isVisible = true;
</script>

<div class="features">
  <div class="feature-item">
    <div class="feature-image">
      <img 
        src="/images/african-american-business-man-suit.jpg" 
        alt="Jobs find you"
        loading="lazy"
      />
    </div>
    <div class="feature-content">
      <h2>Let the jobs find you</h2>
      <p>Create your free profile to get interview invites and jobs that work for you.</p>
      <a href="/dashboard" class="feature-button">Get Started</a>
    </div>
  </div>

  <div class="feature-item">
    <div class="feature-content">
      <h2>Your job is personal</h2>
      <p>Tell us more about your goals and we'll match you with the right jobs to help you reach them.</p>
      <a href="/dashboard" class="feature-button">See jobs</a>
    </div>
    <div class="feature-image">
      <img 
        src="/images/three-young-women-talking-laughing-street.jpg"
        alt="Personal job search"
        loading="lazy"
      />
    </div>
  </div>

  <div class="feature-item">
    <div class="feature-image">
      <img 
        src="/images/joyful-girl-office-worker-shows-ok-sign-portrait-woman-pants-light-blouse-workplace.jpg"
        alt="Skip paperwork"
        loading="lazy"
      />
    </div>
    <div class="feature-content">
      <h2>Skip the paperwork</h2>
      <p>Your profile is your application. Apply to jobs instantly.</p>
      <a href="/dashboard/profile " class="feature-button">Create profile</a>
    </div>
  </div>

  <div class="feature-item">
    <div class="feature-content">
      <h2>Ready to level-up?</h2>
      <p>Excel with our Jobs Hub. Find tips to get ahead and make your goals a reality.</p>
      <a href="/  dashboard" class="feature-button">Learn more</a>
    </div>
    <div class="feature-image">
      <img 
        src="/images/pretty-gorgeous-woman-use-spray-eyes-feeling-good-after-long-laptop-use-sitting-home.jpg"
        alt="Level up your career"
        loading="lazy"
      />
    </div>
  </div>
</div>

<style>
  .features {
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
  }

  .feature-item {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 600px;
    background: #fff;
  }

  .feature-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 4rem 8rem 4rem 4rem;
  }

  .feature-item:nth-child(2) .feature-content {
    padding: 4rem 4rem 4rem 8rem;
  }

  h2 {
    font-size: 3.5rem;
    font-family: serif;
    font-weight: 500;
    color: #111;
    margin-bottom: 1.5rem;
    line-height: 1.1;
  }

  p {
    font-size: 1.25rem;
    color: #555;
    margin-bottom: 2rem;
    line-height: 1.5;
    max-width: 90%;
  }

  .feature-button {
    display: inline-block;
    background: #6355FF;
    color: white;
    padding: 1rem 2.5rem;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 500;
    font-size: 1.1rem;
    width: fit-content;
  }

  .feature-image {
    height: 100%;
    width: 100%;
    position: relative;
    overflow: hidden;
    background: #f5f5f5;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  @media (max-width: 1200px) {
    .feature-content,
    .feature-item:nth-child(2) .feature-content {
      padding: 4rem;
    }

    h2 {
      font-size: 3rem;
    }
  }

  @media (max-width: 768px) {
    .feature-item {
      grid-template-columns: 1fr;
      min-height: auto;
    }

    .feature-content,
    .feature-item:nth-child(2) .feature-content {
      padding: 3rem 2rem;
      text-align: center;
      order: 1;
    }

    .feature-image {
      height: 400px;
      order: 2;
    }

    p {
      max-width: 100%;
      margin-bottom: 1.5rem;
    }

    .feature-button {
      margin: 0 auto;
    }

    .feature-item:nth-child(3),
    .feature-item:nth-child(4) {
      margin-top: 2rem;
    }
  }

  @media (max-width: 480px) {
    .feature-content,
    .feature-item:nth-child(2) .feature-content {
      padding: 2rem 1.5rem;
    }

    h2 {
      font-size: 2.5rem;
    }

    p {
      font-size: 1.1rem;
    }

    .feature-image {
      height: 300px;
    }
  }
</style> 