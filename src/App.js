import logo from "./logo.svg";
import "./App.css";
import ChatBox from "./view/ChatBox";
import axios from "axios";

function App() {
  axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";
  return (
    <div className="App">
      <ChatBox></ChatBox>
    </div>
  );
}

export default App;
