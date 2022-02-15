class Promise2 {
  constructor (executor) {
    // 传给promise的方法
    this.executor = executor
    // promise的状态
    this.status = 'pending'
    // promise的值
    this.value = undefined
    // promise结束状态后再执行的方法(传给then的方法,可能多个then链式)
    this.callbacks = []
    // 用户调用的resolve
    const resolve = (data) => {
      // promise的状态只能变化一次
      if (this.status !== 'pending') return
      // 用户调用了就更变状态
      this.status = 'resolved'
      // 设置promise的值
      this.value = data
      // 状态改变了就开始执行传给then的方法
      if (this.callbacks.length > 0) {
        this.callbacks.forEach(item => {
          item.onResolve()
        })
      }
    }
    // 用户调用的reject
    const reject = (data) => {
      if (this.status !== 'pending') return
      this.status = 'rejected'
      this.value = data
      if (this.callbacks.length > 0) {
        this.callbacks.forEach(item => {
          item.onRejected()
        })
      }
    }
    try {
      // 调用promise方法
      this.executor(resolve, reject)
    } catch(e) {
      // 如果用户传的executor方法有异常就直接走reject
      reject(e)
    }
  }

  static catch (onRejected) {
    return this.then(undefined, onRejected)
  }

  static resolve (value) {
    return new Promise2((res, rej) => {
      if (value instanceof Promise2) {
        value.then(
          data => {res(data)},
          data => {rej(data)}
        )
      } else {
        res(value)
      }
    })
  }

  static reject (value) {
    return new Promise2((res, rej) => {
      rej(value)
    })
  }

  static all (promises) {
    return new Promise2((res, rej) => {
      // 防止不传promises
      try {
        const data = []
        // 记录当前then了几个,如果全部走了then就可以执行res了
        let count = 0
        promises.forEach((item, index) => {
          // 可以是promise也可以不是
          if (item instanceof Promise2) {
            item.then(
              val => {
                data[index] = val
                count++
                // 如果全部跑完了就执行res
                if (count === promises.length) {
                  res(data)
                }
              },
              // 如果存在一个失败的就直接返回失败
              val => {
                rej(val)
              }
            )
          } else {
            data[index] = item
            count++
          }
        })
        // 如果传的是空数组或者都是立即执行的就直接抛出去
        if (count === promises.length) {
          res(data)
        }
      } catch (error) {
        rej(error)
      }
    })
  }

  static race (promises) {
    return new Promise2((res, rej) => {
      try {
        promises.forEach(item => {
          if (item instanceof Promise2) {
            item.then(
              // 一旦有成功或者失败就直接结束
              val => {
                res(val)
              },
              val => {
                rej(val)
              }
            )
          } else {
            res(item)
          }
        })
      } catch (error) {
        rej(error)
      }
    })
  }

  then (onResolve, onRejected) {
    // then其实返回的是一个promise
    return new Promise2((res, rej) => {

      const handle = (callback) => {
        if (typeof callback !== 'function') {
          callback = value => value
        }
        // 如果用户在then中的方法出错,就返回rej
        try {
          const data = callback(this.value)
          // 如果then中的方法返回的是Promise就执行这个Promise
          if (data instanceof Promise2) {
            data.then(
              // 执行return的promise中的值
              val => {
                res(val)
              },
              val => {
                rej(val)
              }
            )
          } else {
            // 如果不是,就包一个promise,值是返回的值
            res(data)
          }
        } catch (error) {
          rej(error)
        }
      }
      // 如果promise已经执行完了就直接输出
      if (this.status === 'resolved') {
        // 由于resolve是异步所以如果提前执行了也要丢到微任务里面,这里借用setTimeOut
        setTimeout(() => {
          handle(onResolve)
        });
      } else if (this.status === 'rejected') {
        setTimeout(() => {
          handle(onRejected)
        });
      } else if(this.status === 'pending') {
        // 如果还没执行完就先存起来等执行完执行
        this.callbacks.push({
          onResolve: () => {
            handle(onResolve)
          },
          onRejected: () => {
            handle(onRejected)
          }
        })
      }
    })
  }
}

function test2() {
  // const pro = new Promise2((res, rej) => {
  //   setTimeout(() => {
  //     res('11')
  //   }, 2000);
  // })
  // pro
  //   .then(res => {
  //     console.log('res1:', res);
  //     return "22"
  //   })
  //   .then(res => {
  //     console.log('res2:', res);
  //     return new Promise2((res, rej) => {
  //       setTimeout(() => {
  //         res('33')
  //       }, 1000);
  //     })
  //   })
  //   // .then(res => {
  //   //   console.log('res3:', res);
  //   // })
  //   .then(1)
  //   .then(res => {
  //     console.log('res4:', res);
  //   })
    
  // const promise1 = Promise2.resolve(3);
  // const promise2 = 42;
  // const promise3 = new Promise2((resolve, reject) => {
  //   setTimeout(resolve, 1000, 'foo');
  // });
  // const promise4 = new Promise2((resolve, reject) => {
  //   setTimeout(resolve, 2000, 'foo0');
  // });
  // Promise2.all([promise1, promise2, promise3, promise4]).then((values) => {
  //   console.log(values);
  // });
  // Promise2.all().then((values) => {
  //   console.log(values);
  // });

  const promise1 = new Promise2((resolve, reject) => {
    setTimeout(resolve, 500, 'one');
  });
  
  const promise2 = new Promise2((resolve, reject) => {
    setTimeout(resolve, 1000, 'two');
  });
  Promise2.race([promise1, promise2]).then((value) => {
    console.log(value);
  });
}
test2()

