# BpmnIo & DmnJs Components

This repository contains two seprate simple components that you can use in your react app
each component has properties panel and uses Camunda

## Getting Started

In the project directory, you can run:

### `npm install`

it installs dependencies

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.



## BpmnIo Component

The BpmnIo component allows users to view and edit BPMN (Business Process Model and Notation) diagrams. It provides the following features:

- Rendering BPMN diagrams from XML data.
- Importing BPMN diagrams from XML files.
- Downloading the BPMN diagram as an XML file.
- Enabling or disabling read-only mode.
- Displaying a properties panel for editing BPMN elements.

## Usage

Import the BpmnIo component:

`import BpmnIo from './BpmnIo';`

Use the component in your code:

`<BpmnIo xml={xmlData} readOnly={false} />`

## Props

The BpmnIo component accepts the following props:

- ```xml' (string, optional): The XML data representing the BPMN diagram to display. If not provided, an empty diagram will be shown.``

- `` downloadButton'  (boolean, optional): Whether to display the download button. Defaults to `true ``.

- `` importBpmn'  (boolean, optional): Whether to display the import button. Defaults to  `true ``.

- `` readOnly'  (boolean, optional): Whether to enable read-only mode. Defaults to  `true ``.

## Methods

The BpmnIo component exposes a method `saveModelHandler` that can be accessed through a ref:

```js
const bpmnRef = useRef();

// Access the saveModelHandler method
const saveBpmnModel = () => {
bpmnRef.current.saveModelHandler();
};

// Use the ref in the component
<BpmnIo ref={bpmnRef} />
```

# Dmnjs Component

The Dmnjs component allows users to view and edit DMN (Decision Model and Notation) diagrams. It provides similar functionality to the BpmnIo component but tailored for DMN diagrams.

# Usage

Import the Dmnjs component:

`import Dmnjs from './Dmnjs';`

Use the component in your code:

`<Dmnjs xml={xmlData} readOnly={false} />`

## Props

The Dmnjs component accepts the following props:

- ```xml' (string, optional): The XML data representing the Dmn diagram to display. If not provided, an empty diagram will be shown.``

- `` downloadButton'  (boolean, optional): Whether to display the download button. Defaults to `true ``.

- `` importDmn'  (boolean, optional): Whether to display the import button. Defaults to  `true ``.

- `` readOnly'  (boolean, optional): Whether to enable read-only mode. Defaults to  `true ``.

## Methods

The Dmnjs component exposes a method saveModelHandler that can be accessed through a ref:

```js
const dmnRef = useRef();

// Access the saveModelHandler method
const saveDmnModel = () => {
dmnRef.current.saveModelHandler();
};

// Use the ref in the component
<Dmnjs ref={dmnRef} />
```

## Blob to Document Conversion

Both the BpmnIo and Dmnjs components use a helper function `blobToDocument` for converting a Blob object to a document format. It is used to load XML files and open them in the respective diagram editors.

```js
function blobToDocument(blob, callback) {
const url = URL.createObjectURL(blob);
axios
    .get(url, {
          responseType: 'xml',
    })
    .then((response) => {
        callback(response.data);
    })
    .catch((error) => {
         console.error(error);
    });
}
 ```

## Importing and Exporting Diagrams

The BpmnIo and Dmnjs components provide functionality for importing and exporting diagrams. They include import buttons for loading XML files, as well as download buttons for saving the diagrams as XML files.
Importing Diagrams

To import a diagram, simply click on the import button and select an XML file from your local machine. The diagram will be loaded into the editor.
Exporting Diagrams

To export a diagram, click on the download button. The diagram will be downloaded as an XML file, allowing you to save it to your local machine.

## Styling

The BpmnIo and Dmnjs components can be customized using CSS styles. You can modify the appearance of the buttons, container, and properties panel to match your application's design.

## Camunda Integration

Both the BpmnIo and Dmnjs components support Camunda integration. Camunda is an open-source platform for workflow and decision automation. The components utilize the Camunda modeling extensions and properties providers to enhance the modeling capabilities and provide a seamless integration experience.

When initializing the components, the moddleExtensions option is used to include the Camunda moddle package:



## Example

Here's an example of how to use the BpmnIo and Dmnjs components in a React application:

```JS
import React from 'react';
import BpmnIo from './BpmnIo';
import Dmnjs from './Dmnjs';

function App() {
  const bpmnXmlData = '<?xml version="1.0" encoding="UTF-8"?><bpmn:definitions ...>';
  const dmnXmlData = '<?xml version="1.0" encoding="UTF-8"?><dmn:definitions ...>';

  return (
    <div>
      <h1>BPMN Diagram</h1>
      <BpmnIo xml={bpmnXmlData} readOnly={false} />

      <h1>DMN Diagram</h1>
      <Dmnjs xml={dmnXmlData} readOnly={true} />
    </div>
  );
}

export default App;
```