import {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import styles from "./styles.module.css";
import axios from "axios";

import DmnJS from "dmn-js/lib/Modeler";
import Viewer from "dmn-js/lib/Viewer";
import camundaModdleDescriptor from "camunda-dmn-moddle/resources/camunda";
import { DmnPropertiesPanelModule } from "dmn-js-properties-panel";
import { DmnPropertiesProviderModule } from "dmn-js-properties-panel";
import { CamundaPropertiesProviderModule } from "dmn-js-properties-panel";
import "dmn-js-properties-panel/dist/assets/dmn-js-properties-panel.css";
import "dmn-js-properties-panel/dist/assets/properties-panel.css";
import "dmn-js/dist/assets/diagram-js.css";
import "dmn-js/dist/assets/dmn-font/css/dmn-embedded.css";
import "dmn-js/dist/assets/dmn-js-decision-table-controls.css";
import "dmn-js/dist/assets/dmn-js-decision-table.css";
import "dmn-js/dist/assets/dmn-js-drd.css";
import "dmn-js/dist/assets/dmn-js-literal-expression.css";
import "dmn-js/dist/assets/dmn-js-shared.css";

export const defaultDmn = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/" xmlns:dc="http://www.omg.org/spec/DMN/20180521/DC/" id="Definitions_1lmea3i" name="DRD" namespace="http://camunda.org/schema/1.0/dmn">
  <decision id="Decision_0mqgtic" name="Decision 1">
    <decisionTable id="DecisionTable_11azyal">
      <input id="Input_1">
        <inputExpression id="InputExpression_1" typeRef="string">
          <text></text>
        </inputExpression>
      </input>
      <output id="Output_1" typeRef="string" />
    </decisionTable>
  </decision>
  <dmndi:DMNDI>
    <dmndi:DMNDiagram>
      <dmndi:DMNShape dmnElementRef="Decision_0mqgtic">
        <dc:Bounds height="80" width="180" x="160" y="100" />
      </dmndi:DMNShape>
    </dmndi:DMNDiagram>
  </dmndi:DMNDI>
</definitions>`;

const Dmnjs = (props, ref) => {
  // Destructuring the props object and setting default values
  const {
    xml,
    downloadButton = true,
    importButton = true,
    readOnly = false,
  } = props;
  const [xmlDownload, setXmlDownload] = useState();

  // State variables
  const dmnRef = useRef(null);

  useEffect(() => {
    if (dmnRef.current == null) {
      if (readOnly === true) {
        // Create a new Viewer instance for read-only mode
        dmnRef.current = new Viewer({
          container: "#container-dmn",
          decisionTable: {
            keyboard: {
              bindTo: document,
            },
          },
        });
      } else {
        // Create a new DmnJS instance for editing mode
        dmnRef.current = new DmnJS({
          container: "#container-dmn",
          decisionTable: {
            keyboard: {
              bindTo: document,
            },
          },
          moddleExtensions: {
            camunda: camundaModdleDescriptor,
          },
          drd: {
            additionalModules: [
              DmnPropertiesPanelModule,
              DmnPropertiesProviderModule,
              CamundaPropertiesProviderModule,
            ],
          },
        });

        // Attach properties panel based on the active view (decision table or DRD)
        dmnRef?.current?.on("views.changed", ({ activeView }) => {
          const propertiesPanel = dmnRef.current
            .getActiveViewer()
            .get("propertiesPanel", false);

          if (propertiesPanel) {
            propertiesPanel.detach();

            if (activeView.type === "drd") {
              propertiesPanel.attachTo("#properties-panel-container-dmn");
            }
          }
        });
      }
    }

    // Import the provided XML or default DMN diagram
    openDmnDiagram(xml ? xml : defaultDmn);
  }, [xml, readOnly]);

  // Function to open the given DMN diagram
  const openDmnDiagram = async (xml) => {
    dmnRef?.current?.importXML(xml, (err) => {
      if (err) {
        return console.log(err);
      }
    });
  };

  /**
   * Saves the diagram as an XML string and converts it to a blob
   *
   * @param {Object}} event
   * @returns
   */
  const saveModelHandler = async (event) => {
    try {
      const result = await dmnRef?.saveXML();
      let blob = new Blob([result.xml], { type: "text/xml" });
      return blob;
    } catch (err) {
      console.log(err);
    }
  };

  // Expose saveModelHandler through the ref for external access
  useImperativeHandle(ref, () => ({
    saveModelHandler,
  }));

  /**
   * Converts a blob to a document and performs a callback with the document data
   *
   * @param {Object} blob
   * @param {requestCallback} callback
   */
  function blobToDocument(blob, callback) {
    const url = URL.createObjectURL(blob);
    axios
      .get(url, {
        responseType: "xml",
      })
      .then((response) => {
        callback(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  // Event handler for the import button
  const importDmn = (e) => {
    e.preventDefault();
    // Convert the selected file to a document and call openDmnDiagram with the document data
    blobToDocument(e.target.files[0], (e) => {
      openDmnDiagram(e);
    });
  };

  // Event handler for the download button
  const downloadDmn = async (e) => {
    // Save the XML of the diagram with formatting
    const result = await dmnRef?.current?.saveXML({ format: true });
    // Set the XML download data
    setXmlDownload(result.xml);
  };

  return (
    <>
      <div className={styles.buttonsContainer}>
        {importButton && (
          <div>
            <input
              id="import"
              type="file"
              onChange={importDmn}
              style={{ display: "none" }}
            />
            <label htmlFor="import">
              <span className={styles.Button}>Import</span>
            </label>
          </div>
        )}
        {downloadButton && (
          <div>
            <button
              onClick={downloadDmn}
              variant="contained"
              component="label"
              className={styles.Button}
            >
              <a
                className={styles.downloadButton}
                href={`data:text/xml;charset=utf-8,${encodeURIComponent(
                  xmlDownload
                )}`}
                download="download.bpmn"
                type="application/bpmn"
              >
                Download
              </a>
            </button>
          </div>
        )}
      </div>
      <div className={styles.diagramContainer}>
        {!readOnly && (
          <div
            id="properties-panel-container-dmn"
            className={styles.propview}
          ></div>
        )}
        <div id="container-dmn" className={styles.container}></div>
      </div>
    </>
  );
};

export default forwardRef(Dmnjs);
