import { useTypedText } from "../../hooks/useTypedText";

/** Typewriter cycling text component */
export default function TypedText({ words, color }) {
  const { display } = useTypedText(words);

  return (
    <span style={{ color, fontWeight: 900 }}>
      {display}
      <span style={{ animation: "blink 1s infinite" }}>|</span>
    </span>
  );
}
