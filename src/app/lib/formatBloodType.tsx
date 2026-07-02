import type { ReactNode } from "react";

export const formatBloodTypeHero = (type: string): ReactNode => {
  const match = type.match(/^([ABO]+)([+-])$/);
  if (!match) return type;
  return <>{match[1]}<sup className="text-2xl align-super">{match[2]}</sup></>;
};
