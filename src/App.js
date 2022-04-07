// import logo from "./logo.svg";
import "./App.css";
import Annotation from "./pdf/index";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import UploadPdf from "./pdf/UploadPdf";
import BasicTabs from "./pdf/eSingnature";

function App() {
  return (
    <>
      <Router>
        <Switch>
          <Route path="/tab" component={BasicTabs} />
          <Route path="/" component={UploadPdf} />
          <Route path="/pdf-annotation" component={Annotation} />

        </Switch>
      </Router>
    </>
  );
}

export default App;
