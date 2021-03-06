const NewPromise = require('./interview')
NewPromise.defer = NewPromise.deferred = function () {
  let dfd = {}
  dfd.promise = new NewPromise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
}

module.exports = NewPromise
