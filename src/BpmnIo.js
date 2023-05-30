import {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import axios from "axios";
import styles from "./styles.module.css";

import Modeler from "bpmn-js/lib/Modeler";
import Viewer from "bpmn-js/lib/NavigatedViewer";
import camundaModdlePackage from "camunda-bpmn-moddle/resources/camunda";
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule,
  ElementTemplatesPropertiesProviderModule,
} from "bpmn-js-properties-panel";
import "bpmn-js-properties-panel/dist/assets/properties-panel.css";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";

const emptyBpmn = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
	<bpmn2:collaboration id="Collaboration_0czsqyr">
		<bpmn2:participant id="Participant_0cyhvx8" processRef="Process_1" />
	</bpmn2:collaboration>
	<bpmn2:process id="Process_1" isExecutable="false">
		<bpmn2:startEvent id="StartEvent_1" />
	</bpmn2:process>
	<bpmndi:BPMNDiagram id="BPMNDiagram_1">
		<bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Collaboration_0czsqyr">
			<bpmndi:BPMNShape id="Participant_0cyhvx8_di" bpmnElement="Participant_0cyhvx8">
				<dc:Bounds x="130" y="220" width="600" height="250" />
			</bpmndi:BPMNShape>
			<bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
				<dc:Bounds x="412" y="240" width="36" height="36" />
			</bpmndi:BPMNShape>
		</bpmndi:BPMNPlane>
	</bpmndi:BPMNDiagram>
</bpmn2:definitions>`;

function BpmnIo(props, ref) {
  // Destructuring the props object and setting default values
  const {
    xml,
    downloadButton = true,
    importBpmn = true,
    readOnly = false,
  } = props;

  // State variables
  const [xmlDownload, setXmlDownload] = useState();
  const bpmnRef = useRef();

  useEffect(() => {
    // Check if bpmnRef is not null
    if (bpmnRef.current == null) {
      // Create a new Viewer instance for read-only mode
      if (readOnly) {
        bpmnRef.current = new Viewer({
          container: "#container-bpmn",
          moddleExtensions: {
            camunda: camundaModdlePackage,
          },
        });
      } else {
        // Create a new Modeler instance for editing mode
        bpmnRef.current = new Modeler({
          container: "#container-bpmn",
          additionalModules: [
            BpmnPropertiesPanelModule,
            BpmnPropertiesProviderModule,
            CamundaPlatformPropertiesProviderModule,
            ElementTemplatesPropertiesProviderModule,
          ],
          moddleExtensions: {
            camunda: camundaModdlePackage,
          },
          propertiesPanel: {
            parent: "#properties-panel-container-bpmn",
          },
        });
      }
      // Call the openBpmnDiagram function with the provided xml or emptyBpmn
      openBpmnDiagram(xml ? xml : emptyBpmn);
    }
  }, [xml, readOnly]);

  // Function to open the given xml
  const openBpmnDiagram = async (xml) => {
    bpmnRef?.current?.importXML(xml, (err) => {
      if (err) {
        return console.log(err);
      }
    });
  };

  /**
   * Saves the diagram as an XML string and converts it to a blob   *
   * @param {Object} event
   * @returns blob
   */
  const saveModelHandler = async (event) => {
    try {
      const result = await bpmnRef?.current?.saveXML();
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
   *Converts a blob to a document and performs a callback with the document data

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
  const importButton = (e) => {
    e.preventDefault();
    blobToDocument(e.target.files[0], (e) => {
      openBpmnDiagram(e);
    });
  };

  // Event handler for the download button
  const downloadBpm = async (e) => {
    const result = await bpmnRef?.current?.saveXML({ format: true });
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
              onChange={importBpmn}
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
              onClick={downloadBpm}
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
            id="properties-panel-container-bpmn"
            className={styles.propview}
          ></div>
        )}
        <div id="container-bpmn" className={styles.container}></div>
      </div>
    </>
  );
}

export default forwardRef(BpmnIo);
