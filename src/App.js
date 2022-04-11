// import logo from "./logo.svg";
import "./App.css";
import Annotation from "./pdf/index";
import RecipientUpload from "./pdf/recipientUpload";
import Recipient from "./pdf/recipient";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import UploadPdf from "./pdf/UploadPdf";
import BasicTabs from "./pdf/eSingnature";

function App() {
  return (
    <>
      <Router>
        <Switch>
          <Route path="/sender" component={Annotation} />
          <Route path="/reciver" component={Recipient} />
          <Route path="/reciverUpload" component={RecipientUpload} />
          <Route path="/" component={UploadPdf} />
        </Switch>
      </Router>
    </>
  );
}

export default App;
