import { Button, Form, Input, Typography } from "antd";
import { motion } from "framer-motion";
import ImgDec from "../assets/img/dec_1.svg"; 


const { Title } = Typography;

const Login = () => {
  return (
    <div className="login-container relative">
      {/* IZQUIERDA - Fondo institucional curvo */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="login-left"
      > <div className="login-left-content">
          <Title level={2} className="text-white">
            COMPLEMENTARIO
          </Title>
          <p className="hidden lg:block text-white">
            Sistema de gestión para formularios complementarios. Acceso
            exclusivo para personal autorizado.
          </p>
        </div>>
      </motion.div>

      {/* Imagen flotando entre ambas partes */}
      <img
        src={ImgDec}
        alt="Decoración SVG"
        className="absolute z-50 left-[35%] -translate-x-1/2 top-1/2 -translate-y-1/2 w-48 max-w-[350px] md:w-96"
      />

      {/* DERECHA - Formulario de Login */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="login-right"
      >
        <Form
          name="login"
          layout="vertical"
          className="login-form"
          onFinish={(values) => {
            console.log("Login values:", values);
          }}
        >
          <Title level={3} style={{ color: "#E80B2C", textAlign: "center" }}>
            Iniciar Sesión
          </Title>

          <Form.Item
            label="Usuario"
            name="text"
            rules={[{ required: true, message: "Por favor ingresa tu usuario" }]}
          >
            <Input placeholder="Usuario" />
          </Form.Item>

          <Form.Item
            label="Contraseña"
            name="password"
            rules={[
              { required: true, message: "Por favor ingresa tu contraseña" },
            ]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Entrar
            </Button>
          </Form.Item>
        </Form>
      </motion.div>
    </div>
  );
};

export default Login;
