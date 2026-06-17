/**
 * LIGO Hospital Gastroenterology Landing Page
 * JavaScript Behaviors (Vanilla ES6)
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initFaqAccordion();
  initFormValidation();
});

/**
 * 1. Sticky Header Behavior on Scroll
 */
function initStickyHeader() {
  const header = document.getElementById('main-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll);
  // Initial check on load
  handleScroll();
}

/**
 * 2. FAQ Accordion Toggle
 */
function initFaqAccordion() {
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const faqItem = question.closest('.faq-item');
      if (!faqItem) return;

      const isOpen = faqItem.classList.contains('active');

      // Close other FAQs
      document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== faqItem) {
          item.classList.remove('active');
          const itemBtn = item.querySelector('.faq-question');
          if (itemBtn) itemBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current FAQ
      if (isOpen) {
        faqItem.classList.remove('active');
        question.setAttribute('aria-expanded', 'false');
      } else {
        faqItem.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/**
 * 3. Lead Form Validation and Submission Modal
 */
function initFormValidation() {
  const form = document.getElementById('booking-form');
  const successOverlay = document.getElementById('success-overlay');
  const closeSuccessBtn = document.getElementById('close-success-btn');

  if (!form || !successOverlay) return;

  // Set minimum date to today dynamically
  const dateInput = document.getElementById('preferred-date');
  if (dateInput) {
    const todayStr = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', todayStr);
  }

  // Restrict Name Input to letters and spaces only (including copy-paste)
  const nameInput = document.getElementById('full-name');
  if (nameInput) {
    nameInput.addEventListener('keypress', (event) => {
      const char = String.fromCharCode(event.which || event.keyCode);
      if (!/^[a-zA-Z\s]$/.test(char)) {
        event.preventDefault();
      }
    });
    nameInput.addEventListener('input', () => {
      nameInput.value = nameInput.value.replace(/[^a-zA-Z\s]/g, '');
    });
  }

  // Restrict Phone Input to digits only and maximum 10 numbers (including copy-paste)
  const phoneInput = document.getElementById('phone-number');
  if (phoneInput) {
    phoneInput.addEventListener('keypress', (event) => {
      const char = String.fromCharCode(event.which || event.keyCode);
      if (!/^\d$/.test(char)) {
        event.preventDefault();
      }
    });
    phoneInput.addEventListener('input', () => {
      phoneInput.value = phoneInput.value.replace(/\D/g, '');
    });
  }

  // Validation constraints
  const rules = {
    fullName: {
      validate: value => /^[a-zA-Z\s]{2,50}$/.test(value.trim()),
      errorId: 'name-error'
    },
    phone: {
      validate: value => /^\d{10}$/.test(value.trim()),
      errorId: 'phone-error'
    },
    preferredDate: {
      validate: value => {
        if (!value) return false;
        const selectedDate = new Date(value);
        selectedDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      },
      errorId: 'date-error'
    }
  };

  // Validate single input field
  const validateField = (inputElement, fieldName) => {
    const value = inputElement.value;
    const rule = rules[fieldName];
    const groupElement = inputElement.closest('.form-group');

    if (!rule || !groupElement) return true;

    const isValid = rule.validate(value);

    if (isValid) {
      groupElement.classList.remove('has-error');
    } else {
      groupElement.classList.add('has-error');
    }

    return isValid;
  };

  // Dynamic validation on inputs blur
  form.querySelectorAll('input').forEach(input => {
    const fieldName = input.name;
    if (rules[fieldName]) {
      input.addEventListener('blur', () => {
        validateField(input, fieldName);
      });
      // Clear error as user types
      input.addEventListener('input', () => {
        const groupElement = input.closest('.form-group');
        if (groupElement && groupElement.classList.contains('has-error')) {
          groupElement.classList.remove('has-error');
        }
      });
    }
  });

  // Form submission handler
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    let isFormValid = true;

    // Validate all fields
    form.querySelectorAll('input').forEach(input => {
      const fieldName = input.name;
      if (rules[fieldName]) {
        const isFieldValid = validateField(input, fieldName);
        if (!isFieldValid) {
          isFormValid = false;
        }
      }
    });

    if (isFormValid) {
      // Configure your deployed Google Apps Script Web App URL here
      const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyoRXErGUmdixydFJeetQ4pYcB9bK3LHHEEE2JbSY1n7DMc-jYxI2Hr6dZOuncT6iyO-Q/exec';

      // Configure email recipients here (without redeploying the Apps Script)
      const EMAIL_TO = 'techsupport@kay.org.in';
      const EMAIL_CC = ''; // Add CC emails here if needed (e.g. 'divya@kay.org.in, noor.mohamed@kay.org.in, swetha.m@kaymultimedia.in')

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.textContent : "Request Appointment";

      if (APPS_SCRIPT_URL && APPS_SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Sending...";
        }

        // Send data using URL-encoded form parameters to match Apps Script e.parameter
        const urlEncodedData = new URLSearchParams();
        urlEncodedData.append('fullName', document.getElementById('full-name').value);
        urlEncodedData.append('phone', document.getElementById('phone-number').value);
        urlEncodedData.append('preferredDate', document.getElementById('preferred-date').value);
        urlEncodedData.append('toEmail', EMAIL_TO);
        urlEncodedData.append('ccEmail', EMAIL_CC);

        fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          body: urlEncodedData,
          mode: 'no-cors', // Bypasses preflight CORS blocks
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
          .then(() => {
            successOverlay.classList.add('show');
            form.reset();
          })
          .catch((error) => {
            console.error("Submission error:", error);
            // Fallback to show success modal so user flow is not broken
            successOverlay.classList.add('show');
            form.reset();
          })
          .finally(() => {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = originalBtnText;
            }
          });
      } else {
        // Run locally as a mock (useful for testing before deployment)
        successOverlay.classList.add('show');
        form.reset();
      }
    } else {
      // Focus on first invalid element
      const firstError = form.querySelector('.form-group.has-error input');
      if (firstError) {
        firstError.focus();
      }
    }
  });

  // Close success modal handler
  if (closeSuccessBtn) {
    closeSuccessBtn.addEventListener('click', () => {
      successOverlay.classList.remove('show');
    });
  }

  // Close success modal when clicking on the overlay backdrop
  successOverlay.addEventListener('click', (event) => {
    if (event.target === successOverlay) {
      successOverlay.classList.remove('show');
    }
  });
}
