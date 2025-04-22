"use client";

import { useEffect, useRef, useState } from "react";
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
import cytoscape from "cytoscape";

const LAYOUT: cytoscape.LayoutOptions = {
  name: "breadthfirst",
  directed: true,
  nodeDimensionsIncludeLabels: true,
  roots: [LETTER_I],
  spacingFactor: 0.75,
};

const BASIC_EDGE_STYLE: cytoscape.Css.Edge = {
  width: 1,
  "line-color": "#ff00ff",
  "target-arrow-color": "#292929",
  "target-arrow-shape": "triangle",
  "curve-style": "bezier",
  label: "data(label)",
  "text-halign": "center",
  "text-valign": "center",
  color: "white",
  "font-family": "monospace",
  "text-background-shape": "rectangle",
  "text-background-padding": "2px",
  "text-background-opacity": 1,
};

export default function App() {
  const [string, setString] = useState([LETTER_I]);
  const [history, setHistory] = useState<TheoremString[]>([]);
  const [showActions, setShowActions] = useState(true);
  const [chains, setChains] = useState<Set<string>>(new Set([LETTER_I]));
  const graphElementRef = useRef<HTMLDivElement>(null);
  const cyObject = useRef<{ cy?: cytoscape.Core }>({ cy: undefined });

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
    const newState = newStateWithTransition.newState;
    const allStates = [...newStateWithTransition.intermediateStates, newState];
    const firstState = allStates[0];
    const restOfStates = allStates.slice(1);
    const appliedRule = newStateWithTransition.appliedRule;
    setString(firstState);
    setChains((prevChains) => {
      const newChains = new Set<string>(prevChains);
      newChains.add(newState.join(""));
      return newChains;
    });
    const currentChainString = string.join("");
    const nextChainString = newState.join("");
    const edgeId = `${currentChainString}-${nextChainString}`;
    // TODO: Check if this exists before adding too
    let newElements: cytoscape.ElementDefinition[] = [
      {
        group: "edges",
        data: {
          id: edgeId,
          source: currentChainString,
          target: nextChainString,
          label: `${appliedRule}`,
        },
      },
    ];
    // New chain, add to graph
    if (!chains.has(newState.join(""))) {
      newElements.push({ group: "nodes", data: { id: nextChainString } });
    }
    if (cyObject.current.cy) {
      cyObject.current.cy.add(newElements);
    }
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

  const zoomViewport = (cy: cytoscape.Core, factor: number) => {
    // Get the current viewport center position
    const pan = cy.pan();
    const zoom = cy.zoom();

    // Calculate the new zoom level
    const newZoom = zoom * factor;

    // Calculate the new pan position to keep the center point fixed
    const renderedCenter = {
      x: cy.width() / 2,
      y: cy.height() / 2,
    };

    // Convert screen position to model position at current zoom
    const modelCenter = {
      x: (renderedCenter.x - pan.x) / zoom,
      y: (renderedCenter.y - pan.y) / zoom,
    };

    // Calculate new pan position to maintain the same center
    const newPan = {
      x: renderedCenter.x - modelCenter.x * newZoom,
      y: renderedCenter.y - modelCenter.y * newZoom,
    };

    // Apply the new zoom and pan
    cy.viewport({
      zoom: newZoom,
      pan: newPan,
    });
  };

  const zoomIn = (cy?: cytoscape.Core, increment: number = 1.5) => {
    if (cy) {
      zoomViewport(cy, increment);
    }
  };

  const zoomOut = (cy?: cytoscape.Core, increment: number = 1.5) => {
    if (cy) {
      zoomViewport(cy, 1 / increment);
    }
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
    } else if (key === "-") {
      zoomOut(cyObject.current.cy);
    } else if (key == "+") {
      zoomIn(cyObject.current.cy);
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

  useEffect(() => {
    if (!cyObject.current.cy && graphElementRef.current) {
      cyObject.current.cy = cytoscape({
        container: graphElementRef.current,
        zoomingEnabled: true,
        userZoomingEnabled: false,
        elements: [{ group: "nodes", data: { id: LETTER_I } }],
        style: [
          // the stylesheet for the graph
          {
            selector: "node",
            style: {
              "background-opacity": 0,
              "text-background-color": "white",
              "text-background-shape": "rectangle",
              "text-background-opacity": 0,
              label: "data(id)",
              "text-halign": "center",
              "text-valign": "center",
            },
          },
          {
            selector: 'edge[label = "1"]',
            style: {
              ...BASIC_EDGE_STYLE,
              "line-color": "#cb769e",
              "target-arrow-color": "#cb769e",
              "text-background-color": "#cb769e",
            },
          },
          {
            selector: 'edge[label = "2"]',
            style: {
              ...BASIC_EDGE_STYLE,
              "line-color": "#6290c3",
              "target-arrow-color": "#6290c3",
              "text-background-color": "#6290c3",
            },
          },
          {
            selector: 'edge[label = "3"]',
            style: {
              ...BASIC_EDGE_STYLE,
              "line-color": "#adbca5",
              "target-arrow-color": "#adbca5",
              "text-background-color": "#adbca5",
            },
          },
          {
            selector: 'edge[label = "4"]',
            style: {
              ...BASIC_EDGE_STYLE,
              "line-color": "#e09891",
              "target-arrow-color": "#e09891",
              "text-background-color": "#e09891",
            },
          },
        ],
        layout: {
          name: "breadthfirst",
          directed: true,
          nodeDimensionsIncludeLabels: true,
          fit: true,
        },
      });
    }
  }, [graphElementRef.current]);

  useEffect(() => {
    if (cyObject.current.cy) {
      console.log(cyObject.current.cy.elements().jsons());
      cyObject.current.cy.layout(LAYOUT).run();
      cyObject.current.cy.style().update();
      cyObject.current.cy.fit();
    }
  }, [cyObject.current.cy?.elements().length]);

  return (
    <div className={styles.scrollContainer}>
      <div className={`${styles.introContainer} ${styles.textPageContainer}`}>
        <div className={styles.textContent}>
          <h1>Can you turn ■ into □?</h1>
          <div className={styles.textBody}>
            <p>
              A few months ago, I &#x28;finally&#x29; finished Douglas
              Hofstadter&apos;s legendary book,{" "}
              <a
                href="https://en.wikipedia.org/wiki/G%C3%B6del,_Escher,_Bach"
                target="_blank"
                rel="noopener noreferrer"
              >
                <em>Gödel, Escher, Bach</em>
              </a>
              . In one of the early chapters, Hofstadter introduces a
              deceptively simple puzzle called the{" "}
              <span className={styles.code}>MU</span>
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
                <div className={`${styles.strong} ${styles.rule1}`}>Rule 1</div>{" "}
                If your chain ends with a ■, you can add a □ to the end of the
                chain.
              </li>
              <li>
                <div className={`${styles.strong} ${styles.rule2}`}>Rule 2</div>{" "}
                You can always add a copy of your chain to the end of the chain.
              </li>
              <li>
                <div className={`${styles.strong} ${styles.rule3}`}>Rule 3</div>{" "}
                If your chain contains three ■ in a row, you can replace them
                with one □.
              </li>
              <li>
                <div className={`${styles.strong} ${styles.rule4}`}>Rule 4</div>{" "}
                If your chain contains two □ in a row, you can delete them.
              </li>
            </ul>
            <p>
              When you scroll down to the next screen, you&apos;ll be able to
              click on available rules &#x28;or use the indicated keyboard
              shortcuts&#x29; to manipulate the chain. To go back one step, hit{" "}
              <span className={styles.code}>Delete</span>. To start over, hit{" "}
              <span className={styles.code}>Space</span>.
            </p>
            <p>
              If you scroll down one more screen, you&apos;ll find a graphical
              representation of all the chains you&apos;ve discovered. Once
              you&apos;ve solved the puzzle &#x28;or given up&#x29;, scroll down
              to the last screen to read the conclusion.
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
      <div className={styles.graphContainer}>
        <div className={styles.graphCanvas} ref={graphElementRef} />
        <div className={styles.graphTitle}>Compendium</div>
        <div className={styles.zoomContainer}>
          <button
            className={styles.zoomButton}
            onClick={() => zoomOut(cyObject.current.cy)}
          >
            <svg
              width="50%"
              height="50%"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.25 7.5C2.25 7.22386 2.47386 7 2.75 7H12.25C12.5261 7 12.75 7.22386 12.75 7.5C12.75 7.77614 12.5261 8 12.25 8H2.75C2.47386 8 2.25 7.77614 2.25 7.5Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
          <button
            className={styles.zoomButton}
            onClick={() => zoomIn(cyObject.current.cy)}
          >
            <svg
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              width="50%"
              height="50%"
            >
              <path
                d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
      </div>
      <div
        className={`${styles.solutionContainer} ${styles.textPageContainer}`}
      >
        <div className={styles.textContent}>
          <h1>The solution</h1>
          <div className={styles.textBody}>
            <p>
              As you may have begun to suspect, it is <em>impossible</em> to
              produce □. But <em>why</em>? To answer that question, we need to
              reason about the rules of the puzzle themselves.
            </p>
            <p>
              Let&apos;s see if we can find some property that <em>all</em>{" "}
              chains must have. Consider the <em>number</em> of ■ in the chain.
              Let&apos;s call this the ■-count. Which rules <em>change</em> a
              chain&apos;s ■-count? If you take a look, you&apos;ll notice that
              only <b>Rule 2</b> and <b>Rule 3</b> do. Specifically,{" "}
              <b>Rule 2</b> doubles the ■-count, while <b>Rule 3</b> decreases
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
              puzzle, the lowest level would be mechanically manipulating the
              chain, trying every combination, waiting to see whether □ appears
              or not. While that low level is powerful enough to illustrate e.g.
              why □■ <em>is</em> producable, it is <em>not</em> powerful enough
              to explain e.g. why □ is <em>not</em>. For that, we needed to step
              "outside" that system to a more powerful one of mathematics and
              logic.
            </p>
            <p>
              Are there phenomena that can&apos;t be explained within the system
              of mathematics and logic? Insights that are only accessible in an
              even higher-level system? Now there&apos;s some food for
              thought...
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
