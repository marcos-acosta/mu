import { getIthShortcut } from "../util/keyboard";
import { Rule } from "../util/miu";
import styles from "./Action.module.css";

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
  return `calc(${getRepeatsFromRuleNumber(ruleNumber)} * (100% + 1px) - 1px)`;
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
  applyRuleToString: (rule: Rule) => void;
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
        <div
          className={styles.relativeContainer}
          style={{ zIndex: props.rules.length - ruleIndex }}
        >
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
              onClick={() => props.applyRuleToString(rule)}
            >
              <div className={styles.ruleNumber}>
                <svg
                  width="90%"
                  height="90%"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {rule.ruleNumber === 4 ? (
                    <path
                      d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z"
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                      stroke="currentColor"
                      strokeWidth="0.75"
                    ></path>
                  ) : (
                    <rect width="15" height="15" fill="var(--background)" />
                  )}
                </svg>
              </div>
              <div className={styles.keyboardHint}>{keyboardHint}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  ) : null;
}
