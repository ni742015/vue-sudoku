import Vue from 'vue'
import App from './App.vue'
import FastClick from 'fastclick'

//解决手机ios点击问题
// FastClick.attach(document.body);

var app = new Vue({
  el: '#app',
  render: h => h(App)
})
