import Styles from "./signInButton.module.scss";
import userSvg from "../../../assets/user.svg";
const SignInButton = ({ onClick }) => {
  return (
    <button type="button" className={Styles.SignInButton} onClick={onClick}>
      <img src={userSvg} alt="userSvg" />
      <span>Sign in</span>
    </button>
  );
};

export default SignInButton;
