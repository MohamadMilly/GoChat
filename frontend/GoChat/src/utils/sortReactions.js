const symbolToType = {
  LIKE: "👍",
  LOVE: "❤️",
  LAUGH: "🤣",
  ANGER: "😡",
};

export function sortReactions(reactions) {
  const sortedReactions = {};
  for (let reaction of reactions) {
    const type = reaction.type;
    if (sortedReactions[type]) {
      sortedReactions[type].count++;
    } else {
      sortedReactions[type] = { count: 1, symbol: symbolToType[type] };
    }
  }
  return Object.entries(sortedReactions);
}
