import Styles from "./signInButton.module.scss";
import userSvg from "../../../assets/user.svg";
const SignInButton = ({ setIsLoggedIn }) => {
  return (
    <button
      type="button"
      className={Styles.SignInButton}
      onClick={setIsLoggedIn(true)}
    >
      <img src={userSvg} alt="userSvg" />
      <span>Sign in</span>
    </button>
  );
};

export default SignInButton;
