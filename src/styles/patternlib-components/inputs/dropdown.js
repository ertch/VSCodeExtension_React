// Dropdown Menu
let selects = document.querySelectorAll(".dropdown");
for (let i = 0; i < selects.length; i++) {
  const select = selects[i];
  select.addEventListener('click', () => {
    if (select.classList.contains("dropdown--ghost")) {
      select.classList.add("dropdown-active--ghost")
    } else {
      select.classList.add("dropdown-active");
    }
  });
  select.addEventListener('blur', () => {
    if (select.classList.contains("dropdown--ghost")) {
      select.classList.remove("dropdown-active--ghost")
    } else {
      select.classList.remove("dropdown-active");
    }
  });

  let select_options = select.querySelectorAll(".dropdown-option");

  for (let j = 0; j < select_options.length; j++) {
    select_options[j].addEventListener('click', (e) => {
      e.stopPropagation();
      if (select.classList.contains("dropdown--ghost")) {
        select.classList.remove("dropdown-active--ghost")
      } else {
        select.classList.remove("dropdown-active");
      }
    });
  }
}
