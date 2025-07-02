import styles from "./Login.module.css";
import { Input, Button, Typography } from "antd";
import { UserOutlined, LockOutlined, RightOutlined } from "@ant-design/icons";
import logo_alcaldia from "../assets/img/logo_alcaldia.svg";
import logo_bogota from "../assets/img/logo_bogota.svg";
import logo_dadep from "../assets/img/logo_dadep.svg";

const { Title } = Typography;

const Login = () => {
  return (
    <div className={styles.container}>
      <div className={styles.screen}>
        <div className={styles.screen__content}>
          <form className={styles.login} onSubmit={(e) => e.preventDefault()}>
            <div className={styles.login__field}>
              <UserOutlined className={styles.login__icon} />
              <Input
                type="text"
                placeholder="Usuario"
                className={styles.login__input}
              />
            </div>
            <div className={styles.login__field}>
              <LockOutlined className={styles.login__icon} />
              <Input.Password
                placeholder="Clave"
                className={styles.login__input}
              />
            </div>

            <Button htmlType="submit" className={styles.login__submit}>
              <span className={styles.button__text}>Iniciar Sesión</span>
              <RightOutlined className={styles.button__icon} />
            </Button>
          </form>
          <div className={styles.containerLogos}>
            <div className={styles.logosAdmin}>
              <img
                src={logo_alcaldia}
                alt="Logo Alcaldía"
                className={styles.logo}
              />
              <img src={logo_dadep} alt="Logo DADEP" className={styles.logo} />
              <img
                src={logo_bogota}
                alt="Logo Bogotá"
                className={styles.logo}
              />
            </div>
          </div>
        </div>

        <div className={styles.screen__background}>
          <span
            className={`${styles.screen__background__shape} ${styles.shape2}`}
          />
          <span
            className={`${styles.screen__background__shape} ${styles.shape3}`}
          />
          <span
            className={`${styles.screen__background__shape} ${styles.shape4}`}
          />
          <span
            className={`${styles.screen__background__shape} ${styles.shape1}`}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
