import { Button, Form, Input, Typography } from 'antd';
import { motion } from 'framer-motion';

const { Title } = Typography;

const Login = () => {
  return (
    <div className="login-container">
      {/* IZQUIERDA - Fondo institucional curvo */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="login-left"
      >
        <div className="login-left-content">
          <Title level={2} style={{ color: '#fff' }}>
            DEFENSORÍA DEL ESPACIO PÚBLICO
          </Title>
          <p>
            Sistema de gestión para formularios complementarios. Acceso exclusivo para personal autorizado.
          </p>
        </div>
      </motion.div>

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
            console.log('Login values:', values);
          }}
        >
          <Title level={3} style={{ color: '#E80B2C', textAlign: 'center' }}>
            Iniciar Sesión
          </Title>

          <Form.Item
            label="Correo electrónico"
            name="email"
            rules={[{ required: true, message: 'Por favor ingresa tu correo' }]}
          >
            <Input placeholder="usuario@entidad.gov.co" />
          </Form.Item>

          <Form.Item
            label="Contraseña"
            name="password"
            rules={[{ required: true, message: 'Por favor ingresa tu contraseña' }]}
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
