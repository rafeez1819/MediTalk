import { Link } from "@tanstack/react-router";

export function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <p
      className={
        compact ? "text-xs leading-relaxed text-subtle" : "text-sm leading-relaxed text-muted"
      }
    >
      MediTalk supports conversations. It does not replace a certified medical interpreter or
      clinical judgment.{" "}
      <Link to="/about" className="underline decoration-line underline-offset-2">
        About & safety
      </Link>
    </p>
  );
}
