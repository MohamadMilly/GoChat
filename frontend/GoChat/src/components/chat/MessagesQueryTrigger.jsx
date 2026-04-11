import { useEffect, useRef } from "react";
import { useMessages } from "../../hooks/useMessages";

export default function MessagesQueryTrigger({ conversationId }) {
  const { fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMessages(conversationId);
  const loaderRef = useRef(null);

  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });

    const currentLoader = loaderRef.current;
    observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return <div ref={loaderRef} style={{ height: "5px" }} />;
}
