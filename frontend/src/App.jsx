import { ConfigProvider } from "antd";
import "./App.css";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { BrowserRouter, Route } from "react-router-dom";
import RoutesWithNotFound from "./pages/RoutesWithNotFound";
import Home from "./pages/Home";
import Private from "./pages/private/Private";
import { AuthGuard } from './guards/AuthGuard';
import { PublicGuard } from './guards/PublicGuard';


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
        <BrowserRouter>
          <RoutesWithNotFound>
            <Route element={<PublicGuard />}>
              <Route index element={<Home />} />
            </Route>
            <Route element={<AuthGuard />}>
              <Route path={"/*"} element={<Private />} />
            </Route>
          </RoutesWithNotFound>
        </BrowserRouter>
      </Provider>
    </ConfigProvider>
  );
}

export default App;
