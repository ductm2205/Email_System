document.addEventListener("DOMContentLoaded", function () {
  const deleteButton = document.getElementById("deleteSelected");
  const checkboxes = document.querySelectorAll(".email-select");

  function updateDeleteButton() {
    const selectedCount = document.querySelectorAll(
      ".email-select:checked"
    ).length;
    deleteButton.disabled = selectedCount === 0;
  }

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", updateDeleteButton);
  });

  deleteButton.addEventListener("click", async function () {
    const selectedIds = Array.from(
      document.querySelectorAll(".email-select:checked")
    ).map((checkbox) => checkbox.dataset.id);

    if (selectedIds.length === 0) return;

    try {
      const response = await fetch("/api/emails/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (response.ok) {
        // Remove deleted emails from the DOM
        selectedIds.forEach((id) => {
          const emailItem = document.querySelector(
            `.email-item[data-id="${id}"]`
          );
          if (emailItem) {
            emailItem.remove();
          }
        });

        deleteButton.disabled = true;

        // Show success message
        const successMessage = document.createElement("div");
        successMessage.className = "success";
        successMessage.textContent = "Emails deleted successfully";
        document
          .querySelector(".inbox-container")
          .insertBefore(
            successMessage,
            document.querySelector(".inbox-actions")
          );

        setTimeout(() => successMessage.remove(), 3000);
      } else {
        throw new Error("Failed to delete emails");
      }
    } catch (error) {
      console.error("Error deleting emails:", error);
      alert("Failed to delete emails. Please try again.");
    }
  });
});
