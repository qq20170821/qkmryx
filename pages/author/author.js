// pages/author/author.js
const app=getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: '',//图片前缀地址
    uid:'',//作者uID
    page:1,//页码
    limit:8,//每页数
    authorInfo:'',//作者及其作品信息
    authorVideo:[],//视频列表
    play_num:0,//总观看量
    noMore: false,//没有更多是否显示（默认false）
  },

  /**
   * 图片拼接前缀imgUrl
   * 作者uid
   * getCountNmber()获取作者信息，传入参数uid
   * getAuthorVideo()获取视频封面列表,传入参数uid,page,limit
   * 
   */
  onLoad: function (options) {
    this.setData({
      imgUrl: app.imgUrl,
      uid: options.uid
    });
    this.getAuthorInfo();
    this.getAuthorVideo();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // console.log("上拉加载。。")
    this.getAuthorVideo(this.data.page);
  },

  /**
    * 用户点击右上角分享
    */
  onShareAppMessage: function () {
    wx.showShareMenu({
      withShareTicket: true
    })
  },


  /**
   * 参数：uid
   * 获取作者信息（名称，头像，总视频量，总观看量）
   * 开始请求，显示加载loading,成功隐藏
   */
  getAuthorInfo(){
    var that=this;
    wx.request({
      method: 'POST',
      url: app.URLRequest +'video/getCountNmber',
      data:{
        uid: that.data.uid
      },
      success(res){
        console.log("以下为作者基础信息");
        console.log(res)
        if(res.data.code==200){
          let play_num = app.toWan(res.data.data.play_num);
          that.setData({
            authorInfo:res.data.data,
            play_num: play_num
          })
        }
      }
    })
  },
   /**
   * 获取作者视频信息（视频，标题，名称，播放量）
   */
  getAuthorVideo() {
    wx.showLoading({
      title: '加载中',
    });
    var that = this;
    wx.request({
      method: 'POST',
      url: app.URLRequest + 'video/getAuthorVideo',
      data: {
        uid: that.data.uid,
        page: that.data.page,
        limit: that.data.limit
      },
      success(res) {
        if (res.data.code == 200) {
          var arr = that.data.authorVideo;
          arr.push.apply(arr, res.data.data);
          that.setData({
            authorVideo: arr
          });
          that.data.page++;
        }else if(res.data.code==300){
          that.setData({
            noMore: true
          })
        } else {
          console.log(res.data.code)
        }
        console.log("以下为作者视频信息");
        console.log(that.data.authorVideo)
      },
      complete: function () {
        wx.hideLoading();//隐藏loading
      }
    })
  },
  /**
   * 点击视频列表播放
   * 点击更新视频点击量
   */
  toDetail(e) {
    var id = e.currentTarget.dataset.id;
    app.addClickNumber(id);//更新点击量
    wx.navigateTo({
      url: '../detail/detail?id=' + id//实际路径要写全
    })
  },
})