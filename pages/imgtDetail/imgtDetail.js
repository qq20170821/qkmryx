const app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:'',//图文id
    coverUrl:'',//封面图片
    imgtTopInfo:{},//图文顶部作者信息
    play_number:0,//顶部阅读量
    imgUrl: '',//图片前缀地址
    noMore: false,//没有更多是否显示（默认false）
    page:1,
    limit:8,
    imgtList:[],//图文列表数据
    showMess:false,//是否显示mess
    num:true,
    openFixed:false,//页面滑动显示
    openFixedId:true,//标识
    tip_title:'',//设备不同提示信息
    isTitle: '',//分享标题
    isImg: '',//分享图片
    start:true,//点赞
    startNum:0,//点赞数量
    max: 256, //最多字数 (根据自己需求改变)
    currentWordNumber: 0,//当前字数
    reply:false,//是否显示评论框和遮罩按钮
    content:'',//评论内容
    richText:'',//富文本内容
    nofaceShare:false,//不要脸弹窗是否显示
    
    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let twenty_four=Number(new Date(new Date().toLocaleDateString()).getTime()) + 86400000;
    let now = new Date().getTime();
    if (wx.getStorageSync('twenty_four')){
      if (now > wx.getStorageSync('twenty_four')){
        wx.clearStorageSync('num');
        wx.clearStorageSync('twenty_four');
      }
    }else{
      wx.setStorageSync('twenty_four', twenty_four)
    }
    console.log('以下为options');
    console.log(options)
    this.setData({
      imgUrl: app.imgUrl,
      id: options.id,
    });
    if (options.coverUrl){
      this.setData({
        coverUrl: options.coverUrl
      })
    }
    this.getDataList(options.id);
    this.getImgtList(1);
    this.shareImgt();
    this.getStart();
    this.getSecond();
    this.checkPhone();
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
  //关闭弹窗
  closeFixed(){
    this.setData({
      openFixed:false
    })
  },
  /**
   * 获取后台传输过来的秒数，是否开启，每日次数，设置弹窗分享框的时间,及每天弹出次数
   */
  getSecond(){
    let that=this;
    wx.request({
      method:'POST',
      url: app.URLRequest +'SetAdd/getSwitch',
      success(res){
        // console.log(res);
        if(res.data.data.operate==1){
          if (wx.getStorageSync('num')){
            // console.log("有缓存")
            if (wx.getStorageSync('num') < res.data.data.num) {
              that.setTime((res.data.data.uptime) * 1000);
            }
          }else{
            // console.log('没有缓存')
            that.setTime((res.data.data.uptime)*1000);
          }
        }else{
          // console.log('要求分享弹窗已关闭')
        }
      },
      fail(err){
        console.log(err)
      },
    })
  },
  /**
   * 1.设置延时器
   * 2.
   */
  setTime(second){
    let that=this;
    setTimeout(function () {
      that.setData({
        nofaceShare: true
      })
      let cs = wx.getStorageSync('num');
      // console.log(cs);
      if (cs) {
        // console.log('有缓存阿萨德')
        cs += 1;
        wx.setStorageSync('num', cs)
      } else {
        // console.log('没缓冲啊飒飒')
        wx.setStorageSync('num', 1)
      }
    }, second)
    
  },
  //点击评论，弹出评论框
  comment(){
    let that = this;
    that.setData({
      reply: true
    })
  },
  //关闭
  close(){
    let that=this;
    that.setData({
      reply:false
    })
  },
    /**
   * 监听用户输入
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
      content:value
    })

  },
  /**
   * 获取点赞数
   */
  getStart(){
    let that=this;
    if (wx.getStorageSync('start'+that.data.id) == that.data.id) {
      that.setData({
        start: false
      })
    };
    wx.request({
      method:'POST',
      url: app.URLRequest +'ImageText/getImageZan',
      data:{
        id:that.data.id
      },
      success(res){
        if(res.data.code==200){
          // console.log(res);
          that.setData({
            startNum:res.data.data.zanNum
          })
        }else{
          console.log(res)
        }
      },
    })
  },
  /**
   * 增加点赞数
   */
  addStart() {
    let that = this;
    wx.request({
      method:'POST',
      url: app.URLRequest+'ImageText/addImageZan',
      data:{
        id: that.data.id
      },
      success(res){
        // console.log(res);
        if(res.data.code==200){
          wx.setStorageSync('start'+that.data.id, that.data.id)
          that.getStart();
          that.setData({
            start:false
          })
        }
      }
    })
  },
  /**
   * 评论
   */
  sendComment(){
    let that=this;
    wx.request({
      method:'POST',
      url: app.URLRequest +'Comment/addImageComment',
      data:{
        iid:that.data.id,
        content: that.data.content
      },
      success(res){
        // console.log(res)
        if(res.data.code==200){
          wx.showToast({
            title: '评论成功',
          })
          that.setData({
            currentWordNumber:0,
            content:''
          })
        }else if(res.data.code==300){
          wx.showToast({
            title: '评论失败',
            icon:'none'
          })
        }
      },
      fail(err){
        console.log(err)
      }
    })
  },
  /**
   * 跳转到评论列表
   */
  lookMore(){
    wx.navigateTo({
      url: '/pages/commentList/commentList?id='+this.data.id,
    })
  },
  // 跳转到版权页面
  copyWrite(){
    app.copyWrite();
  },
   
  /**
   * 获取富文本
   */
  getDataList(id){
    console.log('当前id'+id)
    wx.showLoading({
      title: '加载中',
    });
    let that=this;
    wx.request({
      method:'POST',
      url: app.URLRequest +'ImageText/getDeatilImage',
      data:{
        id:id
      },
      success(res){
        wx.hideLoading();//隐藏loading
        console.log('富文本');
        console.log(res)
        if(res.data.code==200){
          let article = res.data.data.content.replace(/section/g, 'div');
          article = article.replace(/blockquote/g, 'div');
          article = article.replace(/center/g, 'div');
          // 过滤
          article = article.replace(/<img[^>]*>/gi, function (match, capture) {
            if (match.indexOf("style") > 0) {
              var match = match.replace(/style=\"(.*)\"/gi, function (match, capture) {
                // console.log(capture)
                return 'style="' +  'max-width:100%;'+capture+'"';
              });
            } else {
              var match = match.replace('<img', '<img style="max-width:100%; "');
            }
            return match;
          });

          let play_number = app.toWan(res.data.data.play_number)

          that.setData({
            imgtTopInfo:res.data.data,
            play_number: play_number,
            richText: article
          })
        }else{
          console.log('富文本内容状态'+res.data.code)
        }
      }
    })
  },
  /**
   * 获取图文列表
   */
  getImgtList(page){
    wx.showLoading({
      title: '加载中',
    });
    let that=this;
    wx.request({
      method:'POST',
      url: app.URLRequest + 'ImageText/randomDataImg',
      data:{
        id:that.data.id,
        page:page,
        limit:that.data.limit
      },
      success(res){
        wx.hideLoading();//隐藏loading
        if(res.data.code==200){
          var arr = that.data.imgtList;
          arr.push.apply(arr, res.data.data);
          that.setData({
            imgtList: arr
          })
          // console.log(that.data.imgtList);
          that.data.page++;
        }else if(res.data.code==300){
          // console.log(res.data.message);
          that.setData({
            noMore:true
          })
        }else{
          // console.log(res)
        }
      }
      
    })
  },
  /**
  * 点击图文列表跳转到指定详情页
  */
  toImgDetail(e) {
    let id = e.currentTarget.dataset.id;
    console.log('当前点击对应id'+id)
    app.addReadNumber(id);//更新点击量
    wx.redirectTo({
      url: '/pages/imgtDetail/imgtDetail?id=' + id
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log("上拉加载。。")
    this.getImgtList(this.data.page);
  },
 
  /**
   * 监听页面滚动
   */
  onPageScroll: function (e) {
    let that=this;
    if (e.scrollTop>300){
      if (that.data.num){
        that.setData({
          showMess: true,
          num:false
        })
        setTimeout(function(){
          that.setData({
            showMess: false
          })
        },3000)
      }
    }
    if (e.scrollTop>80){
      if (that.data.openFixedId){
        that.setData({
          openFixed: true,
          openFixedId:false
        })
      }
     
    }else{
      that.setData({
        openFixed: false,
        openFixedId: true
      })
    }
  },
/***
 * 自定义分享(分享图文)
 */
  shareImgt() {
    let that = this;
    wx.request({
      method: 'POST',
      url: app.URLRequest + 'ImageText/shareImgText',
      data: {
        id: that.data.id
      },
      success(res) {
        // console.log('自定义分享图，标题');
        // console.log(res)
        if (res.data.code == 200) {
          console.log(res);
          let shareimg = res.data.data.shareimg;
          let sharetitle = res.data.data.sharetitle;
          if (shareimg) {
            // console.log(shareimg)
            that.setData({
              isImg: shareimg
            })
          } else {
            // console.log(that.data.coverUrl)
            that.setData({
              isImg: that.data.coverUrl
            })
          }
          if (sharetitle) {
            // console.log(sharetitle)
            that.setData({
              isTitle: sharetitle
            })
          } else {
            // console.log(that.data.imgtTopInfo.title);
            that.setData({
              isTitle: that.data.imgtTopInfo.title
            })
          }
        } else {
          // console.log('获取自定义分享图状态'+res.data.code)
        }
      }
    })

  },

  onShareAppMessage: function () {
    let that = this;
    wx.showShareMenu({
      withShareTicket: true, 
    })
    let isTitle = that.data.isTitle;
    let isImg = that.data.isImg;
    let path='/pages/imgt/imgt?share='+that.data.id;
      return {
        title: isTitle,
        imageUrl: isImg,
        path: path,
        success(res) {
          // console.log(res);
          that.setData({
            nofaceShare: false
          })
          app.addShareNumber(that.data.id, 'ImageText/addClickShare')
        },
        fail(err){
          console.log(err);
        }
      }
    },

})