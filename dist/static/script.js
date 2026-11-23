const copyEmail = document.querySelector('[data-copy-email]');
const email = document.querySelector('.contact-list a[href^="mailto:"]');
const status = document.querySelector('[data-copy-status]');
copyEmail.hidden = false;
copyEmail.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(email.textContent.trim());
    status.textContent = 'Email copiata.';
  } catch {
    status.textContent = 'Puoi copiare l’indirizzo email qui sopra.';
  }
});
