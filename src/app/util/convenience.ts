export const combineClasses = (
  ...classNames: (string | false | null | undefined)[]
) => classNames.filter(Boolean).join(" ");
