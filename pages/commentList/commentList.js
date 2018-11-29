const app=getApp()
var time = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:'',//图文id
    page:1,
    limit:10,
    comNum:0,
    commentList:[],
    noMore:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var sjc = 1488481383;
    console.log(time.formatTime(sjc, 'Y-M-D h:m'));
    console.log(time.formatTime(sjc, 'h:m'));
    console.log(options.id);
    this.setData({
      id:options.id
    })
    this.getCommentList(this.data.page);
  },
getCommentList(page){
  let that=this;
  wx.showLoading({
    title: '加载中',
  })
  wx.request({
    method:'POST',
    url: app.URLRequest + 'Comment/getImageComment', 
    data:{
      id:that.data.id,
      page:page,
      limit:that.data.limit
    },
    success(res){
      wx.hideLoading();
      if(res.data.code==200){
        console.log(res);
        let arr = that.data.commentList;
        arr.push.apply(arr, res.data.data.list);
        arr.forEach(function (item, index) {
          item.addTime = time.formatTime(item.addTime, 'Y-M-D h:m')
        })
        that.setData({
          commentList:arr,
          comNum:res.data.data.comNum,
        })
        that.data.page++;
      }else if(res.data.code==300){
        console.log(res.data.code)
        that.setData({
          noMore:true
        })
      }
    },
    fail(err){
      console.log(err)
    }
  })
},







  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getCommentList(this.data.page);

  },

})