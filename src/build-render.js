var Wysimdown = require('jsx!./wysimdown.jsx')
  , React = require('react/addons');

React.renderComponent(Wysimdown(), document.querySelector('#editor'));