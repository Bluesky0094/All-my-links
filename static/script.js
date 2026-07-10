const profileConfig = {
  name: "Stefano Caccamo",
  eyebrow: "Video editor · Web creator · Supporto digitale",
  tagline: "Aiuto professionisti e piccole attività a trasformare idee, contenuti e servizi in esperienze digitali chiare e concrete.",
};

const socialLinks = [
  {
    group: "Servizi",
    label: "Video editing",
    description: "Montaggio per reel, contenuti social, promo e comunicazione aziendale.",
    url: "https://creativecuts.work",
    icon: "01",
    highlight: true,
    badge: "Servizio principale",
  },
  {
    group: "Servizi",
    label: "Siti web e supporto digitale",
    description: "Siti essenziali, assistenza tecnologica e soluzioni pratiche per lavorare meglio.",
    url: "https://bluesky0094.github.io/Assistenza-tecnologica/",
    icon: "02",
  },
  {
    group: "Progetti selezionati",
    label: "Portfolio creativo",
    description: "Grafica, identità visiva, contenuti digitali e lavori editoriali.",
    url: "https://bluesky0094.github.io/Portfolio/",
    icon: "A",
  },
  {
    group: "Progetti selezionati",
    label: "Ferratek Utensili",
    description: "Sito commerciale e catalogo per uno showroom di utensili professionali.",
    url: "https://bluesky0094.github.io/Ferramenta/",
    icon: "B",
  },
  {
    group: "Progetti selezionati",
    label: "Rinaldi Legnami",
    description: "Presenza digitale editoriale per un fornitore di legno e servizi B2B.",
    url: "https://bluesky0094.github.io/Legno/",
    icon: "C",
  },
];

const contactLinks = [
  {
    type: "call",
    label: "Telefono",
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
  call: "TEL",
  whatsapp: "WA",
  email: "@",
  instagram: "IG",
};

const profileName = document.getElementById("profile-name");
const profileEyebrow = document.getElementById("profile-eyebrow");
const profileTagline = document.getElementById("profile-tagline");
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
let modalOpenedAt = 0;
let scrollLockY = 0;

function appendCardContent(container, item, arrow) {
  const left = document.createElement("span");
  left.className = "left";

  const iconNode = document.createElement("span");
  iconNode.className = "link-index";
  iconNode.setAttribute("aria-hidden", "true");
  iconNode.textContent = item.icon;

  const text = document.createElement("span");
  text.className = "link-copy";

  const labelNode = document.createElement("span");
  labelNode.className = "link-label";
  labelNode.textContent = item.label;
  text.appendChild(labelNode);

  if (item.description) {
    const descriptionNode = document.createElement("span");
    descriptionNode.className = "link-description";
    descriptionNode.textContent = item.description;
    text.appendChild(descriptionNode);
  }

  left.append(iconNode, text);

  if (item.badge) {
    const badgeNode = document.createElement("span");
    badgeNode.className = "link-badge";
    badgeNode.textContent = item.badge;
    left.appendChild(badgeNode);
  }

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
  contactTrigger.textContent = hasContacts ? "Parliamo del tuo progetto" : "Contatto non disponibile";

  if (contactPanel) {
    contactPanel.hidden = !hasContacts;
  }
}

function applyProfile(config) {
  profileName.textContent = config.name;
  profileEyebrow.textContent = config.eyebrow;
  profileTagline.textContent = config.tagline;
}

function createLinkCard(item) {
  const card = document.createElement("a");
  card.className = `link-card${item.highlight ? " highlight" : ""}`;
  card.href = item.url;
  card.target = "_blank";
  card.rel = "noopener noreferrer";
  appendCardContent(card, item, "↗");
  card.setAttribute("aria-label", `${item.label}: ${item.description ?? "apri link"} (si apre in una nuova scheda)`);
  return card;
}

function createLinkGroup(title, items) {
  const section = document.createElement("section");
  section.className = "link-group";

  const heading = document.createElement("h3");
  heading.className = "link-group-title";
  heading.textContent = title;

  const list = document.createElement("div");
  list.className = "link-group-list";
  items.forEach((item) => list.appendChild(createLinkCard(item)));

  section.append(heading, list);
  return section;
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
  appendCardContent(card, { ...item, icon }, "→");
  card.setAttribute("aria-label", `Contatto tramite ${item.label}`);
  return card;
}

function renderLinks() {
  socialLinksRoot.textContent = "";
  contactLinksRoot.textContent = "";
  const validContactLinks = getValidContactLinks(contactLinks);

  const groups = new Map();
  socialLinks.forEach((item) => {
    if (!groups.has(item.group)) groups.set(item.group, []);
    groups.get(item.group).push(item);
  });

  groups.forEach((items, title) => {
    socialLinksRoot.appendChild(createLinkGroup(title, items));
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
  scrollLockY = window.scrollY;
  modalOpenedAt = Date.now();
  modalOverlay.hidden = false;
  document.body.classList.add("modal-open");
  document.body.style.top = `-${scrollLockY}px`;
  document.body.style.position = "fixed";
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";

  if (typeof contactModal.focus === "function") {
    contactModal.focus({ preventScroll: true });
  }
}

function closeModal() {
  modalOverlay.hidden = true;
  document.body.classList.remove("modal-open");
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
  window.scrollTo(0, scrollLockY);

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
    if (Date.now() - modalOpenedAt < 300) {
      return;
    }

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
  document.getElementById("current-year").textContent = String(new Date().getFullYear());
}

init();
