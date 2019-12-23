
import {Counter} from "./counter";

const demoTitle = document.createElement("h1");
demoTitle.innerText = "Demo of Counting from 1 to 100";
document.body.appendChild(demoTitle);
let counter = new Counter();
document.body.appendChild(counter.container);
counter.orchestrate();

