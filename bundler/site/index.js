import layout from "../layout";
import masonry from "../components/masonry";
import button from "../components/button";

const head = /*html*/ `
  <title>ChangePE - Inicio</title>
`;

const content = /*html*/ `
  <section>
    <h1>Hola mundo!</h1>
    ${button("Únete")}
  </section>
  <section>
    ${masonry({ content: [] })}
  </section>
`;
const html = layout({ content, head });

export default html;
