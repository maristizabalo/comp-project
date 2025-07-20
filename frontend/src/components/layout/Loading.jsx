import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    backdropFilter: "blur(6px)",
  },
  message: {
    marginTop: "1.5rem",
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "#E80B2C",
    animation: "pulse 1.5s ease-in-out infinite",
    letterSpacing: "0.05em",
  },
  "@keyframes pulse": {
    "0%, 100%": { opacity: 0.8 },
    "50%": { opacity: 1 },
  },
};

const Loading = ({ message = "Cargando..." }) => {
  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 1; }
          }
        `}
      </style>

      <div style={styles.overlay}>
        <Spin
          indicator={
            <LoadingOutlined style={{ fontSize: 64, color: "#E80B2C" }} spin />
          }
        />
        <p style={styles.message}>{message}</p>
      </div>
    </>
  );
};

export default Loading;
