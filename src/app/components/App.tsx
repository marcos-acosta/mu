"use client";

import { useEffect, useState } from "react";
import styles from "./App.module.css";
import { applyRule, canApplyRule1, getAllSpanRules, Rule } from "../util/miu";
import Action from "./Action";
import { getKeyIndex } from "../util/keyboard";
import EndAction from "./EndAction";

export default function App() {
  const [string, setString] = useState(["I"]);

  const isRule1Applicable = canApplyRule1(string);
  const spanRules = getAllSpanRules(string);
  const allRules = [
    {
      ruleNumber: 2,
      startIndexInclusive: string.length,
      row: 0,
    },
    ...spanRules,
    isRule1Applicable && {
      ruleNumber: 1,
      startIndexInclusive: string.length,
      row: 0,
    },
  ].filter(Boolean) as Rule[];

  const cellWidth = `min(calc(100% / ${string.length}), 5%)`;

  const applyRuleToString = (rule: Rule) => setString(applyRule(string, rule));

  const handleKeyPress = (event: KeyboardEvent) => {
    const key = event.key;
    const index = getKeyIndex(key);
    if (index !== null && index < allRules.length) {
      const rule = allRules[index];
      applyRuleToString(rule);
    }
  };

  useEffect(() => {
    addEventListener("keypress", handleKeyPress);
    return () => removeEventListener("keypress", handleKeyPress);
  }, [allRules, string]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.lettersContainer}>
        {string.map((letter, index) => (
          <div
            key={index}
            className={styles.letter}
            style={{
              width: cellWidth,
              backgroundColor:
                letter === "I" ? "var(--foreground)" : "var(--background)",
            }}
          >
            <Action
              rules={allRules}
              index={index}
              applyRuleToString={applyRuleToString}
            />
            {index === string.length - 1 && (
              <EndAction
                rules={allRules}
                applyRuleToString={applyRuleToString}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
