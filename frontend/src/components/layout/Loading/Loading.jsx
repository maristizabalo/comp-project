import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import styles from "./Loading.module.css";

const Loading = ({ message = "Iniciando sesión..." }) => {
  return (
    <div className={styles.overlay}>
      <Spin
        indicator={
          <LoadingOutlined style={{ fontSize: 64, color: "#E80B2C" }} spin />
        }
      />
      <p className={styles.message}>{message}</p>
    </div>
  );
};

export default Loading;
