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
  TheoremString,
} from "../util/miu";
import Action from "./Action";
import { getKeyIndex } from "../util/keyboard";
import EndAction from "./EndAction";

export default function App() {
  const [string, setString] = useState([LETTER_I]);
  const [history, setHistory] = useState<TheoremString[]>([]);
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
    speedMillis?: number
  ) => {
    const allStates = [
      ...newStateWithTransition.intermediateStates,
      newStateWithTransition.newState,
    ];
    const firstState = allStates[0];
    const restOfStates = allStates.slice(1);
    setString(firstState);
    setHistory((prevHistory) => [...prevHistory, string]);
    if (restOfStates.length === 0) {
      return;
    }
    const millis = speedMillis || Math.min(10, 80 / restOfStates.length);
    setShowActions(false);
    allStates.forEach((state, index) => {
      setTimeout(() => {
        setString(state);
        if (index === allStates.length - 1) {
          setShowActions(true);
        }
      }, index * millis);
    });
  };

  const applyRuleToString = (rule: Rule) => {
    const newStateWithTransition = applyRule(string, rule);
    animateStateTransition(newStateWithTransition);
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (!showActions || event.ctrlKey || event.metaKey) {
      return;
    }
    const key = event.key;
    if (key === " ") {
      event.preventDefault();
      setString([LETTER_I]);
    } else if (key === "Backspace") {
      event.preventDefault();
      setString(history[history.length - 1] || [LETTER_I]);
      setHistory(history.slice(0, -1));
    } else {
      const index = getKeyIndex(key);
      if (index !== null && index < allRules.length) {
        const rule = allRules[index];
        applyRuleToString(rule);
      }
    }
  };

  useEffect(() => {
    addEventListener("keydown", handleKeyPress);
    return () => removeEventListener("keydown", handleKeyPress);
  }, [allRules, string, showActions]);

  return (
    <div className={styles.scrollContainer}>
      <div className={styles.introContainer}>
        <div className={styles.textContent}>
          <h1>Can you turn ■ into □?</h1>
          <div className={styles.textBody}>
            <p>
              A few months ago, I &#x28;finally&#x29; finished Douglas
              Hofstadter&apos;s legendary book, <em>Gödel, Escher, Bach</em>. In
              one of the early chapters, Hofstadter introduces a deceptively
              simple puzzle called the <span className={styles.code}>MU</span>
              &ndash;puzzle. The original puzzle uses the letters{" "}
              <span className={styles.code}>M</span>,{" "}
              <span className={styles.code}>U</span>, and{" "}
              <span className={styles.code}>I</span>, but for simplicity,
              we&apos;ll just use two symbols: ■ and □ &#x28;the puzzle is the
              same&#x29;.
            </p>
            <p>
              You&apos;ll begin with a chain of just one ■. As you go along,
              you&apos;ll add and remove boxes from your chain. The goal of the
              puzzle is simple: to wind up with a single □. Of course, there are
              rules for how you&apos;re allowed to manipuate your chain:
            </p>
            <ul className={styles.rulesList}>
              <li>
                <div className={`${styles.strong} ${styles.rule1}`}>Rule I</div>{" "}
                If your chain ends with a ■, you can add a □ to the end of the
                chain.
              </li>
              <li>
                <div className={`${styles.strong} ${styles.rule2}`}>
                  Rule II
                </div>{" "}
                You can always add a copy of your chain to the end of the chain.
              </li>
              <li>
                <div className={`${styles.strong} ${styles.rule3}`}>
                  Rule III
                </div>{" "}
                If your chain contains three ■ in a row, you can replace them
                with one □.
              </li>
              <li>
                <div className={`${styles.strong} ${styles.rule4}`}>
                  Rule IV
                </div>{" "}
                If your chain contains two □ in a row, you can delete them.
              </li>
            </ul>
            <p>
              Once you scroll down, you can click on each rule &#x28;or use the
              indicated keyboard shortcuts&#x29; to begin manipulating the
              chain. To go back one step, hit{" "}
              <span className={styles.code}>Delete</span>. To start over, hit{" "}
              <span className={styles.code}>Space</span>. When you&apos;ve
              solved the puzzle &#x28;or given up&#x29;, scroll down again to
              read the conclusion.
            </p>
            <p>Have fun!</p>
          </div>
        </div>
      </div>
      <div className={styles.pageContainer}>
        <div className={styles.lettersContainer}>
          {string.map((letter, index) => (
            <div
              key={index}
              className={styles.letter}
              style={{
                width: cellWidth,
                backgroundColor:
                  letter === LETTER_I
                    ? "var(--foreground)"
                    : "var(--background)",
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
    </div>
  );
}
