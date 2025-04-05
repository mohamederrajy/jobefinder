<script lang="ts">
  import { onMount } from 'svelte';
  import { user, updateUserProfile } from '../../../stores/userStore';
  import { subscription } from '../../../stores/subscriptionStore';
  import { goto } from '$app/navigation';
  import SubscriptionModal from '../../../components/modals/SubscriptionModal.svelte';
  import { PUBLIC_API_URL } from '$env/static/public';
  
  let loading = true;
  let error = null;
  let showSubscriptionModal = false;
  let success = null;
  
  // User profile data
  let profileData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    title: '',
    bio: '',
    avatarUrl: '',
    skills: [],
    experience: [],
    education: []
  };
  
  // Form state
  let isEditing = false;
  let formData = { ...profileData };
  let skillsInput = '';
  let tempAvatarUrl = null;
  let avatarFile = null;
  let saveLoading = false;
  
  // First, let's add proper types for the subscription data
  interface SubscriptionData {
    isPaid: boolean;
    subscription: {
      status: 'active' | 'free' | 'incomplete';
      plan: 'monthly' | 'quarterly' | 'yearly' | 'free';
      current_period_end: number;
      current_period_start: number;
      stripe_subscription_id: string;
      stripe_price_id: string;
      cancel_at_period_end: boolean;
      isPaid: boolean;
    }
  }
  
  // Update the subscription status variable with the proper type
  let subscriptionStatus: SubscriptionData = {
    isPaid: false,
    subscription: {
      status: 'free',
      plan: 'free',
      current_period_end: 0,
      current_period_start: 0,
      stripe_subscription_id: '',
      stripe_price_id: '',
      cancel_at_period_end: false,
      isPaid: false
    }
  };
  
  // Helper to get full name
  $: fullName = profileData.firstName && profileData.lastName 
    ? `${profileData.firstName} ${profileData.lastName}`
    : profileData.firstName || profileData.lastName || '';
  
  // Improve the subscription status check function
  async function checkSubscriptionStatus(): Promise<SubscriptionData> {
    try {
      const response = await fetch(`${PUBLIC_API_URL}/subscriptions/status`, {
        headers: {
          'x-auth-token': $user?.token || ''
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription status');
      }

      const data: SubscriptionData = await response.json();
      console.log('Subscription status:', data);

      if (data.isPaid) {
        console.log('User has active subscription:', data.subscription.plan);
        console.log('Current period:', {
          start: new Date(data.subscription.current_period_start * 1000).toLocaleDateString(),
          end: new Date(data.subscription.current_period_end * 1000).toLocaleDateString()
        });
        console.log('Subscription ID:', data.subscription.stripe_subscription_id);
        console.log('Price ID:', data.subscription.stripe_price_id);
        console.log('Cancel at period end:', data.subscription.cancel_at_period_end);
      } else {
        console.log('User is on free plan');
      }

      // Update the local subscription status
      subscriptionStatus = data;
      
      // Also update the subscription store if you're using it
      subscription.set(data.subscription);

      return data;
    } catch (error) {
      console.error('Error checking subscription:', error);
      // Return default free subscription status on error
      return {
        isPaid: false,
        subscription: {
          status: 'free',
          plan: 'free',
          current_period_end: 0,
          current_period_start: 0,
          stripe_subscription_id: '',
          stripe_price_id: '',
          cancel_at_period_end: false,
          isPaid: false
        }
      };
    }
  }
  
  onMount(async () => {
    if (!$user || !$user.token) {
      console.log("No user or token found, redirecting to login");
      await goto('/login');
      return;
    }
    
    // Initialize form with data from user store if available
    if ($user.profile) {
      profileData = {
        firstName: $user.profile.firstName || '',
        lastName: $user.profile.lastName || '',
        email: $user.email,
        phone: $user.profile.phoneNumber || '',
        location: $user.profile.location || '',
        title: $user.profile.professionalTitle || 'Job Seeker',
        bio: $user.profile.professionalSummary || 'No bio provided yet.',
        avatarUrl: $user.profile.avatarUrl || '',
        skills: $user.profile.skills || [],
        experience: $user.profile.experience || [],
        education: $user.profile.education || []
      };
    }
    
    // Fetch latest profile data and subscription status
    await Promise.all([
      fetchUserProfile(),
      checkSubscriptionStatus()
    ]);
  });
  
  async function fetchUserProfile() {
    try {
      loading = true;
      error = null;
      
      if (!$user || !$user.token) {
        throw new Error("Authentication token is missing. Please log in again.");
      }
      
      console.log("Fetching profile with token:", $user.token);
      
      const response = await fetch(`${PUBLIC_API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${$user.token}`,
          'x-auth-token': $user.token
        }
      });
      
      if (response.status === 401) {
        // Token is invalid or expired
        console.error("Authentication token is invalid or expired");
        await goto('/login?redirect=/dashboard/profile&message=Your session has expired. Please log in again.');
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`);
      }
      
      const userData = await response.json();
      console.log("User profile data:", userData);
      
      // Update user store with latest data
      $user = {
        ...$user,
        id: userData._id,
        email: userData.email,
        role: userData.role,
        profile: userData.profile || {},
        subscription: userData.subscription || { isPaid: false, plan: 'free' }
      };
      
      // Populate form with existing profile data
      if (userData.profile) {
        profileData = {
          firstName: userData.profile.firstName || '',
          lastName: userData.profile.lastName || '',
          email: userData.email || '',
          phone: userData.profile.phoneNumber || '',
          location: userData.profile.location || '',
          title: userData.profile.professionalTitle || 'Job Seeker',
          bio: userData.profile.professionalSummary || 'No bio provided yet.',
          avatarUrl: userData.profile.avatarUrl || '',
          skills: userData.profile.skills || [],
          experience: userData.profile.experience || [],
          education: userData.profile.education || []
        };
      }
      
      formData = { ...profileData };
      skillsInput = formData.skills.join(', ');
    } catch (err) {
      console.error("Error fetching user profile:", err);
      error = err.message || "Failed to load profile";
    } finally {
      loading = false;
    }
  }
  
  function handleEdit() {
    isEditing = true;
    formData = { ...profileData };
    skillsInput = formData.skills.join(', ');
  }
  
  async function handleSave() {
    try {
      loading = true;
      error = null;
      success = null;
      
      if (!$user || !$user.token) {
        throw new Error("Authentication token is missing. Please log in again.");
      }
      
      console.log("Updating profile with token:", $user.token);
      console.log("Profile data being sent:", formData);
      
      const response = await fetch(`${PUBLIC_API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${$user.token}`,
          'x-auth-token': $user.token
        },
        body: JSON.stringify(formData)
      });
      
      if (response.status === 401) {
        // Token is invalid or expired
        console.error("Authentication token is invalid or expired");
        await goto('/login?redirect=/dashboard/profile&message=Your session has expired. Please log in again.');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update profile: ${response.status} ${response.statusText}`);
      }
      
      const updatedUser = await response.json();
      console.log("Profile updated successfully:", updatedUser);
      
      // Update the user store with the new profile data
      updateUserProfile(updatedUser.profile);
      
      success = "Profile updated successfully!";
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Error updating profile:", err);
      error = err.message || "Failed to update profile";
    } finally {
      loading = false;
    }
  }
  
  function handleCancel() {
    isEditing = false;
    formData = { ...profileData };
    skillsInput = formData.skills.join(', ');
  }
  
  function handleUpgradeClick() {
    showSubscriptionModal = true;
  }
  
  // Handle avatar upload
  function handleAvatarChange(event) {
    const file = event.target.files[0];
    if (file) {
      avatarFile = file;
      tempAvatarUrl = URL.createObjectURL(file);
    }
  }
</script>

<div class="profile-container">
  <div class="profile-header">
    <h1>My Profile</h1>
    
    {#if !isEditing}
      <button class="edit-button" on:click={handleEdit}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        Edit Profile
      </button>
    {:else}
      <div class="edit-actions">
        <button class="cancel-button" on:click={handleCancel}>Cancel</button>
        <button class="save-button" on:click={handleSave} disabled={saveLoading}>
          {#if saveLoading}
            <span class="spinner-small"></span>
            Saving...
          {:else}
            Save Changes
          {/if}
        </button>
      </div>
    {/if}
  </div>
  
  <div class="profile-content">
    <div class="profile-sidebar">
      <div class="card profile-info">
        <div class="avatar-container">
          {#if tempAvatarUrl || profileData.avatarUrl}
            <img src={tempAvatarUrl || profileData.avatarUrl} alt="{fullName}'s avatar" class="user-avatar-img" />
            {#if isEditing}
              <label for="avatar-upload" class="avatar-edit-overlay">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
              </label>
              <input type="file" id="avatar-upload" accept="image/*" on:change={handleAvatarChange} style="display: none;" />
            {/if}
          {:else}
            <div class="user-avatar">
              {#if profileData.firstName}
                {profileData.firstName.charAt(0).toUpperCase()}
              {:else if profileData.lastName}
                {profileData.lastName.charAt(0).toUpperCase()}
              {:else}
                U
              {/if}
            </div>
            {#if isEditing}
              <label for="avatar-upload" class="avatar-edit-overlay">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
              </label>
              <input type="file" id="avatar-upload" accept="image/*" on:change={handleAvatarChange} style="display: none;" />
            {/if}
          {/if}
        </div>
        
        {#if !isEditing}
          <h2>{fullName}</h2>
          <p class="user-title">{profileData.title}</p>
          <p class="user-location">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            {profileData.location || 'No location set'}
          </p>
          
          {#if subscriptionStatus.isPaid}
            <div class="premium-badge">
              <div class="status-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
              </div>
              <span class="plan-type">{subscriptionStatus.subscription.plan} Plan</span>
              <div class="subscription-details">
                Valid until: {new Date(subscriptionStatus.subscription.current_period_end * 1000).toLocaleDateString()}
              </div>
              {#if subscriptionStatus.subscription.cancel_at_period_end}
                <div class="cancellation-notice">
                  Cancels on {new Date(subscriptionStatus.subscription.current_period_end * 1000).toLocaleDateString()}
                </div>
              {/if}
            </div>
          {:else}
            <button class="upgrade-button" on:click={handleUpgradeClick}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
              Upgrade to Premium
            </button>
          {/if}
        {:else}
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input type="text" id="firstName" bind:value={formData.firstName} placeholder="First name">
            </div>
            
            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input type="text" id="lastName" bind:value={formData.lastName} placeholder="Last name">
            </div>
          </div>
          
          <div class="form-group">
            <label for="title">Professional Title</label>
            <input type="text" id="title" bind:value={formData.title} placeholder="e.g. Software Engineer">
          </div>
          
          <div class="form-group">
            <label for="location">Location</label>
            <input type="text" id="location" bind:value={formData.location} placeholder="e.g. San Francisco, CA">
          </div>
        {/if}
      </div>
      
      <div class="card contact-info">
        <h3>Contact Information</h3>
        
        {#if !isEditing}
          <div class="contact-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span>{profileData.email}</span>
          </div>
          
          {#if profileData.phone}
            <div class="contact-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>{profileData.phone}</span>
            </div>
          {:else}
            <div class="contact-item empty">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>No phone number added</span>
            </div>
          {/if}
        {:else}
          <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" bind:value={formData.email} placeholder="Your email address">
          </div>
          
          <div class="form-group">
            <label for="phone">Phone Number</label>
            <input type="tel" id="phone" bind:value={formData.phone} placeholder="Your phone number">
          </div>
        {/if}
      </div>
    </div>
    
    <div class="profile-main">
      <div class="card main-section">
        <h3>About Me</h3>
        
        {#if !isEditing}
          <p class="bio-text">{profileData.bio || 'No bio provided yet.'}</p>
        {:else}
          <div class="form-group">
            <label for="bio">Professional Summary</label>
            <textarea id="bio" bind:value={formData.bio} placeholder="Write a brief summary about yourself, your experience, and career goals" rows="5"></textarea>
          </div>
        {/if}
      </div>
      
      <div class="card main-section">
        <h3>Skills</h3>
        
        {#if !isEditing}
          {#if profileData.skills && profileData.skills.length > 0}
            <div class="skills-list">
              {#each profileData.skills as skill}
                <span class="skill-tag">{skill}</span>
              {/each}
            </div>
          {:else}
            <p class="empty-state">No skills added yet</p>
          {/if}
        {:else}
          <div class="form-group">
            <label for="skills">Skills (comma separated)</label>
            <input type="text" id="skills" bind:value={skillsInput} placeholder="e.g. JavaScript, React, Node.js">
            <p class="form-note">Enter skills separated by commas</p>
          </div>
        {/if}
      </div>
      
      <div class="card main-section">
        <h3>Experience</h3>
        
        {#if !isEditing}
          {#if profileData.experience && profileData.experience.length > 0}
            <div class="experience-list">
              {#each profileData.experience as job}
                <div class="experience-item">
                  <h4>{job.title} at {job.company}</h4>
                  <p class="experience-date">{job.startDate} - {job.endDate || 'Present'}</p>
                  <p class="experience-description">{job.description}</p>
                </div>
              {/each}
            </div>
          {:else}
            <p class="empty-state">No work experience added yet</p>
          {/if}
        {:else}
          <p class="form-note">Experience editing is available in the full version</p>
        {/if}
      </div>
      
      <div class="card main-section">
        <h3>Education</h3>
        
        {#if !isEditing}
          {#if profileData.education && profileData.education.length > 0}
            <div class="education-list">
              {#each profileData.education as edu}
                <div class="education-item">
                  <h4>{edu.degree} in {edu.field}</h4>
                  <p class="education-school">{edu.school}</p>
                  <p class="education-date">{edu.startYear} - {edu.endYear || 'Present'}</p>
                </div>
              {/each}
            </div>
          {:else}
            <p class="empty-state">No education added yet</p>
          {/if}
        {:else}
          <p class="form-note">Education editing is available in the full version</p>
        {/if}
      </div>
    </div>
  </div>
  
  {#if showSubscriptionModal}
    <SubscriptionModal on:close={() => showSubscriptionModal = false} />
  {/if}
</div>

<style>
  /* Modern Glass-morphism Profile Container */
  .profile-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    background: linear-gradient(to bottom right, rgba(249, 250, 251, 0.9), rgba(243, 244, 246, 0.8));
    min-height: 100vh;
  }

  /* Glassmorphism Cards */
  .card {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 1.5rem;
    box-shadow: 
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06),
      inset 0 0 0 1px rgba(255, 255, 255, 0.5);
    padding: 2rem;
    margin-bottom: 2rem;
    transition: all 0.3s ease;
  }

  .card:hover {
    transform: translateY(-4px);
    box-shadow: 
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04),
      inset 0 0 0 1px rgba(255, 255, 255, 0.6);
  }

  /* Enhanced Premium Badge */
  .premium-badge {
    background: linear-gradient(135deg, #24C6DC, #514A9D);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    margin-top: 1rem;
    box-shadow: 0 4px 15px rgba(36, 198, 220, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    position: relative;
    overflow: hidden;
  }

  .premium-badge::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.5), transparent);
  }

  .premium-badge .plan-type {
    font-size: 1.25rem;
    font-weight: 700;
    text-transform: capitalize;
  }

  .subscription-details {
    background: rgba(255, 255, 255, 0.1);
    padding: 0.75rem;
    border-radius: 0.75rem;
    margin-top: 0.5rem;
    font-size: 0.75rem;
    width: 100%;
    text-align: center;
  }

  .cancellation-notice {
    background: rgba(220, 38, 38, 0.1);
    color: #DC2626;
    padding: 0.5rem;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    margin-top: 0.5rem;
    width: 100%;
    text-align: center;
  }

  /* Modern Avatar */
  .avatar-container {
    position: relative;
    width: 180px;
    height: 180px;
    margin: 0 auto 2rem;
  }

  .user-avatar {
    width: 180px;
    height: 180px;
    background: linear-gradient(135deg, #6355FF, #4F46E5);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 4rem;
    font-weight: bold;
    box-shadow: 
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border: 4px solid white;
  }

  .user-avatar-img {
    width: 180px;
    height: 180px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid white;
    box-shadow: 
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  /* Modern Skills Tags */
  .skills-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .skill-tag {
    background: linear-gradient(135deg, #6355FF, #4F46E5);
    color: white;
    padding: 0.75rem 1.25rem;
    border-radius: 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    box-shadow: 0 4px 6px rgba(99, 85, 255, 0.2);
    transition: all 0.3s ease;
  }

  .skill-tag:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 8px rgba(99, 85, 255, 0.3);
  }

  /* Modern Section Headers */
  .main-section h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    margin: 0 0 2rem 0;
    padding-bottom: 1rem;
    border-bottom: 2px solid rgba(99, 85, 255, 0.1);
    position: relative;
  }

  .main-section h3::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100px;
    height: 2px;
    background: linear-gradient(to right, #6355FF, transparent);
  }

  /* Update the template section for subscription status */
  .subscription-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(10px);
    margin-top: 1.5rem;
  }

  .status-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #24C6DC, #514A9D);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
  }

  /* Modern Buttons */
  .upgrade-button {
    background: linear-gradient(135deg, #6355FF, #4F46E5);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(99, 85, 255, 0.2);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: fit-content;
    margin: 1rem auto;
  }

  .upgrade-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(99, 85, 255, 0.3);
  }

  /* Updated base styles */
  .profile-header {
    background: white;
    padding: 1.5rem 2rem;
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    margin-bottom: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .edit-button, .save-button {
    background: linear-gradient(135deg, #6355FF, #4F46E5);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .edit-button:hover, .save-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  }

  .cancel-button {
    background: white;
    border: 2px solid #E5E7EB;
    color: #4B5563;
    padding: 0.75rem 1.5rem;
    border-radius: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .cancel-button:hover {
    background: #F9FAFB;
    border-color: #D1D5DB;
  }

  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 0.875rem 1rem;
    border: 2px solid #E5E7EB;
    border-radius: 0.75rem;
    font-size: 1rem;
    color: #1F2937;
    transition: all 0.2s;
    background: #F9FAFB;
  }

  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #6355FF;
    box-shadow: 0 0 0 3px rgba(99, 85, 255, 0.1);
    background: white;
  }

  .form-note {
    color: #4B5563;
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }

  /* Responsive grid updates */
  .profile-content {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 2rem;
  }

  @media (max-width: 1024px) {
    .profile-content {
      grid-template-columns: 1fr;
    }
    
    .profile-sidebar {
      max-width: 500px;
      margin: 0 auto;
    }
  }

  @media (max-width: 640px) {
    .profile-container {
      padding: 1rem;
    }
    
    .card {
      padding: 1.5rem;
    }
  }
</style>