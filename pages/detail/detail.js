//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    imgUrl: '',//图片前缀地址
    id:'',//视频ID
    openFixed:true,//检查设备提示信息
    tip_title:'',//提示信息
    video:{
      list:{
        title:''
      }
    },//视频信息
    videoList:[],//视频列表
    play_number:0,//作者作品总播放量
    page:1,
    limit:8,
    noMore: false,//没有更多是否显示（默认false）
    isTitle: '',//分享标题
    isImg: '',//分享图片
    back:false,//是否显示返回按钮
    start:true,//点赞
    commentList:[],//评论
    start: true,//点赞
    startNum: 0,//点赞数量
    max: 256, //最多字数 (根据自己需求改变)
    currentWordNumber: 0,//当前字数
    reply: false,//是否显示评论框和遮罩按钮
    content: '',//评论内容
  },
  /**
   * 判断是否有分享标记，显示隐藏返回首页按钮
   * 获取视频id
   * 拼接视频前缀imgUrl
   * getVideo()获取视频信息
   * this.getVideoList()获取视频封面列表
   * this.shareVideo()分享id对应的图文内容
   */
  onLoad: function (options) {
    console.log(options)
    let that=this;
    if (options.share==10086){
      that.setData({
        back:true
      })
    }
    this.setData({
      id: options.id,
      imgUrl: app.imgUrl
    })
    this.getVideo();
    this.getVideoList(1);
    this.shareVideo();
    this.getStart();
    this.checkPhone();
  },
  /**
   * 关闭右上角提示信息
   */
  closeFixed(){
    this.setData({
      openFixed:false
    })
  },
  // 检查是安卓还是苹果
  checkPhone() {
    let that = this;
    wx.getSystemInfo({
      success(res) {
        if (res.platform == 'android') {
          that.setData({
            tip_title: '添加到我的桌面'
          })
        } else if (res.platform == 'ios') {
          that.setData({
            tip_title: '添加到我的小程序'
          })

        }
      }
    })
  },
  // 跳转到版权页面
  copyWrite() {
    app.copyWrite();
  },
  //点击评论，弹出评论框和遮罩
  comment() {
    let that = this;
    wx.pageScrollTo({
      scrollTop: 262
    })
    that.setData({
      reply: true
    })
  },
  //关闭评论框和遮罩
  close() {
    let that = this;
    that.setData({
      reply: false
    })
  },
  /**
 * 监听输入
 */
  inputs(e) {
    //获取输入框的内容
    let value = e.detail.value;
    //获取输入框内容的长度
    let len = parseInt(value.length);
    //最多字数限制
    if (len > this.data.max) return;
    // 当前字数
    this.setData({
      currentWordNumber: len,
      content: value
    })
  },
  /**
   * 获取点赞数
   */
  getStart() {
    let that = this;
    if (wx.getStorageSync('vstart' + that.data.id) == that.data.id) {
      that.setData({
        start: false
      })
    };
    wx.request({
      method: 'POST',
      url: app.URLRequest + 'video/getVideoZan',
      data: {
        id: that.data.id
      },
      success(res) {
        if (res.data.code == 200) {
          console.log(res.data.message);
          that.setData({
            startNum: res.data.data.zanNum
          })
        } else {
          console.log(res)
        }
      }
    })
  },
  /**
   * 增加点赞数
   */
  addStart() {
    let that = this;
    wx.request({
      method: 'POST',
      url: app.URLRequest + 'video/addVideoZan',
      data: {
        id: that.data.id
      },
      success(res) {
        console.log(res.data.message);
        if (res.data.code == 200) {
          wx.setStorageSync('vstart' + that.data.id, that.data.id)
          that.getStart();
          that.setData({
            start: false
          })
        }
      }
    })
  },
  /**
   * 作用：发送评论
   * 参数：comment,id
   */
  sendComment() {
    let that = this;
    wx.request({
      method: 'POST',
      url: app.URLRequest + 'Comment/addVideoComment',
      data: {
        vid: that.data.id,
        content: that.data.content
      },
      success(res) {
        console.log(res)
        if (res.data.code == 200) {
          wx.showToast({
            title: '评论成功',
          })
          that.setData({
            currentWordNumber: 0,
            content: ''
          })
        } else if (res.data.code == 300) {
          wx.showToast({
            title: '评论失败',
            icon: 'none'
          })
        }
      },
      fail(err) {
        console.log(err)
      }
    })
  },
  /**
   * 作用：跳转到评论列表
   * 参数：id
   */
  lookMore() {
    wx.navigateTo({
      url: '/pages/commentList/commentList?id=' + this.data.id + '&url=' + 'Comment/getVideoComment',
    })
  },
  /**
   * 通过视频id，获取对应视频（及其作者信息）
   */
  getVideo(){
    let that=this;
    wx.request({
      method:'POST',
      url: app.URLRequest +'video/getDetailPlay',
      data:{
        id:that.data.id
      },
      success(res){
        if(res.data.code==200){
          let play_number = app.toWan(res.data.data.list.play_number);
          that.setData({
            video:res.data.data,
            play_number: play_number
          })
          console.log(that.data.video)
        }
      }
    })
  },
  
  /**
   * 获取随机数据
   * 上拉加载
   * 300表示无数据
   */
  getVideoList(page) {
    let that = this;
    that.setData({
      noMore_tips: false
    })
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      method: 'POST',
      url: app.URLRequest + 'video/getVideoList',
      data: {
        page: page,
        limit: that.data.limit
      },
      success(res) {
        if (res.data.code == 200) {
          wx.stopPullDownRefresh();//停止下拉刷新
          that.setData({
            videoList: that.data.videoList.concat(res.data.data)
          })
          that.data.page++;
          console.log('以下为当前页面数据');
          console.log(that.data.videoList);
        } else if (res.data.code == 300) {
          that.setData({
            noMore: true
          })
        }
      },
      complete() {
        wx.hideLoading();
      }
    })
  },
  /**
  *上拉加载
  */
  onReachBottom() {
    console.log("上拉加载。。")
    this.getVideoList(this.data.page);
  },
  /**
   * 参数uid
   * 点击作者进入作者信息页面
   */
  toAuthor(e){
    var uid = e.currentTarget.dataset.uid;
    console.log('作者uid' + '--' + uid)
    wx.navigateTo({
      url: '/pages/author/author?uid=' + uid//实际路径要写全
    })
  },
  /**
   * 点击视频列表播放
   * 更新点击量
   * 关闭当前页面，跳转到当前页面
   */
  toNowPage(e){
    var id = e.currentTarget.dataset.id;
    app.addClickNumber(id);//更新点击量
    wx.redirectTo({
      url: '/pages/detail/detail?id=' + id//实际路径要写全
    })
  },
  /***
 * 自定义分享(分享视频)
 */
  shareVideo() {
    let that = this;
    wx.request({
      method: 'POST',
      url: app.URLRequest + 'video/shareVideo',
      data:{
        id:that.data.id
      },
      success(res) {
        if (res.data.code == 200) {
          let shareimg = res.data.data.shareimg;
          console.log(res.data.data);
          if (shareimg){
            that.setData({
              isImg: app.imgUrl+shareimg
            })
          }else{
            that.setData({
              isImg: that.data.video.list.images
            })
          }
          
        } else {
          console.log(res.data.code)
        }
      }
    })

  },

  onShareAppMessage: function () {
    let that = this;
    wx.showShareMenu({
      withShareTicket: true,
    })
    let isTitle = that.data.video.list.title;
    let isImg = that.data.isImg;
    console.log(isTitle);
    console.log(isImg);
    let path = '/pages/index/index?share=' + that.data.id;
    return {
      title: isTitle,
      imageUrl: isImg,
      path: path,
      success(res) {
        app.addShareNumber(that.data.id, 'video/addClickShare')
      },
      fail(err) {
        console.log(err);
      }
    }
  },

})
