async function deleteEmail(emailId) {
  const confirmDelete = confirm("Are you sure you want to delete this email?");
  if (!confirmDelete) return;

  try {
    const response = await fetch(`/email/delete/${emailId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      // Redirect or refresh to show the updated list after deletion

    } else {
      alert("Failed to delete the email.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while trying to delete the email.");
  }
}
