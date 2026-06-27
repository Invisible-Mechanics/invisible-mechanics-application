export function isMasterclassModeEnabled(): boolean {
  return (
    process.env.MASTERCLASS_MODE === "true" ||
    process.env.NEXT_PUBLIC_MASTERCLASS_MODE === "true"
  );
}
