export function filterUsers(users, query) {
  if (!query) return users;
  query = query.toLowerCase();
  return users.filter((user) => {
    const fullnameArr = [user.firstname, user.lastname];
    return (
      fullnameArr.some((word) => word.toLowerCase().startsWith(query)) ||
      fullnameArr.join(" ").toLowerCase().startsWith(query)
    );
  });
}
