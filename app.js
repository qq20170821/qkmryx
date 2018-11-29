//app.js
App({
  //测试接口地址
  URLRequest: "http://videoapi.ittun.com/api/v1/",
  //正确接口地址
  // URLRequest: "https://m.yueji1314.com/api/v1/",
  //图片拼接地址
  imgUrl: 'https://qiyun-1257007004.cos-website.ap-guangzhou.myqcloud.com/',
  onLaunch: function () {},
  //1.把数字转化为万单位
  toWan(x) {
    if (x.toString().length > 4) {
      x = (x / 10000).toFixed(2);
      var y = x + "万";
      return y;
    } else {
      return x;
    }
  },
  //2.增加视频点击量
  addClickNumber(id) {
    let that = this;
    wx.request({
      method: 'POST',
      url: that.URLRequest + 'video/addClickNumber',
      data: {
        id: id
      },
      success(res) {
        console.log(res.data.message)
      }
    })
  },
  //3.增加图文点击量
  addReadNumber(id) {
    let that = this;
    wx.request({
      method: 'POST',
      url: that.URLRequest + 'ImageText/addClickNumber',
      data: {
        id: id
      },
      success(res) {
        console.log(res.data.message);
      }
    })
  },
 //4.增加分享量
  addShareNumber(id, url) {
    let that = this;
    wx.request({
      method: 'POST',
      url: that.URLRequest + url,
      data: {
        id: id
      },
      success(res) {
        console.log(res.data.message);
      }
    })
  },
  //5.跳转到版权说明页面
  copyWrite() {
    wx.navigateTo({
      url: '/pages/copyWrite/copyWrite',
    })
  },
  //6.根据不同设备显示不同提示信息
  checkPhone(vm, tip,tip_title) {
    let that = vm;
    wx.getSystemInfo({
      success(res) {
        if (res.platform == 'android') {
          that.setData({
            tip_title: '添加到我的桌面'
          })
          setTimeout(function () {
            that.setData({
              tip: false
            })
          }, 5000)
        } else if (res.platform == 'ios') {
          that.setData({
            tip_title: '添加到我的小程序'
          })
          setTimeout(function () {
            that.setData({
              tip: false
            })
          }, 5000)

        } else {
          setTimeout(function () {
            that.setData({
              tip: false
            })
          }, 5000)
        }
      }
    })
  },
  // 登录
  checkLogin() {
    let that = this;
    wx.login({
      success(res) {
        if (res.code) {
          wx.request({
            method: 'POST',
            url: that.URLRequest + 'user/login',
            data: {
              code: res.code
            },
            success(res) {
              console.log(res)
              wx.setStorageSync('openid', res)
            }
          })

        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
  },
  globalData: {
    userInfo: null,
  }
})