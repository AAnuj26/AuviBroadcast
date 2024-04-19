import Styles from "./sidebar.module.scss";
import menu from "../../assets/menu.svg";
import logo from "../../assets/auvilogo.svg";
import user from "../../assets/user.svg";
import home from "../../assets/house.svg";
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
        <div>
          <main className={Styles.SideBarMain}>
            <div>
              <button>
                <div>
                  <img src={home} alt="user" />
                </div>
                <div>
                  <span>Home</span>
                </div>
              </button>
            </div>
            <div>
              <button>
                <div>
                  <img src={user} alt="user" />
                </div>
                <div>
                  <span>Hello</span>
                </div>
              </button>
            </div>{" "}
            <div>
              <button>
                <div>
                  <img src={user} alt="user" />
                </div>
                <div>
                  <span>Hello</span>
                </div>
              </button>
            </div>{" "}
            <div>
              <button>
                <div>
                  <img src={user} alt="user" />
                </div>
                <div>
                  <span>Hello</span>
                </div>
              </button>
            </div>{" "}
            <div>
              <button>
                <div>
                  <img src={user} alt="user" />
                </div>
                <div>
                  <span>Hello</span>
                </div>
              </button>
            </div>{" "}
            <div>
              <button>
                <div>
                  <img src={user} alt="user" />
                </div>
                <div>
                  <span>Hello</span>
                </div>
              </button>
            </div>{" "}
            <div>
              <button>
                <div>
                  <img src={user} alt="user" />
                </div>
                <div>
                  <span>Hello</span>
                </div>
              </button>
            </div>{" "}
            <div>
              <button>
                <div>
                  <img src={user} alt="user" />
                </div>
                <div>
                  <span>Hello</span>
                </div>
              </button>
            </div>{" "}
            <div>
              <button>
                <div>
                  <img src={user} alt="user" />
                </div>
                <div>
                  <span>Hello</span>
                </div>
              </button>
            </div>{" "}
            <div>
              <button>
                <div>
                  <img src={user} alt="user" />
                </div>
                <div>
                  <span>Hello</span>
                </div>
              </button>
            </div>{" "}
            <div>
              <button>
                <div>
                  <img src={user} alt="user" />
                </div>
                <div>
                  <span>Hello</span>
                </div>
              </button>
            </div>
            <div>
              <button>
                <div>
                  <img src={user} alt="user" />
                </div>
                <div>
                  <span>Hello</span>
                </div>
              </button>
            </div>
            <div>
              <button>
                <div>
                  <img src={user} alt="user" />
                </div>
                <div>
                  <span>Hello</span>
                </div>
              </button>
            </div>
            <div>
              <button>
                <div>
                  <img src={user} alt="user" />
                </div>
                <div>
                  <span>Hello</span>
                </div>
              </button>
            </div>
            <div>
              <button>
                <div>
                  <img src={user} alt="user" />
                </div>
                <div>
                  <span>Hello</span>
                </div>
              </button>
            </div>
            <div>
              <button>
                <div>
                  <img src={user} alt="user" />
                </div>
                <div>
                  <span>Hello</span>
                </div>
              </button>
            </div>
            <div>
              <button>
                <div>
                  <img src={user} alt="user" />
                </div>
                <div>
                  <span>Hello</span>
                </div>
              </button>
            </div>
            <div>
              <button>
                <div>
                  <img src={user} alt="user" />
                </div>
                <div>
                  <span>Hello</span>
                </div>
              </button>
            </div>
          </main>
          <footer className={Styles.SideBarFooter}>
            <div>
              <a href="#">About</a>
              <a href="#">About</a>
              <a href="#">About</a>
              <a href="#">About</a>
              <a href="#">About</a>
              <a href="#">About</a>
              <a href="#">About</a>
              <a href="#">About</a>
              <a href="#">About</a>
            </div>
            <div>
              <a href="#">Privacy</a>
              <a href="#">Privacy</a>
              <a href="#">Privacy</a>
              <a href="#">Privacy</a>
              <a href="#">Privacy</a>
              <a href="#">Privacy</a>
              <a href="#">Privacy</a>
              <a href="#">Privacy</a>
              <a href="#">Privacy</a>
              <a href="#">Privacy</a>
              <a href="#">Privacy</a>
            </div>

            <p>C 2024 Google LLC</p>
          </footer>
        </div>
      </aside>
    </>
  );
};

export default Main;
