import { DEMO_USER_ID } from "../Mocks/users.js";
import { getPublicUser, saveDemoProfile } from "./userStore.js";

document.addEventListener("DOMContentLoaded", () => {
  const user = getPublicUser(DEMO_USER_ID);
  if (!user) return;
  document.getElementById("settings-username").value = user.username;
  document.getElementById("settings-joined").value = new Intl.DateTimeFormat("en-US", {
    month: "long", day: "numeric", year: "numeric", timeZone: "UTC"
  }).format(new Date(`${user.joinedAt}T00:00:00Z`));
  document.getElementById("settings-display-name").value = user.displayName;
  document.getElementById("settings-bio").value = user.bio;
  const form = document.getElementById("settings-profile-form");
  const feedback = document.getElementById("settings-feedback");
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    try {
      const result = saveDemoProfile({
        displayName: form.elements.namedItem("displayName").value,
        bio: form.elements.namedItem("bio").value
      });
      feedback.textContent = result.persisted
        ? "Public profile updated in this browser. No server account was changed."
        : "Public profile updated for this session only. Browser storage is unavailable.";
      feedback.hidden = false;
    } catch (error) {
      feedback.textContent = error.message;
      feedback.hidden = false;
    }
  });
});
