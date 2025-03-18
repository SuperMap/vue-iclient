<script setup lang="ts">
import Row from '../Row'
import Col from '../Col'
</script>
<template>
  <div class="row-demo">
    <Row>
      <Col :span="24">col</Col>
    </Row>
    <Row>
      <Col :span="12">col-12</Col>
      <Col :span="12">col-12</Col>
    </Row>
    <Row>
      <Col :span="8">col-8</Col>
      <Col :span="8">col-8</Col>
      <Col :span="8">col-8</Col>
    </Row>
    <Row>
      <Col :span="6">col-6</Col>
      <Col :span="6">col-6</Col>
      <Col :span="6">col-6</Col>
      <Col :span="6">col-6</Col>
    </Row>
    <Row :gutter="16">
      <Col class="gutter-row" :span="6">
        <div class="gutter-box">col-6</div>
      </Col>
      <Col class="gutter-row" :span="6">
        <div class="gutter-box">col-6</div>
      </Col>
      <Col class="gutter-row" :span="6">
        <div class="gutter-box">col-6</div>
      </Col>
      <Col class="gutter-row" :span="6">
        <div class="gutter-box">col-6</div>
      </Col>
    </Row>
  </div>
</template>
<style lang="scss">
.row-demo .sm-component-row > div:not(.gutter-row) {
  padding: 16px 0;
}
.row-demo .sm-component-row > div:not(.gutter-row):nth-child(2n + 1) {
  background-color: var(--color-primary-hover);
}
.row-demo .sm-component-row > div {
  &:not(.gutter-row) {
    margin-top: 8px;
    margin-bottom: 8px;
    background-color: var(--color-primary);
  }
  color: #fff;
  text-align: center;
  min-height: 30px;

  .gutter-box {
    line-height: 30px;
    background-color: var(--color-primary);
  }
}
</style>
