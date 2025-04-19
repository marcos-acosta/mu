import { getIthShortcut } from "../util/keyboard";
import { Rule } from "../util/miu";
import styles from "./Action.module.css";

const getRomanNumeralFromRuleNumber = (ruleNumber: number) => {
  switch (ruleNumber) {
    case 3:
      return "III";
    case 4:
      return "IV";
    default:
      return "";
  }
};

const getRepeatsFromRuleNumber = (ruleNumber: number) => {
  switch (ruleNumber) {
    case 3:
      return 3;
    case 4:
      return 2;
    default:
      return 0;
  }
};

const getWidthFromRuleNumber = (ruleNumber: number) => {
  return `calc(${getRepeatsFromRuleNumber(ruleNumber)} * (100% + 2px) - 1px)`;
};

const getColorFromRuleNumber = (ruleNumber: number) => {
  switch (ruleNumber) {
    case 3:
      return "var(--theme-pink)";
    case 4:
      return "var(--theme-blue)";
    default:
      return "black";
  }
};

const getConnectorHeightFromRow = (row: number) =>
  `calc((75px * ${row}) + 35px)`;

const getBottomFromRowNumber = (rowNumber: number) =>
  `calc(-12px - ${rowNumber * 10}px)`;

interface ActionProps {
  rules: Rule[];
  index: number;
}

export default function Action(props: ActionProps) {
  const ruleIndex = props.rules.findIndex(
    (rule) => rule.startIndexInclusive === props.index
  );
  const rule = ruleIndex !== -1 ? props.rules[ruleIndex] : null;
  const keyboardHint = rule ? getIthShortcut(ruleIndex) : null;

  return rule ? (
    <>
      <div
        className={styles.actionUnderline}
        style={{
          width: getWidthFromRuleNumber(rule.ruleNumber),
          backgroundColor: getColorFromRuleNumber(rule.ruleNumber),
          bottom: getBottomFromRowNumber(rule.row),
        }}
      >
        <div className={styles.relativeContainer}>
          <div className={styles.connectorAndIndicator}>
            <div
              className={styles.actionConnector}
              style={{
                backgroundColor: getColorFromRuleNumber(rule.ruleNumber),
                height: getConnectorHeightFromRow(rule.row),
              }}
            />
            <div
              className={styles.actionIndicator}
              style={{
                backgroundColor: getColorFromRuleNumber(rule.ruleNumber),
              }}
            >
              <div className={styles.ruleNumber}>
                {getRomanNumeralFromRuleNumber(rule.ruleNumber)}
              </div>
              <div className={styles.keyboardHint}>{keyboardHint}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  ) : null;
}
