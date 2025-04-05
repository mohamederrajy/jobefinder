<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { user } from '../../stores/userStore';
  import { Editor } from '@tiptap/core';
  import StarterKit from '@tiptap/starter-kit';

  const dispatch = createEventDispatcher();

  let loading = false;
  let error: string | null = null;
  let editorElement: HTMLElement;
  let editor: Editor;

  let jobData = {
    title: '',
    company: '',
    hourlyRate: 0,
    about: '',
    jobUrl: '',
    contactDetails: {
      name: '',
      email: '',
      phone: ''
    },
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    tags: [] as string[],
    isUrgent: false
  };

  let newTag = '';
  let zipCodeError = '';

  let logoInput: HTMLInputElement;
  let previewLogo: string | null = null;
  let logoFile: File | null = null;

  // Add demo image variables
  let demoImageInput: HTMLInputElement;
  let previewDemoImage: string | null = null;
  let demoImageFile: File | null = null;

  // Initialize editor on mount
  import { onMount, onDestroy } from 'svelte';

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
        content: '',
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

  function validateZipCode(value: string) {
    const zipRegex = /^\d{5}$/;
    if (!zipRegex.test(value)) {
      zipCodeError = 'Please enter a valid 5-digit ZIP code';
      return false;
    }
    zipCodeError = '';
    return true;
  }

  function handleLogoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      logoFile = input.files[0];
      previewLogo = URL.createObjectURL(input.files[0]);
    }
  }

  function removeLogo() {
    previewLogo = null;
    logoFile = null;
    if (logoInput) logoInput.value = '';
  }

  // Add demo image handling functions
  function handleDemoImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      demoImageFile = input.files[0];
      previewDemoImage = URL.createObjectURL(input.files[0]);
    }
  }

  function removeDemoImage() {
    previewDemoImage = null;
    demoImageFile = null;
    if (demoImageInput) demoImageInput.value = '';
  }

  async function handleSubmit() {
    try {
      loading = true;
      error = null;

      const formData = new FormData();
      
      // Add job data
      formData.append('jobData', JSON.stringify({
        title: jobData.title,
        company: jobData.company,
        hourlyRate: jobData.hourlyRate,
        about: jobData.about,
        jobUrl: jobData.jobUrl,
        contactDetails: jobData.contactDetails,
        address: jobData.address,
        tags: jobData.tags,
        isUrgent: jobData.isUrgent
      }));

      // Add logo if exists
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      // Add demo image if exists
      if (demoImageFile) {
        formData.append('demoImage', demoImageFile);
      }

      const response = await fetch(`${PUBLIC_API_URL}/jobs`, {
        method: 'POST',
        headers: {
          'x-auth-token': $user?.token || ''
        },
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create job');
      }

      dispatch('jobCreated');
      dispatch('close');
    } catch (err) {
      console.error('Error creating job:', err);
      error = err instanceof Error ? err.message : 'Failed to create job';
    } finally {
      loading = false;
    }
  }
</script>

<div class="modal-overlay" on:click|self={() => dispatch('close')}>
  <div class="modal-content">
    <div class="modal-header">
      <h2>Add New Job</h2>
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
              placeholder="e.g. Senior Developer"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="company">Company Name<span class="required">*</span></label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z"/>
            </svg>
            <input 
              type="text" 
              id="company" 
              bind:value={jobData.company} 
              required 
              placeholder="e.g. Tech Corp"
            />
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
              required 
              min="0" 
              step="0.01"
              placeholder="0.00"
              class="currency-input"
            />
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
            />
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
            />
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
            />
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
            />
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
              placeholder="Street address"
            />
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
              placeholder="City"
            />
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
              placeholder="State"
            />
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
              placeholder="ZIP Code"
              on:blur={() => validateZipCode(jobData.address.zipCode)}
            />
          </div>
          {#if zipCodeError}
            <div class="error-text">{zipCodeError}</div>
          {/if}
        </div>

        <div class="form-group">
          <label for="company-logo">Company Logo</label>
          <div class="logo-upload-container">
            {#if previewLogo}
              <div class="logo-preview">
                <img src={previewLogo} alt="Company logo preview" />
                <button type="button" class="remove-logo" on:click={removeLogo}>
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
            {:else}
              <div class="upload-placeholder" on:click={() => logoInput?.click()}>
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z"/>
                </svg>
                <span>Upload Logo</span>
              </div>
            {/if}
            <input 
              type="file"
              id="company-logo"
              accept="image/*"
              bind:this={logoInput}
              on:change={handleLogoChange}
              style="display: none;"
            />
          </div>
          <p class="helper-text">Recommended: Square image, at least 200x200px</p>
        </div>

        <div class="form-group">
          <label for="demo-image">Demo Image</label>
          <div class="demo-image-upload-container">
            {#if previewDemoImage}
              <div class="demo-image-preview">
                <img src={previewDemoImage} alt="Demo image preview" />
                <button type="button" class="remove-demo" on:click={removeDemoImage}>
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
            {:else}
              <div class="upload-placeholder" on:click={() => demoImageInput?.click()}>
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
                <span>Upload Demo Image</span>
              </div>
            {/if}
            <input 
              type="file"
              id="demo-image"
              accept="image/*"
              bind:this={demoImageInput}
              on:change={handleDemoImageChange}
              style="display: none;"
            />
          </div>
          <p class="helper-text">Recommended: 16:9 aspect ratio, at least 1280x720px</p>
        </div>

        <div class="form-group tags-group">
          <label>Tags</label>
          <div class="tags-container">
            {#each jobData.tags as tag}
              {#if tag.trim()}
                <span class="tag">
                  {tag}
                  <button type="button" class="remove-tag" on:click={() => removeTag(tag)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </span>
              {/if}
            {/each}
          </div>
          <div class="tag-input-container">
            <input 
              type="text" 
              bind:value={newTag}
              on:keydown={handleKeydown}
              placeholder="Type and press Enter to add tags"
            />
            <button type="button" class="add-tag" on:click={addTag}>
              Add
            </button>
          </div>
          <span class="helper-text">Press Enter or comma to add tags</span>
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              bind:checked={jobData.isUrgent}
            />
            <span>Mark as Urgent</span>
          </label>
        </div>

        <div class="form-group about-section full-width">
          <label>About the Job*</label>
          <p class="helper-text">Describe the role, responsibilities, and requirements</p>
          <div class="editor-wrapper">
            <div class="editor-toolbar">
              <button 
                type="button" 
                title="Heading 1"
                on:click={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                class:active={editor?.isActive('heading', { level: 1 })}>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 14h-2v-4H9v4H7V7h2v4h4V7h2v10z"/>
                </svg>
              </button>
              <button 
                type="button"
                title="Bold"
                on:click={() => editor?.chain().focus().toggleBold().run()} 
                class:active={editor?.isActive('bold')}>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M15.6 11.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 7.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
                </svg>
              </button>
              <button 
                type="button"
                title="Italic"
                on:click={() => editor?.chain().focus().toggleItalic().run()}
                class:active={editor?.isActive('italic')}>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/>
                </svg>
              </button>
              <div class="toolbar-divider"></div>
              <button 
                type="button"
                title="Bullet List"
                on:click={() => editor?.chain().focus().toggleBulletList().run()}
                class:active={editor?.isActive('bulletList')}>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/>
                </svg>
              </button>
              <button 
                type="button"
                title="Numbered List"
                on:click={() => editor?.chain().focus().toggleOrderedList().run()}
                class:active={editor?.isActive('orderedList')}>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
                </svg>
              </button>
            </div>
            <div class="editor-content" bind:this={editorElement}></div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="cancel-btn" on:click={() => dispatch('close')}>
          Cancel
        </button>
        <button type="submit" class="submit-btn" disabled={loading || !editor}>
          {loading ? 
            '<span class="loading-spinner"></span> Creating...' : 
            'Create Job'
          }
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
    width: 95%;
    max-width: 900px;
    max-height: 90vh;
    overflow-y: auto;
    padding: 2rem;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .close-btn {
    background: none;
    border: none;
    color: #6B7280;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: #f3f4f6;
    color: #111827;
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

  label {
    font-weight: 500;
    color: #374151;
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

  .tag-input {
    display: flex;
    gap: 0.5rem;
    align-items: center;
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
    color: #EF4444;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
  }

  .remove-tag:hover {
    background: #FEE2E2;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .error-message {
    color: #DC2626;
    background: #FEE2E2;
    padding: 1rem;
    border-radius: 8px;
    margin: 1rem 0;
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

  @media (max-width: 640px) {
    .form-grid {
      grid-template-columns: 1fr;
    }

    .form-group.tags-group,
    .form-group.checkbox-group {
      grid-column: span 1;
    }

    .modal-content {
      padding: 1.5rem;
    }
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

  .tag .remove-tag {
    background: none;
    border: none;
    padding: 0.125rem;
    color: #6355FF;
    cursor: pointer;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .tag .remove-tag:hover {
    background: rgba(99, 85, 255, 0.2);
  }

  .tag-input-container {
    display: flex;
    gap: 0.5rem;
  }

  .tag-input-container input {
    flex: 1;
  }

  .helper-text {
    font-size: 0.75rem;
    color: #6B7280;
    margin-top: 0.25rem;
  }

  .error-text {
    color: #DC2626;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }

  .full-width {
    grid-column: 1 / -1;
  }

  .about-section {
    margin-bottom: 2rem;
  }

  .editor-wrapper {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    margin-top: 0.5rem;
    background: white;
    width: 100%;
  }

  .editor-toolbar {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
    align-items: center;
  }

  .toolbar-divider {
    width: 1px;
    height: 24px;
    background: #e5e7eb;
    margin: 0 0.25rem;
  }

  .editor-toolbar button {
    width: 36px;
    height: 36px;
    padding: 0.5rem;
    border: none;
    background: none;
    border-radius: 6px;
    color: #4b5563;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
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

  .logo-upload-container {
    margin-top: 0.5rem;
  }

  .upload-placeholder {
    width: 120px;
    height: 120px;
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

  .logo-preview {
    position: relative;
    width: 120px;
    height: 120px;
  }

  .logo-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
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

  .demo-image-upload-container {
    margin-top: 0.5rem;
  }

  .demo-image-preview {
    position: relative;
    width: 280px;
    height: 158px; /* 16:9 aspect ratio */
    border-radius: 12px;
    overflow: hidden;
  }

  .demo-image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
  }

  .remove-demo {
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

  .remove-demo:hover {
    background: #B91C1C;
    transform: scale(1.1);
  }

  /* Update upload placeholder for demo image */
  .demo-image-upload-container .upload-placeholder {
    width: 280px;
    height: 158px;
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

  .demo-image-upload-container .upload-placeholder:hover {
    border-color: #6355FF;
    color: #6355FF;
    background: rgba(99, 85, 255, 0.05);
  }
</style> 