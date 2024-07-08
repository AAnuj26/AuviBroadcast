import React from "react";

import SearchBar from "../Shared/SearchBar/SearchBar";
import Styles from "./navbar.module.scss";
import SignInButton from "../Shared/SignInButton/SignInButton";
import menu from "../../assets/menu.svg";
import logo from "../../assets/auvilogo.svg";
import menu2 from "../../assets/menu2.svg";
import microphone from "../../assets/microphone.svg";
import searchIcon from "../../assets/search.svg";
import videoCam from "../../assets/videocam.svg";
import bell from "../../assets/bell.svg";
import "../../index.scss";

// import { useState } from "react";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(true);

  const avatarStyle2 = {
    display: "inline-block",
    height: "2.25rem",
    width: "2.25rem",
    borderRadius: "999px",
  };

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
          {!isLoggedIn ? (
            <>
              <div>
                <button>
                  <img src={menu2} alt="menu2" />
                </button>
              </div>
              <SignInButton setIsLoggedIn={setIsLoggedIn} />
            </>
          ) : (
            <>
              <div>
                <button>
                  <img src={videoCam} alt="menu3" />
                </button>
                <button>
                  <img src={bell} alt="menu3" />
                </button>
              </div>
              <div className={Styles.avatar}>
                <button
                  onClick={() => {
                    setIsLoggedIn(false);
                  }}
                >
                  <img
                    // className={Styles.avatarImg}
                    style={avatarStyle2}
                    src="https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                    alt="avatar"
                  />
                </button>
              </div>
              {/* <SignInButton /> */}
            </>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
