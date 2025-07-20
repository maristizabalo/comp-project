import styles from "./Login.module.css";
import { Input, Button, Alert } from "antd";
import { UserOutlined, LockOutlined, RightOutlined } from "@ant-design/icons";
import logo_alcaldia from "../../assets/img/logo_alcaldia.svg";
import logo_bogota from "../../assets/img/logo_bogota.svg";
import logo_dadep from "../../assets/img/logo_dadep.svg";
import { useState } from "react";
import { useAuth } from "../../hooks/use-auth";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/layout/Loading";

const Login = () => {
  const [formValues, setFormValues] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const { login, isLoading } = useAuth(); // tu lógica de login personalizada
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({}); // Limpiamos errores previos

    const errors = {};
    if (!formValues.username.trim()) {
      errors.username = "El usuario es requerido";
    }
    if (!formValues.password.trim()) {
      errors.password = "La clave es requerida";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await login(formValues);
      navigate("/inicio");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Error al iniciar sesión, inténtalo de nuevo más tarde."
      );
    }
  };

  return (
    <div className={styles.container}>
      {isLoading && <Loading message="Iniciando sesión..."/>}
      <div className={styles.screen}>
        <div className={styles.screen__content}>
          <h2 className="text-black absolute top-10 left-1/2 -translate-x-1/2 text-2xl md:text-3xl lg:text-3xl font-extrabold whitespace-nowrap">
            COMPLEMENTARIOS
          </h2>
          <form className={styles.login} onSubmit={handleSubmit}>
            <div className={styles.login__field}>
              <UserOutlined className={styles.login__icon} />
              <Input
                type="text"
                name="username"
                value={formValues.username}
                onChange={handleInputChange}
                placeholder="Usuario"
                className={styles.login__input}
              />
              {fieldErrors.username && (
                <div className="text-red-500 text-sm mt-1 pl-6">
                  {fieldErrors.username}
                </div>
              )}
            </div>

            <div className={styles.login__field}>
              <LockOutlined className={styles.login__icon} />
              <Input.Password
                name="password"
                value={formValues.password}
                onChange={handleInputChange}
                placeholder="Clave"
                className={styles.login__input}
              />
              {fieldErrors.password && (
                <div className="text-red-500 text-sm mt-1 pl-6">
                  {fieldErrors.password}
                </div>
              )}
            </div>

            <Button htmlType="submit" className={styles.login__submit}>
              <span className={styles.button__text}>Iniciar Sesión</span>
              <RightOutlined className={styles.button__icon} />
            </Button>
            {error && (
              <div className="mt-4 w-full">
                <Alert
                  message="Error de autenticación"
                  description={error}
                  type="error"
                  showIcon
                />
              </div>
            )}
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
