export const LETTER_I = "I";
export const LETTER_U = "U";

export interface Rule {
  ruleNumber: number;
  startIndexInclusive: number;
  row: number;
}

export interface NewStateWithIntermediateStates {
  newState: string[];
  intermediateStates: string[][];
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

export const applyRule1 = (
  string: string[]
): NewStateWithIntermediateStates => ({
  newState: [...string, LETTER_U],
  intermediateStates: [],
});

export const applyRule2 = (
  string: string[]
): NewStateWithIntermediateStates => ({
  newState: [...string, ...string],
  intermediateStates: [...Array(string.length).keys()].map((i) => [
    ...string,
    ...string.slice(0, i),
  ]),
});

export const applyRule3 = (
  string: string[],
  startIndex: number
): NewStateWithIntermediateStates => ({
  newState: [
    ...string.slice(0, startIndex),
    LETTER_U,
    ...string.slice(startIndex + 3),
  ],
  intermediateStates: [...Array(3).keys()].map((i) => [
    ...string.slice(0, startIndex),
    ...string.slice(startIndex + i + 1),
  ]),
});

export const applyRule4 = (
  string: string[],
  startIndex: number
): NewStateWithIntermediateStates => ({
  newState: [...string.slice(0, startIndex), ...string.slice(startIndex + 2)],
  intermediateStates: [
    [...string.slice(0, startIndex), ...string.slice(startIndex + 1)],
  ],
});

export const applyRule = (
  string: string[],
  rule: Rule
): NewStateWithIntermediateStates => {
  switch (rule.ruleNumber) {
    case 1:
      return applyRule1(string);
    case 2:
      return applyRule2(string);
    case 3:
      return applyRule3(string, rule.startIndexInclusive);
    case 4:
      return applyRule4(string, rule.startIndexInclusive);
    default:
      return {
        newState: string,
        intermediateStates: [],
      };
  }
};
