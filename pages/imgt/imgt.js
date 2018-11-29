const app = getApp()
Page({
  data: {
    imgUrlsTitle: [
      { img: 'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg', title:'img1按时打算的撒大撒多撒大所大所大所大所大所多撒多大撒多所大撒多撒所大所大所多啊实打实大萨达'},
      { img: 'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg', title: 'img1按时打算的撒大撒多撒大所大所大所大所大所多撒多大撒多所大撒多撒所大所大所多啊实打实大萨达' },
      { img: 'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg', title: 'img1按时打算的撒大撒多撒大所大所大所大所大所多撒多大撒多所大撒多撒所大所大所多啊实打实大萨达' },
      // 'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
      // 'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
      // 'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
    ],
    indicatorDots: true,
    autoplay:true,
    duration:500,
    interval:3000,

    imgt:[],//图文信息
    page:1,
    limit:10,
    imgUrl: '',//图片前缀地址
    noMore: false,//没有更多是否显示（默认false）
    tip:true,//提示信息是否显示
    tip_title:'',//提示标题
  },
  /**
   * 1.存在share分享标识，跳转到分享页，无，反之
   * 2.检查当前设备，苹果安卓显示不同提示信息
   * 3.拼接图片地址前缀
   * 4.获取当前页面图文信息
   */
  onLoad: function (options) {
    console.log(options.share);
    if (options.share) {
      wx.navigateTo({
        url: '/pages/imgtDetail/imgtDetail?id='+options.share,
      })
    };
    app.checkPhone(this, this.data.tip, this.data.tip_title);
    this.setData({
      imgUrl: app.imgUrl
    })
    this.getImgt(1);
  },
  /**
   * 下拉刷新
   * 1.重置当前页面数据，和page值
   * 2.获取最新图文信息
   */
  onPullDownRefresh() {
    console.log("下拉刷新。。。。。。")
    this.setData({
      imgt:[],
      page:1,
      noMore:false
    })
    this.getImgt(this.data.page);

  },
  /**
   * 上拉加载
   * 1.获取图文信息
   */
  onReachBottom() {
    console.log("上拉加载。。")
    this.getImgt(this.data.page);
  },
  // 换一批
  change(){
    this.setData({
      imgt: [],
      page: 1,
      noMore: false
    })
    this.getImgt(this.data.page);
  },
  /**
   * 获取图文信息列表
   * 1.开始请求，loading
   * 2.请求成功赋值
   * 3.300状态的时候，显示没有信息提示
   * 4.完成请求关闭loading
   */
  getImgt(page){
    let that=this;
    wx.showLoading({
      title: '加载中',
    });
    wx.request({
      method:'POST',
      url: app.URLRequest +'ImageText/getImageList',
      data:{
        appid:'wx7729eec1c5222f08',
        page:page,
        limit:that.data.limit
      },
      success(res) {
        if (res.data.code == 200) {
          var arr = that.data.imgt;
          arr.push.apply(arr, res.data.data);
          that.setData({
            imgt:arr
          })
        that.data.page++;
          console.log(res.data.data);
        }else if(res.data.code==300){
          that.setData({
            noMore: true
          })
        }else{
          console.log(res.data.code)
        }
      },
      complete: function () {
        wx.hideLoading();//隐藏loading
        wx.stopPullDownRefresh();//停止下拉刷新
      }
    })
    
  },
  /**
   * 点击图文列表
   * 1.传入图文对应id
   * 2.增加阅读点击量
   * 3.跳转到指定详情页
   */
  toImgDetail(e){
    console.log(e);
    let id = e.currentTarget.dataset.id;
    let coverUrl = e.currentTarget.dataset.url;
    // console.log(id)
    // console.log(coverUrl)
    app.addReadNumber(id);//更新点击量
    wx.navigateTo({
      url: '../imgtDetail/imgtDetail?id=' + id + '&coverUrl=' + coverUrl
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    wx.showShareMenu({
      withShareTicket: true
    })
  }
})