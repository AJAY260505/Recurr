interface DayPillProps {
  children: React.ReactNode;
}

export const DayPill = ({ children }: DayPillProps) => {
  return (
    <div className="bg-secondary rounded-xl px-2 py-1 text-center uppercase text-sm text-muted-foreground font-medium">
      {children}
    </div>
  );
};
