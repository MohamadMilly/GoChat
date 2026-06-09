export function getSoundPreferences() {
  const soundPrefrences = JSON.parse(localStorage.getItem("soundPreferences"));
  return soundPrefrences;
}

export function setSoundPreferences({ chatBubbleSound }) {
  localStorage.setItem("soundPreferences", JSON.stringify({ chatBubbleSound }));
}
