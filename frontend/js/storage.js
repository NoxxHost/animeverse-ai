export const initStorage = () => {
  if (!localStorage.getItem('animeverse_chats')) {
    localStorage.setItem('animeverse_chats', JSON.stringify({}));
  }
  if (!localStorage.getItem('animeverse_profile')) {
    localStorage.setItem('animeverse_profile', JSON.stringify({
      username: "OtakuGamer",
      bio: "Living in 2D World ✨",
      avatar: ""
    }));
  }
};

export const getChatHistory = (charId) => {
  const allChats = JSON.parse(localStorage.getItem('animeverse_chats')) || {};
  return allChats[charId] || [];
};

export const saveMessage = (charId, role, content) => {
  const allChats = JSON.parse(localStorage.getItem('animeverse_chats')) || {};
  if (!allChats[charId]) allChats[charId] = [];
  allChats[charId].push({ role, content, timestamp: new Date().toISOString() });
  localStorage.setItem('animeverse_chats', JSON.stringify(allChats));
};

export const clearChatHistory = (charId) => {
  const allChats = JSON.parse(localStorage.getItem('animeverse_chats')) || {};
  allChats[charId] = [];
  localStorage.setItem('animeverse_chats', JSON.stringify(allChats));
};
