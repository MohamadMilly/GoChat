import { generateTransitionId } from "../../utils/transitionId";
import { useNavigate } from "react-router";
export function TransitionLink({
  children,
  route,
  setDynamicTransitionId,
  className = "",
}) {
  const navigate = useNavigate();
  const handleGenerateTransitionId = () => {
    const transitionId = generateTransitionId();
    setDynamicTransitionId(transitionId);
    navigate(route, { viewTransition: true });
  };
  return (
    <button
      className={`${className} cursor-pointer`}
      onClick={handleGenerateTransitionId}
    >
      {children}
    </button>
  );
}
