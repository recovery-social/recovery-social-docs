import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";
import Link from "@docusaurus/Link";

type FeatureItem = {
  title: string;
  emoji: string;
  description: JSX.Element;
  path: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: "LSP11 - Social Recovery",
    emoji: "🔒",
    description: (
      <>
        This standard describes a basic social recovery contract that can
        recover access to ERC725 contracts through the LSP6-KeyManager.
      </>
    ),
    path: "/docs/standards/lsp11socialrecovery",
  },
  {
    title: "LSP11 - Recovery Service",
    emoji: "🤝",
    description: (
      <>
        This standard describes a recovery service contract that can vote as an
        external service (Recovery Service Guardian) for a msg.sender at an
        LSP11SocialRecovery contract.
      </>
    ),
    path: "/docs/standards/lsp11recoveryservice",
  },
  {
    title: "How do Recovery Services Work?",
    emoji: "🔏",
    description: (
      <>This describes how a recovery service works and how to set it up.</>
    ),
    path: "/docs/recoveryservices",
  },
];

function Feature({ title, emoji, description, path }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <Link
        to={path}
      >
        <div
          className="card"
          // onClick={() => nextPath(path)}
        >
          <div className="text--center">
            {/* <Svg className={styles.featureSvg} role="img" /> */}
            <h1>{emoji}</h1>
          </div>
          <div className="text--center padding-horiz--md">
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
