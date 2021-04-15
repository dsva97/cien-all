export const depends = () => {
  return ["@appnest/masonry-layout"];
};

const masonry = ({ content, attr }) =>
  /*html*/ `
<masonry-layout ${attr}>${content}</masonry-layout>
`.trim();

export default masonry;
