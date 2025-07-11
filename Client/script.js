// === Icon Initialization for Lucide ===
window.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) lucide.createIcons();
});

// === DASHBOARD: Handle Send Button Clicks ===
if (document.querySelector(".product-table")) {
  document.querySelectorAll(".btn").forEach(button => {
    button.addEventListener("click", function () {
      const btn = this;
      const row = btn.closest("tr");

      btn.disabled = true;
      btn.textContent = "Request Sent";
      btn.classList.add("disabled-btn");

      setTimeout(() => {
        const accepted = Math.random() < 0.5;
        if (accepted) {
          row.remove(); // Simulate approval
        } else {
          btn.textContent = "Rejected";
          btn.classList.remove("disabled-btn");
          btn.classList.add("rejected-btn");
        }
      }, 2000);
    });
  });
}

// === TRANSFER REQUESTS: Approve/Reject Logic ===
if (document.querySelector(".request-card")) {
  const approveBtns = document.querySelectorAll(".btn.approve");
  const rejectBtns = document.querySelectorAll(".btn.reject");

  approveBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      btn.closest(".request-card").style.opacity = "0.5";
      btn.closest(".request-card").style.pointerEvents = "none";
    });
  });

  rejectBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      btn.closest(".request-card").style.opacity = "0.5";
      btn.closest(".request-card").style.pointerEvents = "none";
    });
  });
}

// === ACCEPTED TRANSFERS: Dispatch Action ===
if (document.querySelector(".mark-dispatched")) {
  document.querySelectorAll(".mark-dispatched").forEach(button => {
    button.addEventListener("click", function () {
      const card = this.closest(".request-card");
      card.remove();
    });
  });
}
