export function generateTransitionId() {
  const id = crypto.randomUUID();
  localStorage.setItem("transitionId", id);
  return id;
}

export function getGenertedTransitionId() {
  const id = localStorage.getItem("transitionId");
  return id;
}
