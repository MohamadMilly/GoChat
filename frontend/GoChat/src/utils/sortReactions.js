const symbolToType = {
  LIKE: "👍",
  LOVE: "❤️",
  LAUGH: "🤣",
  ANGER: "😡",
  CRY: "😭",
  FIRE: "🔥",
  HEARTS_FACE: "🥰",
  SAD: "😢",
  COOL: "😎",
  NAIL_POLISH: "💅",
};

export function sortReactions(reactions) {
  const sortedReactions = {};
  for (let reaction of reactions) {
    const type = reaction.type;
    if (sortedReactions[type]) {
      sortedReactions[type].count++;
      sortedReactions[type].reactors.push(reaction.reactor);
    } else {
      sortedReactions[type] = {
        count: 1,
        symbol: symbolToType[type],
        reactors: [reaction.reactor],
      };
    }
  }
  return Object.entries(sortedReactions);
}
