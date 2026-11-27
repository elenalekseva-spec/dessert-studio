'use strict';

// Demo only: no requests, storage, analytics, or personal data in the dialog.
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.getElementById('main-nav');
const form = document.getElementById('registration-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const consentInput = document.getElementById('demo-consent');
const successDialog = document.getElementById('success-dialog');
const closeSuccess = document.getElementById('close-success');
const submitButton = form.querySelector('[type="submit"]');
let lastFormFocus = submitButton;

function closeMenu(returnFocus = false) {
  mainNav.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Открыть меню');
  if (returnFocus) menuToggle.focus();
}

menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  mainNav.classList.toggle('is-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
});

mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  const isMobileMenu = mainNav.classList.contains('is-open');
  closeMenu();
  if (isMobileMenu) {
    const target = document.querySelector(link.hash);
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    }
  }
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && mainNav.classList.contains('is-open')) closeMenu(true);
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
const desktopQuery = window.matchMedia('(min-width: 961px)');
desktopQuery.addEventListener('change', event => { if (event.matches) closeMenu(); });

function setError(input, errorId, message) {
  document.getElementById(errorId).textContent = message;
  if (message) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
  return !message;
}

function validateName() {
  const value = nameInput.value.trim();
  const message = !value ? 'Введите ваше имя.'
    : value.length < 2 ? 'Введите имя длиной хотя бы 2 символа.' : '';
  return setError(nameInput, 'name-error', message);
}
function validateEmail() {
  const value = emailInput.value.trim();
  const message = !value ? 'Введите электронную почту.'
    : emailInput.validity.typeMismatch || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? 'Проверьте адрес почты. Например: name@example.com.' : '';
  return setError(emailInput, 'email-error', message);
}
function validateConsent() {
  return setError(consentInput, 'consent-error', consentInput.checked ? ''
    : 'Подтвердите, что вы понимаете демонстрационный характер регистрации.');
}

[[nameInput, validateName], [emailInput, validateEmail]].forEach(([input, validate]) => {
  input.addEventListener('blur', validate);
  input.addEventListener('input', () => {
    if (input.getAttribute('aria-invalid') === 'true') validate();
  });
});
consentInput.addEventListener('change', validateConsent);

function clearForm() {
  form.reset();
  [nameInput, emailInput, consentInput].forEach(input => input.removeAttribute('aria-invalid'));
  form.querySelectorAll('.field-error').forEach(error => { error.textContent = ''; });
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const valid = [validateName(), validateEmail(), validateConsent()].every(Boolean);
  if (!valid) {
    form.querySelector('[aria-invalid="true"]').focus();
    return;
  }
  lastFormFocus = document.activeElement;
  // Clear entered personal data immediately; nothing is sent or persisted.
  clearForm();
  successDialog.showModal();
  document.body.classList.add('modal-open');
  closeSuccess.focus();
});

closeSuccess.addEventListener('click', () => successDialog.close());
successDialog.addEventListener('click', event => {
  if (event.target !== successDialog) return;
  const bounds = successDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) successDialog.close();
});
successDialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  if (lastFormFocus instanceof HTMLElement) lastFormFocus.focus({ preventScroll: true });
});

// Clear transient form state when navigating away or restoring a back/forward page.
window.addEventListener('pagehide', clearForm);
window.addEventListener('pageshow', event => { if (event.persisted) clearForm(); });

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}
