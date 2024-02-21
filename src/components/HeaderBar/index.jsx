import Styles from "./styles.module.css";

export const HeaderBar = () => {
  return (
    <div className={Styles.header}>
      <h1>p5.js</h1>
      <ul>
        <li>
          <a href="/">Home</a>
        </li>
        <li>
          <a href="/about/">About</a>
        </li>
      </ul>
    </div>
  );
};
