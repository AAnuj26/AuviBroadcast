import Styles from "./signInButton.module.scss";
import userSvg from "../../../assets/user.svg";
const SignInButton = () => {
  return (
    <button type="button" className={Styles.SignInButton}>
      <img src={userSvg} alt="userSvg" />
      <span>Sign in</span>
    </button>
  );
};

export default SignInButton;
