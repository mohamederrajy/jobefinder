<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { user } from '../../stores/userStore';
  import { Editor } from '@tiptap/core';
  import StarterKit from '@tiptap/starter-kit';

  const dispatch = createEventDispatcher();

  export let job: {
    _id: string;
    title: string;
    company: string;
    hourlyRate: number;
    about: string;
    jobUrl?: string;
    contactDetails?: {
      name: string;
      email: string;
      phone: string;
    };
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    tags: string[];
    isUrgent: boolean;
    logo?: string;
  };

  let loading = false;
  let error: string | null = null;
  let editorElement: HTMLElement;
  let editor: Editor;
  
  // Create a copy to avoid mutating props and initialize missing fields
  let jobData = { 
    ...job,
    jobUrl: job.jobUrl || '',
    contactDetails: job.contactDetails || {
      name: '',
      email: '',
      phone: ''
    }
  };
  
  let newTag = '';
  
  // Logo handling
  let logoInput: HTMLInputElement;
  let previewLogo: string | null = job.logo || null;
  let logoFile: File | null = null;
  let logoChanged = false;

  function handleLogoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      logoFile = input.files[0];
      previewLogo = URL.createObjectURL(input.files[0]);
      logoChanged = true;
    }
  }

  function removeLogo() {
    previewLogo = null;
    logoFile = null;
    logoChanged = true;
    if (logoInput) logoInput.value = '';
  }

  onMount(() => {
    if (editorElement) {
      editor = new Editor({
        element: editorElement,
        extensions: [
          StarterKit.configure({
            heading: {
              levels: [1, 2, 3]
            }
          })
        ],
        content: job.about || '',
        editorProps: {
          attributes: {
            class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl',
            spellcheck: 'true',
          },
        },
        onUpdate: ({ editor }) => {
          jobData.about = editor.getHTML();
        }
      });
    }
  });

  onDestroy(() => {
    if (editor) {
      editor.destroy();
    }
  });

  function addTag() {
    if (newTag.trim()) {
      jobData.tags = [...jobData.tags, newTag.trim()];
      newTag = '';
    }
  }

  function removeTag(tagToRemove: string) {
    jobData.tags = jobData.tags.filter(tag => tag !== tagToRemove);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag();
    }
  }

  async function handleSubmit() {
    try {
      loading = true;
      error = null;

      // Use FormData to handle file upload
      const formData = new FormData();
      
      // Add all job data as JSON
      const jobDataCopy = { ...jobData };
      delete jobDataCopy.logo; // Remove logo from JSON data
      formData.append('jobData', JSON.stringify(jobDataCopy));
      
      // Add logo file if changed
      if (logoChanged) {
        if (logoFile) {
          formData.append('logo', logoFile);
        } else {
          // If logo was removed, send a flag to remove it
          formData.append('removeLogo', 'true');
        }
      }

      const response = await fetch(`${PUBLIC_API_URL}/jobs/${job._id}`, {
        method: 'PUT',
        headers: {
          'x-auth-token': $user?.token || ''
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update job');
      }

      dispatch('jobUpdated', data);
      dispatch('close');
    } catch (err) {
      console.error('Error updating job:', err);
      error = err instanceof Error ? err.message : 'Failed to update job';
    } finally {
      loading = false;
    }
  }
</script>

<div class="modal-overlay" on:click|self={() => dispatch('close')}>
  <div class="modal-content">
    <div class="modal-header">
      <h2>Edit Job</h2>
      <button class="close-btn" on:click={() => dispatch('close')}>
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>

    {#if error}
      <div class="error-message">{error}</div>
    {/if}

    <form on:submit|preventDefault={handleSubmit}>
      <div class="logo-header">
        <div class="logo-upload-container">
          {#if previewLogo}
            <div class="logo-preview">
              <img src={previewLogo} alt="Company logo preview" />
              <button type="button" class="remove-logo" on:click={removeLogo}>
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
          {:else}
            <label for="logo-upload" class="upload-placeholder">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
              </svg>
              <span>Upload Logo</span>
            </label>
            <input 
              type="file" 
              id="logo-upload" 
              accept="image/*" 
              on:change={handleLogoChange} 
              bind:this={logoInput}
              style="display: none;"
            />
          {/if}
        </div>
        <div class="company-info">
          <h3>{jobData.company}</h3>
          <p>{jobData.title}</p>
        </div>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label for="title">Job Title<span class="required">*</span></label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
            </svg>
            <input 
              type="text" 
              id="title"
              bind:value={jobData.title}
              required
            >
          </div>
        </div>

        <div class="form-group">
          <label for="company">Company<span class="required">*</span></label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z"/>
            </svg>
            <input 
              type="text" 
              id="company"
              bind:value={jobData.company}
              required
            >
          </div>
        </div>

        <div class="form-group">
          <label for="hourlyRate">Hourly Rate<span class="required">*</span></label>
          <div class="input-wrapper">
            <span class="currency-symbol">$</span>
            <input 
              type="number" 
              id="hourlyRate"
              bind:value={jobData.hourlyRate}
              min="0"
              required
              class="currency-input"
            >
          </div>
        </div>

        <div class="form-group">
          <label for="jobUrl">Job URL</label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
            </svg>
            <input 
              type="url" 
              id="jobUrl"
              bind:value={jobData.jobUrl}
              placeholder="e.g. https://company.com/careers/job"
            >
          </div>
        </div>

        <!-- Job Description Section -->
        <div class="section-divider">
          <span>Job Description</span>
        </div>

        <div class="form-group editor-group">
          <label>Job Description<span class="required">*</span></label>
          <div class="editor-container">
            <div class="editor-toolbar">
              <button type="button" on:click={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} class:active={editor?.isActive('heading', { level: 1 })}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 12h12"></path><path d="M6 20V4"></path><path d="M18 20V4"></path>
                </svg>
              </button>
              <button type="button" on:click={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} class:active={editor?.isActive('heading', { level: 2 })}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 12h8"></path><path d="M4 18V6"></path><path d="M12 18V6"></path><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"></path>
                </svg>
              </button>
              <button type="button" on:click={() => editor.chain().focus().toggleBold().run()} class:active={editor?.isActive('bold')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 12a4 4 0 0 0 0-8H6v8"></path><path d="M15 20a4 4 0 0 0 0-8H6v8Z"></path>
                </svg>
              </button>
              <button type="button" on:click={() => editor.chain().focus().toggleItalic().run()} class:active={editor?.isActive('italic')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="19" x2="10" y1="4" y2="4"></line><line x1="14" x2="5" y1="20" y2="20"></line><line x1="15" x2="9" y1="4" y2="20"></line>
                </svg>
              </button>
              <button type="button" on:click={() => editor.chain().focus().toggleBulletList().run()} class:active={editor?.isActive('bulletList')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="9" x2="20" y1="6" y2="6"></line><line x1="9" x2="20" y1="12" y2="12"></line><line x1="9" x2="20" y1="18" y2="18"></line><circle cx="4" cy="6" r="1"></circle><circle cx="4" cy="12" r="1"></circle><circle cx="4" cy="18" r="1"></circle>
                </svg>
              </button>
              <button type="button" on:click={() => editor.chain().focus().toggleOrderedList().run()} class:active={editor?.isActive('orderedList')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="10" x2="21" y1="6" y2="6"></line><line x1="10" x2="21" y1="12" y2="12"></line><line x1="10" x2="21" y1="18" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
                </svg>
              </button>
            </div>
            <div class="editor-content" bind:this={editorElement}></div>
          </div>
        </div>

        <!-- Contact Information Section -->
        <div class="section-divider">
          <span>Contact Information</span>
        </div>

        <div class="form-group">
          <label for="contactName">Contact Name</label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <input 
              type="text" 
              id="contactName"
              bind:value={jobData.contactDetails.name}
              placeholder="e.g. HR Department"
            >
          </div>
        </div>

        <div class="form-group">
          <label for="contactEmail">Contact Email</label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            <input 
              type="email" 
              id="contactEmail"
              bind:value={jobData.contactDetails.email}
              placeholder="e.g. hr@company.com"
            >
          </div>
        </div>

        <div class="form-group">
          <label for="contactPhone">Contact Phone</label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            <input 
              type="tel" 
              id="contactPhone"
              bind:value={jobData.contactDetails.phone}
              placeholder="e.g. +1-555-123-4567"
            >
          </div>
        </div>

        <!-- Location Section -->
        <div class="section-divider">
          <span>Location</span>
        </div>

        <div class="form-group">
          <label for="street">Street Address<span class="required">*</span></label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <input 
              type="text" 
              id="street"
              bind:value={jobData.address.street}
              required
            >
          </div>
        </div>

        <div class="form-group">
          <label for="city">City<span class="required">*</span></label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M15 11V5l-3-3-3 3v2H3v14h18V11h-6zm-8 8H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z"/>
            </svg>
            <input 
              type="text" 
              id="city"
              bind:value={jobData.address.city}
              required
            >
          </div>
        </div>

        <div class="form-group">
          <label for="state">State<span class="required">*</span></label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M14.4 6L14 4H5v17h20V7z"/>
            </svg>
            <input 
              type="text" 
              id="state"
              bind:value={jobData.address.state}
              required
            >
          </div>
        </div>

        <div class="form-group">
          <label for="zipCode">ZIP Code<span class="required">*</span></label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            <input 
              type="text" 
              id="zipCode"
              bind:value={jobData.address.zipCode}
              required
            >
          </div>
        </div>

        <div class="form-group tags-group">
          <label>Tags</label>
          <div class="tags-container">
            {#each jobData.tags as tag}
              <span class="tag">
                {tag}
                <button type="button" class="remove-tag" on:click={() => removeTag(tag)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </span>
            {/each}
          </div>
          <div class="tag-input-container">
            <input 
              type="text"
              placeholder="Add tags..."
              bind:value={newTag}
              on:keydown={handleKeydown}
            >
            <button type="button" class="add-tag" on:click={addTag}>
              Add
            </button>
          </div>
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input 
              type="checkbox"
              bind:checked={jobData.isUrgent}
            >
            <span>Mark as Urgent</span>
          </label>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="cancel-btn" on:click={() => dispatch('close')}>
          Cancel
        </button>
        <button type="submit" class="submit-btn" disabled={loading}>
          {#if loading}
            <span class="loading-spinner"></span> Updating...
          {:else}
            Update Job
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    border-radius: 16px;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #E5E7EB;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
  }

  .close-btn {
    background: none;
    border: none;
    color: #6B7280;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  form {
    padding: 1.5rem;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-group.tags-group,
  .form-group.checkbox-group {
    grid-column: span 2;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-icon {
    position: absolute;
    left: 12px;
    color: #6B7280;
    pointer-events: none;
  }

  input[type="text"],
  input[type="number"],
  input[type="email"],
  input[type="tel"],
  input[type="url"] {
    width: 100%;
    padding: 0.875rem 1rem 0.875rem 2.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s;
    background-color: #F9FAFB;
  }

  input:focus {
    outline: none;
    border-color: #6355FF;
    box-shadow: 0 0 0 3px rgba(99, 85, 255, 0.1);
    background-color: white;
  }

  input::placeholder {
    color: #9CA3AF;
  }

  .currency-input {
    padding-left: 1.75rem !important;
  }

  .currency-symbol {
    position: absolute;
    left: 12px;
    color: #6B7280;
    font-weight: 500;
    pointer-events: none;
  }

  .required {
    color: #EF4444;
    margin-left: 2px;
  }

  .section-divider {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    margin: 1.5rem 0 1rem;
    color: #6B7280;
  }

  .section-divider::before,
  .section-divider::after {
    content: "";
    flex: 1;
    height: 1px;
    background: #E5E7EB;
  }

  .section-divider span {
    padding: 0 1rem;
    font-weight: 500;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .tag {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem 0.75rem;
    background: rgba(99, 85, 255, 0.1);
    color: #6355FF;
    border-radius: 20px;
    font-size: 0.875rem;
  }

  .tag-input-container {
    display: flex;
    gap: 0.5rem;
  }

  .tag-input-container input {
    flex: 1;
  }

  .add-tag {
    padding: 0.75rem 1rem;
    background: #f3f4f6;
    border: none;
    border-radius: 8px;
    color: #6355FF;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .add-tag:hover {
    background: #e5e7eb;
  }

  .remove-tag {
    background: none;
    border: none;
    color: #6B7280;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .remove-tag:hover {
    color: #EF4444;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
  }

  .cancel-btn {
    padding: 0.75rem 1.5rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    color: #6B7280;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .cancel-btn:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
  }

  .submit-btn {
    padding: 0.875rem 1.75rem;
    background: #6355FF;
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .loading-spinner {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error-message {
    background: #FEE2E2;
    color: #DC2626;
    padding: 1rem;
    border-radius: 8px;
    margin: 0 1.5rem 1.5rem;
  }

  @media (max-width: 640px) {
    .form-grid {
      grid-template-columns: 1fr;
    }

    .form-group.tags-group,
    .form-group.checkbox-group {
      grid-column: span 1;
    }
  }

  /* Add editor styles */
  .editor-group {
    grid-column: span 2;
  }

  .editor-container {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
  }

  .editor-toolbar {
    display: flex;
    padding: 0.5rem;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
  }

  .editor-toolbar button {
    background: none;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6B7280;
    cursor: pointer;
    transition: all 0.2s;
  }

  .editor-toolbar button:hover {
    background: #e5e7eb;
    color: #111827;
  }

  .editor-toolbar button.active {
    background: #6355FF;
    color: white;
  }

  .editor-content {
    min-height: 300px;
    padding: 1.5rem;
    background: white;
  }

  :global(.editor-content) {
    font-family: system-ui, -apple-system, sans-serif;
    line-height: 1.6;
    color: #374151;
  }

  :global(.editor-content p) {
    margin: 1em 0;
  }

  :global(.editor-content h1) {
    font-size: 1.5em;
    font-weight: 600;
    margin: 1em 0 0.5em;
    color: #111827;
  }

  :global(.editor-content ul, .editor-content ol) {
    padding-left: 1.5em;
    margin: 1em 0;
  }

  :global(.editor-content li) {
    margin: 0.5em 0;
  }

  :global(.editor-content li p) {
    margin: 0;
  }

  :global(.ProseMirror) {
    min-height: 300px;
    outline: none;
  }

  :global(.ProseMirror p.is-editor-empty:first-child::before) {
    content: "Start writing job description...";
    float: left;
    color: #9ca3af;
    pointer-events: none;
    height: 0;
  }

  /* Add to existing styles */
  .logo-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 1.5rem;
  }

  .logo-upload-container {
    flex-shrink: 0;
  }

  .company-info {
    flex-grow: 1;
  }

  .company-info h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 0.25rem 0;
  }

  .company-info p {
    font-size: 1rem;
    color: #6B7280;
    margin: 0;
  }

  .logo-preview {
    position: relative;
    width: 100px;
    height: 100px;
  }

  .logo-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
    border: 1px solid #E5E7EB;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .upload-placeholder {
    width: 100px;
    height: 100px;
    border: 2px dashed #E5E7EB;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
    color: #6B7280;
  }

  .upload-placeholder:hover {
    border-color: #6355FF;
    color: #6355FF;
    background: rgba(99, 85, 255, 0.05);
  }

  .remove-logo {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #DC2626;
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .remove-logo:hover {
    background: #B91C1C;
    transform: scale(1.1);
  }
</style> 