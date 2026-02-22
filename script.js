const profileConfig = {
  name: "Stefano Caccamo",
  tagline: "Creator | Founder | Personal Brand",
  avatarSrc: "assets/avatar.jpg",
};

const socialLinks = [
  {
    label: "Montaggio Video",
    url: "https://creativecuts.work",
    icon: "📸",
    highlight: true,
  },
  {
    label: "Grafica",
    url: "",
    icon: "🎵",
    disabled: true,
  },
  {
    label: "Siti web - Assistenza tecnologica",
    url: "https://bluesky0094.github.io/Assistenza-tecnologica/",
    icon: "▶️",
  },
  {
    label: "Siti web - Portfolio",
    url: "https://bluesky0094.github.io/Portfolio/",
    icon: "🌐",
  },
  {
    label: "GitHub",
    url: "https://github.com/Bluesky0094",
    icon: "💻",
  },
];

const contactLinks = [
  {
    type: "call",
    label: "Call",
    url: "tel:+10000000000",
  },
  {
    type: "whatsapp",
    label: "WhatsApp",
    url: "https://wa.me/10000000000",
  },
  {
    type: "email",
    label: "Email",
    url: "mailto:you@example.com",
  },
  {
    type: "instagram",
    label: "Instagram DM",
    url: "https://instagram.com/yourhandle",
  },
];

const iconByContactType = {
  call: "📞",
  whatsapp: "💬",
  email: "✉️",
  instagram: "📩",
};

const profileName = document.getElementById("profile-name");
const profileTagline = document.getElementById("profile-tagline");
const profileAvatar = document.getElementById("profile-avatar");
const socialLinksRoot = document.getElementById("social-links");
const contactLinksRoot = document.getElementById("contact-links");
const modalOverlay = document.getElementById("modal-overlay");
const contactModal = document.getElementById("contact-modal");
const contactTrigger = document.getElementById("contact-trigger");
const modalClose = document.getElementById("modal-close");

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

let lastFocusedElement = null;

function applyProfile(config) {
  profileName.textContent = config.name;
  profileTagline.textContent = config.tagline;
  profileAvatar.src = config.avatarSrc;
  profileAvatar.alt = `${config.name} avatar`;
}

function createLinkCard(item) {
  if (item.disabled || !item.url) {
    const placeholder = document.createElement("div");
    placeholder.className = `link-card disabled${item.highlight ? " highlight" : ""}`;
    placeholder.setAttribute("aria-disabled", "true");
    placeholder.innerHTML = `
      <span class="left">
        <span class="emoji" aria-hidden="true">${item.icon}</span>
        <span>${item.label}</span>
      </span>
      <span class="arrow" aria-hidden="true">•</span>
    `;
    return placeholder;
  }

  const card = document.createElement("a");
  card.className = `link-card${item.highlight ? " highlight" : ""}`;
  card.href = item.url;
  card.target = "_blank";
  card.rel = "noopener noreferrer";
  card.innerHTML = `
    <span class="left">
      <span class="emoji" aria-hidden="true">${item.icon}</span>
      <span>${item.label}</span>
    </span>
    <span class="arrow" aria-hidden="true">↗</span>
  `;
  card.setAttribute("aria-label", `${item.label} (opens in new tab)`);
  return card;
}

function createContactLink(item) {
  const card = document.createElement("a");
  card.className = "contact-link";
  card.href = item.url;

  if (item.url.startsWith("https://")) {
    card.target = "_blank";
    card.rel = "noopener noreferrer";
  }

  const icon = iconByContactType[item.type] ?? "🔗";
  card.innerHTML = `
    <span class="left">
      <span class="emoji" aria-hidden="true">${icon}</span>
      <span>${item.label}</span>
    </span>
    <span class="arrow" aria-hidden="true">→</span>
  `;

  card.setAttribute("aria-label", `${item.label} contact option`);
  return card;
}

function renderLinks() {
  socialLinksRoot.textContent = "";
  contactLinksRoot.textContent = "";

  socialLinks.forEach((item) => {
    socialLinksRoot.appendChild(createLinkCard(item));
  });

  contactLinks.forEach((item) => {
    contactLinksRoot.appendChild(createContactLink(item));
  });
}

function getFocusableInModal() {
  return Array.from(contactModal.querySelectorAll(focusableSelector));
}

function trapFocus(event) {
  if (event.key !== "Tab" || modalOverlay.hidden) {
    return;
  }

  const focusables = getFocusableInModal();
  if (focusables.length === 0) {
    return;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function openModal() {
  lastFocusedElement = document.activeElement;
  modalOverlay.hidden = false;
  document.body.classList.add("modal-open");
  const focusables = getFocusableInModal();
  (focusables[0] || contactModal).focus();
}

function closeModal() {
  modalOverlay.hidden = true;
  document.body.classList.remove("modal-open");

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  } else {
    contactTrigger.focus();
  }
}

function handleKeydown(event) {
  if (event.key === "Escape" && !modalOverlay.hidden) {
    closeModal();
    return;
  }

  trapFocus(event);
}

function bindEvents() {
  contactTrigger.addEventListener("click", openModal);
  modalClose.addEventListener("click", closeModal);

  modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) {
      closeModal();
    }
  });

  document.addEventListener("keydown", handleKeydown);
}

function init() {
  applyProfile(profileConfig);
  renderLinks();
  bindEvents();
}

init();
