import { useEffect, useRef } from "react";

/**
 * Attach to any element to fade-slide it in when it enters the viewport.
 * @param {object} options - IntersectionObserver + animation options
 */
const useScrollReveal = ({
  threshold = 0.12,
  delay = 0,
  duration = 600,
  fromY = 32,
  once = true,
} = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Set initial hidden state
    el.style.opacity = "0";
    el.style.transform = `translateY(${fromY}px)`;
    el.style.transition = `opacity ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`;
    el.style.willChange = "opacity, transform";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          if (once) observer.unobserve(el);
        } else if (!once) {
          el.style.opacity = "0";
          el.style.transform = `translateY(${fromY}px)`;
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, delay, duration, fromY, once]);

  return ref;
};

export default useScrollReveal;
