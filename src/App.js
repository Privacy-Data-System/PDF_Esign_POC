// import logo from "./logo.svg";
import "./App.css";
import Annotation from "./pdf/index";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import UploadPdf from "./pdf/UploadPdf";

function App() {
  return (
    <>
      <Router>
        <Switch>
          <Route path="/pdf-annotation" component={Annotation} />
          <Route path="/" component={UploadPdf} />
        </Switch>
      </Router>
    </>
  );
}

export default App;
