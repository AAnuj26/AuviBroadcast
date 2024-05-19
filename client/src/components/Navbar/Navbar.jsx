import SearchBar from "../Shared/SearchBar/SearchBar";
import Styles from "./navbar.module.scss";
import SignInButton from "../Shared/SignInButton/SignInButton";
import menu from "../../assets/menu.svg";
import logo from "../../assets/auvilogo.svg";
import menu2 from "../../assets/menu2.svg";
import microphone from "../../assets/microphone.svg";
import searchIcon from "../../assets/search.svg";
import "../../index.scss";
const Navbar = () => {
  return (
    <>
      <nav className={Styles.Navbar}>
        <header className={Styles.firstDiv}>
          <button>
            <img src={menu} alt="menu" />
          </button>
          <span>
            <img src={logo} alt="auvilogo" />
            <h1>
              Auvi <sup>IN</sup>
            </h1>
          </span>
        </header>

        <div className={Styles.searchElements}>
          <SearchBar />
          <div className={Styles.se1}>
            <button className={Styles.microphoneButton}>
              <img src={microphone} alt="microphone" />
            </button>
          </div>
        </div>

        <div className={Styles.lastDiv}>
          <div>
            <button>
              <img src={menu2} alt="menu2" />
            </button>
          </div>
          <SignInButton />
        </div>
      </nav>
    </>
  );
};

export default Navbar;
