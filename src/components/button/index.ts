import Button from './Button.vue';

Button.install = function (app) {
  app.component(Button.name, Button);
  // todo Button.Group
};

export default Button;
