"use client";

import { useState } from "react";
import styles from "./App.module.css";
import { canApplyRule1, getAllSpanRules } from "../util/miu";
import Action from "./Action";

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

  const cellWidth = `min(calc(100% / ${string.length}), 5%)`;
  const fontSize = `min(calc(90vw / ${string.length}), 10vw)`;

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
            <Action rules={spanRules} index={index} />
          </div>
        ))}
      </div>
    </div>
  );
}
