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
      setHistory([]);
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
      <div className={styles.solutionContainer}>
        <div className={styles.textContent}>
          <h1>The solution</h1>
          <div className={styles.textBody}>
            <p>
              As you may have began to suspect, it is <em>impossible</em> to
              produce □. But <em>why</em>? To answer that question, we need to
              reason about the rules of the puzzle themselves.
            </p>
            <p>
              Let&apos;s see if we can find some property that <em>all</em>{" "}
              chains must share. Consider the <em>number</em> of ■ in the chain.
              Let&apos;s call this the ■-count. Which rules <em>change</em> a
              chain&apos;s ■-count? If you take a look, you&apos;ll notice that
              only <b>Rule II</b> and <b>Rule III</b> do. Specifically,{" "}
              <b>Rule II</b> doubles the ■-count, while <b>Rule III</b> reduces
              it by three.
            </p>
            <p>
              Here is the key insight: Note that if a ■-count isn&apos;t
              divisible by 3, then doubling it won&apos;t result in a ■-count
              that&apos;s divisible by 3 &#x28;if that&apos;s not clear,
              consider prime factors&#x29;. Also, decreasing the ■-count by 3
              won&apos;t make it divisible by 3 unless it was already divisible
              by 3 in the first place. So, since we start with a ■-count of 1,
              which isn&apos;t divisible by 3, then there is <em>no</em>{" "}
              combination of rules that would result in a ■-count that is
              divisible by 3.
            </p>
            <p>
              And there&apos;s our answer! Since our goal of □ has a ■-count of
              0, which <em>is</em> divisible by 3, it cannot be produced by any
              combination of rules.
            </p>
            <p>
              This puzzle illustrates a powerful fact: that some low-level
              phenomena can <em>only</em> be explained at a high level. In this
              puzzle, the lowest level would be mindlessly manipulating chains,
              waiting to see whether □ appears or not. While that low level is
              powerful enough to illustrate e.g. why □■ <em>is</em> producable,
              it is <em>not</em> powerful enough to explain why □ is{" "}
              <em>not</em>. For that, we needed to step "outside" that system to
              a more powerful one of mathematics and logic, reasoning{" "}
              <em>about</em> the lower-level rules.
            </p>
            <p>
              Are there phenomena that can&apos;t be explained by the system of
              mathematics and logic? Insights that require an even higher-level
              system? Now there&apos;s some food for thought...
            </p>
            <p className={styles.byline}>
              This web page was created by{" "}
              <a
                href="https://marcos.ac"
                target="_blank"
                rel="noopener noreferrer"
              >
                Marcos Acosta
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
