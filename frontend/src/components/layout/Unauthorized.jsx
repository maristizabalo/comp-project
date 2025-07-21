// src/components/Unauthorized.jsx
import { LockOutlined } from "@ant-design/icons";
import { Typography } from "antd";

const { Title, Paragraph } = Typography;

export default function Unauthorized() {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <LockOutlined style={{ fontSize: "64px", color: "red" }} />
      <Title level={3} style={{ color: "red", marginTop: "1rem" }}>
        Acceso Denegado
      </Title>
      <Paragraph type="secondary">
        No tienes permisos para ver esta sección.
      </Paragraph>
    </div>
  );
}
