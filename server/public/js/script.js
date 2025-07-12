// === Icon Initialization for Lucide ===
console.log("[script.js] loaded!");

window.addEventListener("DOMContentLoaded", () => {
	if (window.lucide) lucide.createIcons();
});

document.addEventListener("DOMContentLoaded", () => {
	console.log("[Dashboard] DOMContentLoaded fired");

	document.querySelectorAll(".send-form").forEach((form) => {
		console.log("[Dashboard] Attaching to form:", form);

		form.addEventListener("submit", async (e) => {
			e.preventDefault();
			console.log("[Dashboard] Submit intercepted");

			// build plain object from the form
			const payload = Object.fromEntries(new FormData(form).entries());
			console.log("[Dashboard] Payload:", payload);

			const button = form.querySelector(".send-btn");
			const originalText = button.innerHTML;
			button.innerHTML = '<i data-lucide="loader"></i> Sending...';
			button.disabled = true;

			try {
				const res = await fetch(form.action, {
					method: "POST",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
						"X-Requested-With": "XMLHttpRequest",
					},
					body: JSON.stringify(payload),
				});
				console.log(
					`[Dashboard] Fetch to ${form.action} returned ${res.status}`
				);

				if (!res.ok) {
					const errorData = await res.json();
					throw new Error(errorData.error || "Transfer request failed");
				}

				const data = await res.json();
				console.log("[Dashboard] Response JSON:", data);

				if (data.success) {
					// Show success message
					button.innerHTML = '<i data-lucide="check"></i> Sent!';
					button.style.backgroundColor = "#10b981";

					// Optional: Remove the row or disable the button permanently
					setTimeout(() => {
						form.closest("tr").style.opacity = "0.5";
						button.disabled = true;
					}, 1000);

					// Redirect after a short delay to show success message
					setTimeout(() => {
						window.location.href = "/walmart/transfer-requests/outgoing";
					}, 2000);
				} else {
					throw new Error(data.error || "Could not send transfer request.");
				}
			} catch (err) {
				console.error("[Dashboard] Transfer request failed", err);

				// Show error message
				button.innerHTML = '<i data-lucide="x"></i> Failed';
				button.style.backgroundColor = "#ef4444";

				// Reset button after 3 seconds
				setTimeout(() => {
					button.innerHTML = originalText;
					button.style.backgroundColor = "";
					button.disabled = false;
					if (window.lucide) lucide.createIcons(); // Recreate icons
				}, 3000);

				alert(err.message || "Network or server error.");
			}
		});
	});
});

// === TRANSFER REQUESTS: Approve/Reject Logic ===
if (document.querySelector(".request-card")) {
	const approveBtns = document.querySelectorAll(".btn.approve");
	const rejectBtns = document.querySelectorAll(".btn.reject");

	approveBtns.forEach((btn) => {
		btn.addEventListener("click", () => {
			btn.closest(".request-card").style.opacity = "0.5";
			btn.closest(".request-card").style.pointerEvents = "none";
		});
	});

	rejectBtns.forEach((btn) => {
		btn.addEventListener("click", () => {
			btn.closest(".request-card").style.opacity = "0.5";
			btn.closest(".request-card").style.pointerEvents = "none";
		});
	});
}

// === ACCEPTED TRANSFERS: Dispatch Action ===
if (document.querySelector(".mark-dispatched")) {
	document.querySelectorAll(".mark-dispatched").forEach((button) => {
		button.addEventListener("click", function () {
			const card = this.closest(".request-card");
			card.remove();
		});
	});
}
