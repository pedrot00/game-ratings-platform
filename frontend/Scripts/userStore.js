import { getUserById, DEMO_USER_ID } from "../Mocks/users.js";

// Apenas metadados PUBLICOS do perfil sao editaveis no prototipo.
// Credenciais, email e senhas pertencem exclusivamente ao backend autenticado.
const STORAGE_KEY = "gameaval.demo.profile.v1";
let changes = readStored();

function readStored() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    if (typeof value.displayName !== "string" || typeof value.bio !== "string") return null;
    if (value.displayName.trim().length < 2 || value.displayName.trim().length > 60 || value.bio.length > 300) return null;
    return { displayName: value.displayName.trim(), bio: value.bio.trim() };
  } catch { return null; }
}

export function getPublicUser(userId) {
  const user = getUserById(userId);
  if (!user) return null;
  return user.id === DEMO_USER_ID && changes ? { ...user, ...changes } : { ...user };
}

export function saveDemoProfile({ displayName, bio }) {
  const name = String(displayName ?? "").trim();
  const biography = String(bio ?? "").trim();
  if (name.length < 2 || name.length > 60) throw new Error("Display name must be 2–60 characters.");
  if (biography.length > 300) throw new Error("Biography cannot exceed 300 characters.");
  changes = { displayName: name, bio: biography };
  let persisted = false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(changes));
    persisted = true;
  } catch { /* Private-browsing environments may block localStorage. */ }
  return { user: getPublicUser(DEMO_USER_ID), persisted };
}
