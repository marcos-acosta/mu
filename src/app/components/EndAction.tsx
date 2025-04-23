import { combineClasses } from "../util/convenience";
import { getIthShortcut, MAX_LENGTH } from "../util/keyboard";
import { Rule } from "../util/miu";
import styles from "./Action.module.css";

interface EndActionProps {
  rules: Rule[];
  applyRuleToString: (rule: Rule) => void;
  rule1Allowed: boolean;
  rule2Allowed: boolean;
}

export default function EndAction(props: EndActionProps) {
  const rule1Index = props.rules.findIndex((rule) => rule.ruleNumber === 1);
  const rule1 = rule1Index !== -1 ? props.rules[rule1Index] : null;
  const rule2Index = props.rules.findIndex((rule) => rule.ruleNumber === 2);
  const rule2 = rule2Index !== -1 ? props.rules[rule2Index] : null;

  return (
    <>
      {rule1 && (
        <div className={styles.rule1AbsoluteContainer}>
          <div className={styles.relativeStackedContainer}>
            <div
              className={combineClasses(
                styles.rule1Connector,
                !props.rule1Allowed && styles.disabled
              )}
            ></div>
            <div
              className={combineClasses(
                styles.rule1Indicator,
                !props.rule1Allowed && styles.disabled
              )}
              onClick={() =>
                props.rule1Allowed && props.applyRuleToString(rule1)
              }
            >
              <div className={styles.ruleNumber}>
                <svg
                  width="90%"
                  height="90%"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="1.5"
                    y="1.5"
                    width="12"
                    height="12"
                    stroke="var(--background)"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <div className={styles.keyboardHint}>
                {getIthShortcut(rule1Index)}
              </div>
            </div>
          </div>
        </div>
      )}
      {rule2 && (
        <div
          className={styles.rule2AbsoluteContainer}
          style={{ left: rule1 ? "calc(100% + 13px)" : "calc(100% + 6px)" }}
        >
          <div
            className={combineClasses(
              styles.rule2Indicator,
              !props.rule2Allowed && styles.disabled
            )}
            onClick={() => props.rule2Allowed && props.applyRuleToString(rule2)}
          >
            <div className={styles.ruleNumber}>
              <svg
                width="90%"
                height="90%"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 9.50006C1 10.3285 1.67157 11.0001 2.5 11.0001H4L4 10.0001H2.5C2.22386 10.0001 2 9.7762 2 9.50006L2 2.50006C2 2.22392 2.22386 2.00006 2.5 2.00006L9.5 2.00006C9.77614 2.00006 10 2.22392 10 2.50006V4.00002H5.5C4.67158 4.00002 4 4.67159 4 5.50002V12.5C4 13.3284 4.67158 14 5.5 14H12.5C13.3284 14 14 13.3284 14 12.5V5.50002C14 4.67159 13.3284 4.00002 12.5 4.00002H11V2.50006C11 1.67163 10.3284 1.00006 9.5 1.00006H2.5C1.67157 1.00006 1 1.67163 1 2.50006V9.50006ZM5 5.50002C5 5.22388 5.22386 5.00002 5.5 5.00002H12.5C12.7761 5.00002 13 5.22388 13 5.50002V12.5C13 12.7762 12.7761 13 12.5 13H5.5C5.22386 13 5 12.7762 5 12.5V5.50002Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  stroke="currentColor"
                  strokeWidth="0.25"
                ></path>
              </svg>
            </div>
            <div className={styles.keyboardHint}>
              {getIthShortcut(rule2Index)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
