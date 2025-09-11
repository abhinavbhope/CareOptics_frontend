// TooltipContent.jsx
export const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const { name, value } = payload[0];
  return (
    <div className="rounded-md border border-[hsl(var(--border))] bg-card/90 px-3 py-2 text-sm text-card-foreground shadow-xl">
      <span className="font-semibold">{name}</span>
      <span className="ml-2">{value}</span>
    </div>
  );
};
