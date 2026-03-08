const profileConfig = {
  name: "Stefano Caccamo",
  tagline: "Creator | Founder | Personal Brand",
  avatarSrc: "assets/avatar-ai.svg",
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
    label: "Siti web - Ferramenta",
    url: "https://bluesky0094.github.io/Ferramenta/",
    icon: "🛠️",
  },
  {
    label: "Siti web - Falegnameria",
    url: "https://bluesky0094.github.io/Legno/",
    icon: "🪵",
  },
];

const contactLinks = [
  {
    type: "call",
    label: "Call",
    url: "tel:+393478349694",
  },
  {
    type: "whatsapp",
    label: "WhatsApp",
    url: "https://wa.me/393478349694",
  },
  {
    type: "email",
    label: "Email",
    url: "mailto:stefanocaccamo1@outlook.com",
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
const contactPanel = document.querySelector(".contact-panel");
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

function appendCardContent(container, icon, label, arrow) {
  const left = document.createElement("span");
  left.className = "left";

  const iconNode = document.createElement("span");
  iconNode.className = "emoji";
  iconNode.setAttribute("aria-hidden", "true");
  iconNode.textContent = icon;

  const labelNode = document.createElement("span");
  labelNode.textContent = label;

  left.append(iconNode, labelNode);

  const arrowNode = document.createElement("span");
  arrowNode.className = "arrow";
  arrowNode.setAttribute("aria-hidden", "true");
  arrowNode.textContent = arrow;

  container.append(left, arrowNode);
}

function isPlaceholderContactUrl(url) {
  return [
    "tel:+10000000000",
    "https://wa.me/10000000000",
    "mailto:you@example.com",
    "https://instagram.com/yourhandle",
  ].includes(url);
}

function getValidContactLinks(items) {
  return items.filter((item) => item.url && !isPlaceholderContactUrl(item.url));
}

function syncContactAvailability(items) {
  const hasContacts = items.length > 0;
  contactTrigger.disabled = !hasContacts;
  contactTrigger.setAttribute("aria-disabled", String(!hasContacts));
  contactTrigger.textContent = hasContacts ? "Contact me" : "Contact unavailable";

  if (contactPanel) {
    contactPanel.hidden = !hasContacts;
  }
}

function applyProfile(config) {
  profileName.textContent = config.name;
  profileTagline.textContent = config.tagline;
  profileAvatar.src = config.avatarSrc;
  profileAvatar.alt = `${config.name} avatar`;
  profileAvatar.hidden = false;
}

function createLinkCard(item) {
  if (item.disabled || !item.url) {
    const placeholder = document.createElement("div");
    placeholder.className = `link-card disabled${item.highlight ? " highlight" : ""}`;
    placeholder.setAttribute("aria-disabled", "true");
    appendCardContent(placeholder, item.icon, item.label, "•");
    return placeholder;
  }

  const card = document.createElement("a");
  card.className = `link-card${item.highlight ? " highlight" : ""}`;
  card.href = item.url;
  card.target = "_blank";
  card.rel = "noopener noreferrer";
  appendCardContent(card, item.icon, item.label, "↗");
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
  appendCardContent(card, icon, item.label, "→");
  card.setAttribute("aria-label", `${item.label} contact option`);
  return card;
}

function renderLinks() {
  socialLinksRoot.textContent = "";
  contactLinksRoot.textContent = "";
  const validContactLinks = getValidContactLinks(contactLinks);

  socialLinks.forEach((item) => {
    socialLinksRoot.appendChild(createLinkCard(item));
  });

  validContactLinks.forEach((item) => {
    contactLinksRoot.appendChild(createContactLink(item));
  });

  syncContactAvailability(validContactLinks);
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
  if (contactTrigger.disabled) {
    return;
  }

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
  profileAvatar.addEventListener("error", () => {
    profileAvatar.hidden = true;
  });

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
