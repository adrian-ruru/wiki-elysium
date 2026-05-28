const nav = document.querySelector("[data-site-nav]");
const toggle = document.querySelector("[data-menu-toggle]");
const page = document.body.dataset.page;

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

if (page && nav) {
  const activeLink = nav.querySelector(`[data-nav-link="${page}"]`);
  if (activeLink) {
    activeLink.classList.add("is-active");
    activeLink.setAttribute("aria-current", "page");
  }
}
