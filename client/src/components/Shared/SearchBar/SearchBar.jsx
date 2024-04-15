import Styles from "./searchBar.module.scss";
import searchIcon from "../../../assets/search.svg";
const SearchBar = () => {
  return (
    <>
      <form className={Styles.SearchBar}>
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
      </form>
    </>
  );
};

export default SearchBar;
