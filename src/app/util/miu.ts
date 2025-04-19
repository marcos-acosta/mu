const LETTER_I = "I";
const LETTER_U = "U";

export interface Rule {
  ruleNumber: number;
  startIndexInclusive: number;
  endIndexExclusive: number;
  row: number;
}

export const canApplyRule1 = (string: string[]): boolean => {
  return string[string.length - 1] === LETTER_I;
};

export const getIndicesForRule3 = (string: string[]): Rule[] => {
  let indices = [] as Rule[];
  for (let i = 0; i < string.length - 2; i++) {
    if (
      string[i] === LETTER_I &&
      string[i + 1] === LETTER_I &&
      string[i + 2] === LETTER_I
    ) {
      indices.push({
        ruleNumber: 3,
        startIndexInclusive: i,
        endIndexExclusive: i + 3,
        row: 0,
      });
    }
  }
  return indices;
};

export const getIndicesForRule4 = (string: string[]): Rule[] => {
  let indices = [] as Rule[];
  for (let i = 0; i < string.length - 1; i++) {
    if (string[i] === LETTER_U && string[i + 1] === LETTER_U) {
      indices.push({
        ruleNumber: 4,
        startIndexInclusive: i,
        endIndexExclusive: i + 2,
        row: 0,
      });
    }
  }
  return indices;
};

export const adjustRows = (rules: Rule[]): Rule[] => {
  let newRules = [...rules];
  for (let i = 1; i < rules.length; i++) {
    if (rules[i - 1].startIndexInclusive + 1 === rules[i].startIndexInclusive) {
      newRules[i].row = (newRules[i - 1].row + 1) % 3;
    }
  }
  return newRules;
};

export const getAllSpanRules = (string: string[]): Rule[] => {
  const rule3Indices = getIndicesForRule3(string);
  const rule4Indices = getIndicesForRule4(string);
  const spanRules = [...rule3Indices, ...rule4Indices].toSorted(
    (a, b) => a.startIndexInclusive - b.startIndexInclusive
  );
  return adjustRows(spanRules);
};
