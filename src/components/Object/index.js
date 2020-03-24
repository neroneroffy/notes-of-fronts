var createPerson = function(name, age) {

  // 声明一个中间对象，该对象就是工厂模式的模子
  var o = new Object();

  // 依次添加我们需要的属性与方法
  o.name = name;
  o.age = age;
  o.getName = function() {
    return this.name;
  }

  return o;
}

// 创建两个实例
var perTom = createPerson('TOM', 20);
var PerJake = createPerson('Jake', 22);

console.log(typeof PerJake)
