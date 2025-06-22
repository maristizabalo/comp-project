import { Button, ConfigProvider } from "antd";
import "./App.css";
import { Provider } from "react-redux";
import { store } from "./store/store";

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#E80B2C",
        },
      }}
    >
      <Provider store={store}>
        <Button type="primary">
          Primary Button
          </Button>
      </Provider>
    </ConfigProvider>
  );
}

export default App;
