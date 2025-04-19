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
    rule1 && (
      <div className={styles.rule1AbsoluteContainer}>
        <div className={styles.relativeStackedContainer}>
          <div className={styles.rule1Connector}></div>
          <div className={styles.rule1Indicator}>
            <div className={styles.ruleNumber}>
              <svg
                width="90%"
                height="90%"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="15" height="15" fill="var(--background)" />
              </svg>
            </div>
            <div className={styles.keyboardHint}>
              {getIthShortcut(rule1Index)}
            </div>
          </div>
        </div>
      </div>
    )
  );
}
