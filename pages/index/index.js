//index.js
//获取应用实例
const app = getApp()
Page({
  data: {
    videoList:[],
    page:1,
    limit:10,
    imgUrl:'',        //图片拼接地址前缀
    noMore_tips:false,//加载更多无数据显示
    tip_title:'',     //根据设备提示信息
    tip:true,         //是否显示提示信息
  },
  onLoad: function (options) {
    let that=this;
    that.setData({
      imgUrl: app.imgUrl
    });
    that.getVideoList(1);
    app.checkPhone(that,that.data.tip,that.data.tip_title);
    that.checkShare(options.share);
  },
  //1.获取视频封面图及标题
  getVideoList(page){
    let that=this;
    that.setData({
      noMore_tips:false
    })
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      method:'POST',
      url: app.URLRequest+'video/getVideoList',
      data:{
        page:page,
        limit:that.data.limit
      },
      success(res){
        if(res.data.code==200){
          wx.stopPullDownRefresh();//停止下拉刷新
          that.setData({
            videoList: that.data.videoList.concat(res.data.data)
          })
          that.data.page++;
          console.log('以下为当前页面数据');
          console.log(that.data.videoList);
        }else if(res.data.code==300){
          that.setData({
            noMore_tips:true
          })
        }
      },
      complete(){
        wx.hideLoading();
      }
    })
  },
  //2.下拉刷新
  onPullDownRefresh(){
    let that=this;
    that.setData({
      videoList:[],
      page:1
    });
    that.getVideoList(that.data.page);
  },
  //3.页面触底事件
  onReachBottom(){
    let that=this;
    console.log(that.data.page);
    that.getVideoList(that.data.page);
  },
  //4.点击跳转到视频播放详情页面
  goDetail(e){
    console.log('即将跳转的视频id:'+e.currentTarget.dataset.id);
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id
    })
  },
  //5.点击作者头像/昵称跳转到作者详情页面
  goAuthor(e){
    console.log('即将跳转的作者uid:' + e.currentTarget.dataset.uid);
    wx.navigateTo({
      url: '/pages/author/author?uid=' + e.currentTarget.dataset.uid,
    })
  },
  //6.检查是否从分享进来
  checkShare(share) {
    console.log('从分享进来的标识=====' + share);
    if (share) {
      wx.navigateTo({
        url: '/pages/detail/detail?id=' + share,
      })
    };
  },
})
