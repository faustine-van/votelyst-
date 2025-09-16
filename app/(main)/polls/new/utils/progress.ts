export function calculatePollProgress(
  title: string,
  filledOptions: number,
  totalOptions: number,
  status: string | null,
  pollType: string | null
): number {
  const totalSteps = 3; // title, options, settings
  let completedSteps = 0;

  if (title.trim() !== "") completedSteps++;
  if (filledOptions >= 2) completedSteps++;
  if (status && pollType) completedSteps++;

  return Math.round((completedSteps / totalSteps) * 100);
}
