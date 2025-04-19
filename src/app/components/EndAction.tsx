import { getIthShortcut } from "../util/keyboard";
import { Rule } from "../util/miu";
import styles from "./Action.module.css";

interface EndActionProps {
  rules: Rule[];
}

const getColorFromRuleNumber = (ruleNumber: number) => {
  switch (ruleNumber) {
    case 1:
      return "var(--theme-eggplant)";
    case 2:
      return "var(--theme-green)";
    default:
      return "black";
  }
};

export default function EndAction(props: EndActionProps) {
  const rule1Index = props.rules.findIndex((rule) => rule.ruleNumber === 1);
  const rule1 = rule1Index !== -1 ? props.rules[rule1Index] : null;
  const rule2Index = props.rules.findIndex((rule) => rule.ruleNumber === 2);
  const rule2 = rule2Index !== -1 ? props.rules[rule2Index] : null;

  return (
    <div className={styles.stackedContainer}>
      {rule2 && (
        <div
          className={styles.endRule}
          style={{ backgroundColor: getColorFromRuleNumber(2) }}
        >
          <div className={styles.ruleNumber}>II</div>
          <div className={styles.keyboardHint}>
            {getIthShortcut(rule2Index)}
          </div>
        </div>
      )}
      {rule1 && (
        <div
          className={styles.endRule}
          style={{ backgroundColor: getColorFromRuleNumber(1) }}
        >
          <div className={styles.ruleNumber}>I</div>
          <div className={styles.keyboardHint}>
            {getIthShortcut(rule1Index)}
          </div>
        </div>
      )}
    </div>
  );
}
