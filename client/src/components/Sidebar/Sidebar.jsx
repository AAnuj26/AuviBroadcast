import Styles from "./sidebar.module.scss";
import menu from "../../assets/menu.svg";
import logo from "../../assets/auvilogo.svg";
import divkeSVG from "../../assets/microphone.svg";
import ClockSVG from "../../assets/user.svg";
import "../../index.scss";

const Main = () => {
  return (
    <>
      <aside className={Styles.Sidebar}>
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
        <main>
          <div>
            <button>Home</button>
          </div>
          <div>
            <button></button>
          </div>
          <div>
            <button></button>
          </div>
          <div>
            <button></button>
          </div>
          <hr />
          <div>
            <button>You</button>
          </div>
          <div>
            <button></button>
          </div>
          <div>
            <button></button>
          </div>
          <div>
            <button></button>
          </div>
          <div>
            <button></button>
          </div>
          <div>
            <button></button>
          </div>
          <div>
            <button></button>
          </div>
          <div>
            <button></button>
          </div>
          <hr />
          <div>
            <button>Subscriptions</button>
          </div>
          <div>
            <button></button>
          </div>
          <div>
            <button></button>
          </div>
          <div>
            <button></button>
          </div>
          <div>
            <button></button>
          </div>
          <div>
            <button></button>
          </div>
          <div>
            <button></button>
          </div>
          <div>
            <button>Show 36 more</button>
          </div>
          <hr />
          <div>
            <button>Settings</button>
          </div>
          <div>
            <button>Report History</button>
          </div>
          <div>
            <button>Help</button>
          </div>
          <div>
            <button>Send Feedback</button>
          </div>
          <hr />
          <footer>
            <ul>
              <li>
                <a href="#">about</a>
                <a href="#">about</a>
                <a href="#">about</a>
                <a href="#">about</a>
                <a href="#">about</a>
                <a href="#">about</a>
                <a href="#">about</a>
                <a href="#">about</a>
                <a href="#">about</a>
                <a href="#">about</a>
                <a href="#">about</a>
                <p>
                  <a href="#">C 2024 google llc</a>
                </p>
              </li>
            </ul>
          </footer>
        </main>
      </aside>
    </>
  );
};

export default Main;
