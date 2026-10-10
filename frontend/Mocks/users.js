// Perfis ficticios para demonstracao. Nao contem credenciais, senhas ou tokens.
// Em producao, o usuario da sessao vem da autenticacao no backend.
export const DEMO_USER_ID = "demo-player";

export const users = [
  {
    id: "demo-player", username: "demo_player", displayName: "Demo Player",
    bio: "Exploring one game at a time.", joinedAt: "2026-06-15", avatarUrl: null
  },
  {
    id: "u-aria", username: "aria_plays", displayName: "Aria", 
    bio: "Stories and discoveries.", joinedAt: "2025-11-08", avatarUrl: null
  },
  {
    id: "u-leo", username: "leo_checks", displayName: "Leo",
    bio: "Action, adventure, and strategy.", joinedAt: "2026-01-17", avatarUrl: null
  },
  {
    id: "u-maya", username: "mayacodes", displayName: "Maya",
    bio: "Indie games enthusiast.", joinedAt: "2026-02-04", avatarUrl: null
  },
  {
    id: "u-jon", username: "jonquest", displayName: "Jon",
    bio: "Looking for the next great RPG.", joinedAt: "2025-12-19", avatarUrl: null
  }
];

export function getUserById(id) {
  return users.find(user => user.id === id) ?? null;
}
