const body = document.body;
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll('a[href^="#"]');
const faqButtons = document.querySelectorAll(".faq-question");
const form = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const doctolibModal = document.querySelector("#doctolib-demo-modal");
const doctolibTriggers = document.querySelectorAll("[data-doctolib-demo]");
const doctolibCloseButtons = document.querySelectorAll("[data-doctolib-close]");
const doctolibChoiceButtons = document.querySelectorAll("[data-booking-choice]");
const doctolibBackButtons = document.querySelectorAll("[data-doctolib-back]");
const doctolibResetButton = document.querySelector("[data-doctolib-reset]");
const stepDots = document.querySelectorAll("[data-step-dot]");
const bookingSelections = {
  time: "",
  motif: "",
  consultation: "",
};

function scrollToSection(target) {
  const header = document.querySelector(".site-header");
  const headerHeight = header?.getBoundingClientRect().height || 0;
  const offset = headerHeight + 24;
  const targetTop = target.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({
    top: Math.max(targetTop, 0),
    behavior: "smooth",
  });
}

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const isOpen = body.classList.toggle("menu-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    body.classList.remove("menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    if (doctolibModal?.classList.contains("is-open")) {
      closeDoctolibDemo();
    }
    requestAnimationFrame(() => scrollToSection(target));
  });
});

faqButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const answer = button.closest(".faq-item")?.querySelector(".faq-answer");
    const icon = button.querySelector("span");
    const isExpanded = button.getAttribute("aria-expanded") === "true";

    button.setAttribute("aria-expanded", String(!isExpanded));
    if (answer) {
      answer.hidden = isExpanded;
    }
    if (icon) {
      icon.textContent = isExpanded ? "+" : "−";
    }
  });
});

function setDoctolibStep(step) {
  if (!doctolibModal) return;

  doctolibModal.querySelectorAll("[data-step]").forEach((stepPanel) => {
    const isActive = stepPanel.dataset.step === String(step);
    stepPanel.hidden = !isActive;
    stepPanel.classList.toggle("is-active", isActive);
  });

  stepDots.forEach((dot) => {
    dot.classList.toggle("is-active", Number(dot.dataset.stepDot) <= step);
  });
}

function openDoctolibDemo() {
  if (!doctolibModal) return;

  setDoctolibStep(1);
  doctolibModal.classList.add("is-open");
  doctolibModal.setAttribute("aria-hidden", "false");
  body.classList.add("modal-open");
  doctolibModal.querySelector("button")?.focus();
}

function closeDoctolibDemo() {
  if (!doctolibModal) return;

  doctolibModal.classList.remove("is-open");
  doctolibModal.setAttribute("aria-hidden", "true");
  body.classList.remove("modal-open");
}

function resetDoctolibDemo() {
  bookingSelections.time = "";
  bookingSelections.motif = "";
  bookingSelections.consultation = "";
  setDoctolibStep(1);
}

doctolibTriggers.forEach((trigger) => {
  trigger.addEventListener("click", openDoctolibDemo);
});

doctolibCloseButtons.forEach((button) => {
  button.addEventListener("click", closeDoctolibDemo);
});

doctolibChoiceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const choiceType = button.dataset.bookingChoice;
    const value = button.dataset.bookingValue || "";

    if (choiceType === "Motif") {
      bookingSelections.motif = value;
      setDoctolibStep(2);
      return;
    }

    if (choiceType === "Consultation") {
      bookingSelections.consultation = value;
      setDoctolibStep(3);
      return;
    }

    bookingSelections.time = value;
    document.querySelector("[data-summary-motif]").textContent = bookingSelections.motif;
    document.querySelector("[data-summary-consultation]").textContent = bookingSelections.consultation;
    document.querySelector("[data-summary-time]").textContent = bookingSelections.time;
    setDoctolibStep(4);
  });
});

doctolibBackButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetStep = Number(button.dataset.doctolibBack) || 1;
    setDoctolibStep(targetStep);
  });
});

doctolibResetButton?.addEventListener("click", resetDoctolibDemo);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && doctolibModal?.classList.contains("is-open")) {
    closeDoctolibDemo();
  }
});

function setFieldError(field, message) {
  const wrapper = field.closest(".form-field");
  const error = wrapper?.querySelector(".field-error");
  field.classList.toggle("invalid", Boolean(message));
  field.setAttribute("aria-invalid", message ? "true" : "false");
  if (error) {
    error.textContent = message;
  }
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let isValid = true;
    const fields = Array.from(form.querySelectorAll("input, textarea"));

    fields.forEach((field) => {
      const value = field.value.trim();
      let message = "";

      if (!value) {
        message = "Ce champ est requis.";
      } else if (field.type === "email" && !validateEmail(value)) {
        message = "Veuillez saisir une adresse email valide.";
      } else if (field.name === "phone" && value.length < 6) {
        message = "Veuillez saisir un numéro de téléphone valide.";
      } else if (field.name === "message" && value.length < 10) {
        message = "Votre message doit contenir au moins 10 caractères.";
      }

      if (message) {
        isValid = false;
      }
      setFieldError(field, message);
    });

    if (!isValid) {
      formStatus.textContent = "Merci de vérifier les champs indiqués.";
      return;
    }

    form.reset();
    fields.forEach((field) => setFieldError(field, ""));
    formStatus.textContent = "Merci, votre demande a bien été préparée. Le formulaire sera connecté au service d’envoi choisi par le cabinet dans la version finale.";
  });
}
