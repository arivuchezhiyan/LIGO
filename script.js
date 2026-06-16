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
      // Show success modal overlay
      successOverlay.classList.add('show');
      form.reset();
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
