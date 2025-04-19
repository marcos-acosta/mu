"use client";

import { useEffect, useState } from "react";
import styles from "./App.module.css";
import {
  applyRule,
  canApplyRule1,
  getAllSpanRules,
  LETTER_I,
  NewStateWithIntermediateStates,
  Rule,
} from "../util/miu";
import Action from "./Action";
import { getKeyIndex } from "../util/keyboard";
import EndAction from "./EndAction";

export default function App() {
  const [string, setString] = useState([LETTER_I]);
  const [showActions, setShowActions] = useState(true);

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

  const animateStateTransition = (
    newStateWithTransition: NewStateWithIntermediateStates,
    speedMillis: number = 50
  ) => {
    const allStates = [
      ...newStateWithTransition.intermediateStates,
      newStateWithTransition.newState,
    ];
    const firstState = allStates[0];
    const restOfStates = allStates.slice(1);
    setString(firstState);
    if (restOfStates.length === 0) {
      return;
    }
    setShowActions(false);
    allStates.forEach((state, index) => {
      setTimeout(() => {
        setString(state);
        if (index === allStates.length - 1) {
          setShowActions(true);
        }
      }, index * speedMillis);
    });
  };

  const applyRuleToString = (rule: Rule) => {
    const newStateWithTransition = applyRule(string, rule);
    animateStateTransition(newStateWithTransition);
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (!showActions) {
      return;
    }
    const key = event.key;
    if (key === " ") {
      event.preventDefault();
      setString([LETTER_I]);
    } else {
      const index = getKeyIndex(key);
      if (index !== null && index < allRules.length) {
        const rule = allRules[index];
        applyRuleToString(rule);
      }
    }
  };

  useEffect(() => {
    addEventListener("keypress", handleKeyPress);
    return () => removeEventListener("keypress", handleKeyPress);
  }, [allRules, string, showActions]);

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
                letter === LETTER_I ? "var(--foreground)" : "var(--background)",
            }}
          >
            {showActions && (
              <>
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
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
