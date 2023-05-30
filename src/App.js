import React, { useRef } from "react";
import BpmnIo from "./BpmnIo";
import Dmnjs from "./Dmnjs";
import "./styles.css";
const App = () => {
  const bpmnRef = useRef();
  const dmnRef = useRef();

  // you can get the file in parent component to send it to the back-end
  const GetFileFromParent = () => {
    bpmnRef.current //or  dmnRef.current
      .saveModelHandler()
      .then((file) => {
        console.log(file);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="tabset">
      <input
        type="radio"
        name="tabset"
        id="tab1"
        aria-controls="Bpmn"
        checked
      />
      <label htmlFor="tab1">Bpmn</label>
      <input type="radio" name="tabset" id="tab2" aria-controls="Dmn" />
      <label htmlFor="tab2">Dmn</label>

      <div className="tab-panels">
        <section id="Bpmn" className="tab-panel">
          <BpmnIo ref={bpmnRef} />
        </section>
        <section id="Dmn" className="tab-panel">
          <Dmnjs ref={dmnRef} />
        </section>
      </div>
    </div>
  );
};

export default App;
