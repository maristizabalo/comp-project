import { ConfigProvider } from "antd";
import "./App.css";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { BrowserRouter, Route } from "react-router-dom";
import RoutesWithNotFound from "./pages/RoutesWithNotFound";
import Login from "./pages/Login";
import Private from "./pages/private/Private";
import { AuthGuard } from './guards/AuthGuard';
import { PublicGuard } from './guards/PublicGuard';


function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#E80B2C",
          colorInfo: "#E80B2C",
          colorLink: "#E80B2C",
          colorInfoText: "#E80B2C",
          colorPrimaryText: "#E80B2C"
          // #E80B2C, Color primario
          // #C95D63, Color secundario
          // #AE8799, Color terciario
          // #717EC3, Color cuaternario
          // #496DDB, Color quinquenario
        },
      }}
    >
      <Provider store={store}>
        <BrowserRouter>
          <RoutesWithNotFound>
            <Route element={<PublicGuard />}>
              <Route index element={<Login />} />
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
