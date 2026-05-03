import { useAnimCounter } from "../../hooks/useAnimCounter";

/**
 * Animated number counter that counts up from 0.
 */
export default function AnimCounter({ value, color, size = 26 }) {
  const display = useAnimCounter(value);

  return (
    <span style={{
      fontSize:      size,
      fontWeight:    900,
      color,
      fontFamily:    "inherit",
      letterSpacing: "-1px",
    }}>
      {display}
    </span>
  );
}
