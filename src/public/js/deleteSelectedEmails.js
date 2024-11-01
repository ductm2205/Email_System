async function deleteSelectedEmails() {
  const selectedCheckboxes = document.querySelectorAll(
    ".email-checkbox:checked"
  );
  const selectedEmailIds = Array.from(selectedCheckboxes).map(
    (checkbox) => checkbox.value
  );

  if (selectedEmailIds.length === 0) {
    alert("Please select at least one email to delete.");
    return;
  }

  const confirmDelete = confirm(
    "Are you sure you want to delete the selected emails?"
  );
  if (!confirmDelete) return;

  try {
    const response = await fetch(`/api/email/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emailIds: selectedEmailIds,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      alert(data.success);
      window.location.reload(); // Reload the page to reflect the updated inbox
    } else {
      const errorData = await response.json();
      alert(errorData.error || "Failed to delete the emails.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while trying to delete the emails.");
  }
}
