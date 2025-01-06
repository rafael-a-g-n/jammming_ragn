import React, { useState } from "react";
import styles from "./SearchBar.module.css";

function SearchBar(props) {
  const [searchTerm, setSearchTerm] = useState("");

  function passTerm() {
    props.onSearch(searchTerm);
  }

  function handleTermChange(event) {
    setSearchTerm(event.target.value);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      passTerm();
    }
  }

  return (
    <div className={styles.SearchBar}>
      <input
        placeholder="Enter A Song, Album, or Artist"
        onChange={handleTermChange}
        onKeyDown={handleKeyDown}
      />
      <button className={styles.SearchButton} onClick={passTerm}>
        SEARCH
      </button>
    </div>
  );
}

export default SearchBar;
