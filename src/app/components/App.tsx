"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./App.module.css";
import { applyRule, canApplyRule1, getAllSpanRules, Rule } from "../util/miu";
import Action from "./Action";
import { getKeyIndex } from "../util/keyboard";

export default function App() {
  const [string, setString] = useState([
    "M",
    "I",
    "U",
    "I",
    "U",
    "I",
    "I",
    "I",
    "I",
    "I",
    "I",
    "U",
    "I",
    "I",
    "U",
    "U",
    "I",
    "I",
  ]);

  const isRule1Applicable = canApplyRule1(string);
  const spanRules = getAllSpanRules(string);
  const allRules = [
    isRule1Applicable
      ? { ruleNumber: 1, startIndexInclusive: string.length, row: 0 }
      : undefined,
    { ruleNumber: 2, startIndexInclusive: string.length, row: 0 },
    ...spanRules,
  ].filter(Boolean) as Rule[];

  const cellWidth = `min(calc(100% / ${string.length}), 5%)`;
  const fontSize = `min(calc(90vw / ${string.length}), 7vw)`;

  const handleKeyPress = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    const index = getKeyIndex(key);
    if (index !== null && index < allRules.length) {
      const rule = allRules[index];
      setString(applyRule(string, rule));
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
              fontSize: fontSize,
            }}
          >
            {letter}
            <Action rules={allRules} index={index} />
          </div>
        ))}
      </div>
    </div>
  );
}
