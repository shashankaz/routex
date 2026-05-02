interface BadgeProps {
  label: string;
  color?: "green" | "orange" | "red" | "blue" | "stone" | "yellow";
}

const colorMap = {
  green: "bg-green-100 text-green-700",
  orange: "bg-orange-100 text-orange-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
  stone: "bg-stone-100 text-stone-600",
  yellow: "bg-yellow-100 text-yellow-700",
};

export function Badge({ label, color = "stone" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorMap[color]}`}
    >
      {label}
    </span>
  );
}
