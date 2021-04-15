const card = ({ title, img }) =>
  /*html*/ `
  <style>
    .card {
      display: flex;
      position: relative;
    }
    .card h4 {
      position: absolute;

    }
  </style>
  <div class="card">
    <img src="${img}" alt="${title}"/>
    <h4>${title}</h4>
  </div>
`.trim();

export default card;
