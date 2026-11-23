import { useEffect } from "react";

export default function ScrollAnimations() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("reveal-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    const watch = (node) => {
      if (node.nodeType !== 1) return;
      if (node.matches(".reveal:not(.visible)")) observer.observe(node);
      node.querySelectorAll(".reveal:not(.visible)").forEach((element) => observer.observe(element));
    };

    watch(document.body);

    const mutations = new MutationObserver((records) =>
      records.forEach((record) => record.addedNodes.forEach(watch))
    );
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
      root.classList.remove("reveal-ready");
    };
  }, []);

  return null;
}
