export function abbreviateText(text) {
  const textArr = text.split(" ");
  const firstLetter = textArr[0] ? textArr[0].at(0) : "";
  const secondLetter = textArr[1] ? textArr[1].at(0) : "";
  return firstLetter + secondLetter;
}
