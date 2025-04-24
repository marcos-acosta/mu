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
import { getKeyIndex, MAX_LENGTH } from "../util/keyboard";
import EndAction from "./EndAction";
import cytoscape from "cytoscape";
import { combineClasses } from "../util/convenience";

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
  const graphElementRef = useRef<HTMLDivElement>(null);
  const conclusionRef = useRef<HTMLDivElement>(null);
  const exploreRef = useRef<HTMLDivElement>(null);
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

  const tooLongForRule1 = string.length >= MAX_LENGTH;
  const tooLongForRule2 = string.length > MAX_LENGTH / 2;

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
    if (cyObject.current.cy) {
      const currentChainString = string.join("");
      const nextChainString = newState.join("");
      const edgeId = `${currentChainString}-${nextChainString}`;
      // Add node if it doesn't already exist
      if (!cyObject.current.cy.getElementById(nextChainString).size()) {
        cyObject.current.cy.add({
          group: "nodes",
          data: { id: nextChainString },
        });
      }
      // Add edge if it doesn't already exist
      if (!cyObject.current.cy.getElementById(edgeId).size()) {
        cyObject.current.cy.add({
          group: "edges",
          data: {
            id: edgeId,
            source: currentChainString,
            target: nextChainString,
            label: `${appliedRule}`,
          },
        });
      }
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
    if (
      (rule.ruleNumber === 1 && tooLongForRule1) ||
      (rule.ruleNumber === 2 && tooLongForRule2)
    ) {
      return;
    }
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

  const reset = () => {
    setString([LETTER_I]);
    setHistory([]);
  };

  const undo = () => {
    setString(history[history.length - 1] || [LETTER_I]);
    setHistory(history.slice(0, -1));
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (!showActions || event.ctrlKey || event.metaKey) {
      return;
    }
    const key = event.key;
    if (key === " ") {
      event.preventDefault();
      reset();
    } else if (key === "Backspace") {
      event.preventDefault();
      undo();
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
      <div
        className={combineClasses(
          styles.introContainer,
          styles.textPageContainer
        )}
        id="intro"
      >
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
              You&apos;ll begin with a single ■ in your chain. As you go along,
              you&apos;ll add and remove boxes from your chain. The goal of the
              puzzle is simple: to wind up with a single □. Of course, there are
              rules for how you&apos;re allowed to manipulate the chain:
            </p>
            <ul className={styles.rulesList}>
              <li>
                <div className={combineClasses(styles.strong, styles.rule1)}>
                  Rule 1
                </div>{" "}
                If your chain ends with a ■, you can add a □ to the end of the
                chain.
              </li>
              <li>
                <div className={combineClasses(styles.strong, styles.rule2)}>
                  Rule 2
                </div>{" "}
                You can always add a copy of your chain to the end of the chain.
              </li>
              <li>
                <div className={combineClasses(styles.strong, styles.rule3)}>
                  Rule 3
                </div>{" "}
                If your chain contains three ■ in a row, you can replace them
                with one □.
              </li>
              <li>
                <div className={combineClasses(styles.strong, styles.rule4)}>
                  Rule 4
                </div>{" "}
                If your chain contains two □ in a row, you can delete them.
              </li>
            </ul>
            <p>
              When you scroll down to the next screen, you&apos;ll be able to
              click on available rules &#x28;or use the indicated keyboard
              shortcuts&#x29; to manipulate the chain. On the screen below that,
              you&apos;ll find a graphical representation of all the chains
              you&apos;ve discovered.
            </p>
            <p>
              Once you&apos;ve solved the puzzle &#x28;or given up&#x29;, scroll
              down to the last screen to read the conclusion.
            </p>
            <p>Have fun!</p>
          </div>
        </div>
      </div>
      <div className={styles.pageContainer} id="explore" ref={exploreRef}>
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
                      rule1Allowed={!tooLongForRule1}
                      rule2Allowed={!tooLongForRule2}
                    />
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        <div className={styles.backAndResetContainer}>
          <button onClick={undo} className={styles.controlButton}>
            <div className={styles.buttonText}>Undo</div>
            <div className={styles.symbolContainer}>Backspace</div>
          </button>
          <button onClick={reset} className={styles.controlButton}>
            <div className={styles.buttonText}>Start over</div>
            <div className={styles.symbolContainer}>Space</div>
          </button>
        </div>
      </div>
      <div className={styles.graphContainer} id="compendium">
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
        <div className={styles.nextPageButtonContainer}>
          <button
            className={styles.nextPageButton}
            onClick={() => {
              exploreRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.14645 2.14645C7.34171 1.95118 7.65829 1.95118 7.85355 2.14645L11.8536 6.14645C12.0488 6.34171 12.0488 6.65829 11.8536 6.85355C11.6583 7.04882 11.3417 7.04882 11.1464 6.85355L8 3.70711L8 12.5C8 12.7761 7.77614 13 7.5 13C7.22386 13 7 12.7761 7 12.5L7 3.70711L3.85355 6.85355C3.65829 7.04882 3.34171 7.04882 3.14645 6.85355C2.95118 6.65829 2.95118 6.34171 3.14645 6.14645L7.14645 2.14645Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
          <button
            className={styles.nextPageButton}
            onClick={() => {
              conclusionRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.5 2C7.77614 2 8 2.22386 8 2.5L8 11.2929L11.1464 8.14645C11.3417 7.95118 11.6583 7.95118 11.8536 8.14645C12.0488 8.34171 12.0488 8.65829 11.8536 8.85355L7.85355 12.8536C7.75979 12.9473 7.63261 13 7.5 13C7.36739 13 7.24021 12.9473 7.14645 12.8536L3.14645 8.85355C2.95118 8.65829 2.95118 8.34171 3.14645 8.14645C3.34171 7.95118 3.65829 7.95118 3.85355 8.14645L7 11.2929L7 2.5C7 2.22386 7.22386 2 7.5 2Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
      </div>
      <div
        className={combineClasses(
          styles.solutionContainer,
          styles.textPageContainer
        )}
        id="conclusion"
        ref={conclusionRef}
      >
        <div className={styles.textContent}>
          <h1>The solution, and more that you didn&apos;t ask for</h1>
          <div className={styles.textBody}>
            <p>
              As you may have begun to suspect, it is <em>impossible</em> to
              produce □. But <em>why</em>?
            </p>
            <p>
              I&apos;ll indirectly answer your question with another question.
              What do these chains of boxes and the four rules{" "}
              <em>represent</em>? The most obvious answer is
              &quot;nothing&quot;. But we can choose another, surprisingly
              satisfying interpretation.
            </p>
            <p>
              Suppose a filled-in box &#x28;■&#x29; represents one
              &quot;tally&quot; and an empty box &#x28;□&#x29; is just a
              placeholder. Additionally, each chain as a whole can be taken to
              mean &quot;This number of tallies isn&apos;t divisible by
              three&quot;. So, with this interpretation, ■ represents the
              statement &quot;1 isn&apos;t divisible by three&quot;, and ■■□■■□
              is interpreted as &quot;4 isn&apos;t divisible by three&quot;. If
              you agreed that this system is sound &#x28;i.e. can only produce
              true statements when interpreted&#x29;, then you would immediately
              know the answer to the question, &quot;Can you make □?&quot; The
              answer is no, because it represents &quot;0 isn&apos;t divisible
              by three&quot;, which is false. We could also immediately discount
              the possibility of ■■■□ , ■■■□□■■■, and countless other chains.
            </p>
            <p>
              This is actually the case: if you take a look at the four rules,
              you&apos;ll notice that only Rule 2 and Rule 3 actually change the
              ■-count. And if you start with a ■-count that&apos;s not divisible
              by three, then doubling it &#x28;Rule 2&#x29; won&apos;t turn it
              into a number that is, and neither will subtracting three from it
              &#x28;Rule 3&#x29;. So there you have it: this system only
              generates chains with a non-divisible-by-three ■-count.
            </p>
            <p>
              Does the interpretation I gave above explain <em>why</em> □
              isn&apos;t producible? Is it fair to say that □ cannot be produced{" "}
              <em>because</em> our interpretation of the system forbids it? And
              if not, how else could we possibly explain the impossibility of □?
            </p>
            <p>
              One objection is that we&apos;re mixing up <em>explanation</em>{" "}
              with <em>causation</em>. In this case, it seems obvious that our
              interpretation of the boxes didn&apos;t <em>cause</em> □ to be
              un-producable, it&apos;s just <em>not</em>. The rules are the only
              &quot;real&quot; thing, and our interpretation is purely
              derivative. Fair enough; I agree. But in other cases, it feels
              very natural to explain low-level events as being a consequence of
              higher-level interpretations. For example, we explain the motions
              of objects as a consequence of the laws of physics
              &#x28;deduction&#x29;, even though our invention of the laws of
              physics was really a consequence of the motions of objects
              &#x28;induction&#x29;. When we notice our friend is getting left
              out of a friend group, we might attribute it to the enigmantic
              &quot;group dynamic&quot;. How can a &quot;group dynamic&quot;{" "}
              <em>cause</em> the thing it describes? And, of course, we have the
              most tangled hierarchy of all: me &#x28;and you&#x29;. I often
              attribute my actions to, well, myself. But my concept of
              &quot;I&quot; is really just a high-level interpretation of the
              low-level neural activity that <em>actually</em> causes me to do
              anything. In a very strict sense, my wants and desires can&apos;t
              cause me to do anything any more than my interpretation of some
              colored boxes can cause □ to be un-producible.
            </p>
            <p>
              I feel like I see this kind of &quot;downward causality&quot;
              &#x28;as Hofstadter calls it&#x29; everywhere, which is why it
              caught my interest. In a way, it&apos;s just an illusion;
              there&apos;s no actual paradox until we <em>interpret</em> things
              on a high level and use it to explain things on a lower level. But
              since we like to do that often, I find it worth paying attention
              to.
            </p>
            <br />
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
