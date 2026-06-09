const root = document.documentElement;
const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const copyButtons = document.querySelectorAll("[data-copy]");
const forceSolidHeader = document.body.classList.contains("detail-page");

const savedTheme = localStorage.getItem("portfolio-theme");
if (savedTheme) {
  root.dataset.theme = savedTheme;
}

function updateHeaderState() {
  header.classList.toggle("is-scrolled", forceSolidHeader || window.scrollY > 24);
}

function closeMenu() {
  document.body.classList.remove("menu-open");
  header.classList.remove("menu-visible");
  mobileNav.classList.remove("is-open");
  menuToggle?.setAttribute("aria-label", "Open menu");
}

window.addEventListener("scroll", updateHeaderState, { passive: true });
updateHeaderState();

menuToggle?.addEventListener("click", () => {
  const isOpen = mobileNav.classList.toggle("is-open");
  document.body.classList.toggle("menu-open", isOpen);
  header.classList.toggle("menu-visible", isOpen);
  menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

mobileNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  if (nextTheme === "light") {
    delete root.dataset.theme;
    localStorage.setItem("portfolio-theme", "light");
  } else {
    root.dataset.theme = "dark";
    localStorage.setItem("portfolio-theme", "dark");
  }
});

copyButtons.forEach((button) => {
  const defaultLabel = button.textContent.trim();

  button.addEventListener("click", async () => {
    const value = button.dataset.copy;
    try {
      await navigator.clipboard.writeText(value);
      button.innerHTML = '<i data-lucide="check"></i> Email copied';
      window.lucide?.createIcons();
      window.setTimeout(() => {
        button.innerHTML = '<i data-lucide="copy"></i> ' + defaultLabel;
        window.lucide?.createIcons();
      }, 1800);
    } catch {
      window.location.href = `mailto:${value}`;
    }
  });
});

window.lucide?.createIcons();
