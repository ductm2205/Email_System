function toggleSelectAll(selectAllCheckbox) {
  const checkboxes = document.querySelectorAll(".email-checkbox");
  checkboxes.forEach((checkbox) => {
    checkbox.checked = selectAllCheckbox.checked;
  });
}
