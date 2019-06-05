// document.getElementById("app").innerHTML = `
// <h1>Hello Parcel!</h1>
// <div>
//   Look
//   <a href="https://parceljs.org" target="_blank" rel="noopener noreferrer">here</a>
//   for more info about Parcel.
// </div>
// `;

// import "./styles.css";
import PluginImunifyAvWidget from "./plugin";

customElements.define('plugin-imunifyav-widget', PluginImunifyAvWidget);


// // определение custom element
// let developCustomElemTag = `my-contact-card__${new Date().getTime()}`;
// try {
//   customElements.define(developCustomElemTag, PluginImunifyAvWidget);
// } catch (error) {
//   /////////////////////////////////////////////////////////////////////
//   // нужно только для режима разработки с HMR
//   if (process.env.NODE_ENV === "development") {
//     document.body.removeChild(document.querySelector(myContactCardTag));
//     myContactCardTag = `my-contact-card__${new Date().getTime()}`;
//     customElements.define(myContactCardTag, MyContactCard);
//     let el = new MyContactCard();
//     document.body.appendChild(el);
//   }
//   /////////////////////////////////////////////////////////////////////
// }