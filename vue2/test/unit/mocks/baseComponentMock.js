function onCheckAllChange() {
  this.checkAll = !this.checkAll;
  this.checkedList = ['Apple', 'Pear', 'Orange']
}

function toggleDisable() {
  this.disabled = !this.disabled;
  this.disabled ? this.label = 'Checked-Disabled' : this.label = 'Checked-Enabled';
}

function onChange() {
  this.checkAll = false;
}

function handleOpenChange() {
  this.mode = 'time';
}

function onChangeRangePicker() {}

function onOk() {}

function inputNumberonChange() {
  this.value++;
}

module.exports = {
  onCheckAllChange,
  toggleDisable,
  onChange,
  handleOpenChange,
  onChangeRangePicker,
  onOk,
  inputNumberonChange
}