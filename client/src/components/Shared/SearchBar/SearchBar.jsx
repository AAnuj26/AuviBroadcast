import Styles from "./searchBar.module.scss";
import searchIcon from "../../../assets/search.svg";
const SearchBar = () => {
  return (
    <>
      <div className={Styles.SearchBar}>
        <div>
          <img
            className={Styles.SearchIconInsideInput}
            src={searchIcon}
            alt="searchIcon"
          />
          <input placeholder="Search" />
        </div>

        <button>
          <img src={searchIcon} alt="searchIcon" />
        </button>
      </div>
    </>
  );
};

export default SearchBar;
