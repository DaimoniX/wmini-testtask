import { report, getOpenId, getFrames } from '../../backend/server';
import { getGlobalData } from '../../app';
import { ArticleField, CreateEmptyArticle, inputFields, ValidateArticle } from '../../utils/article';
import { isURL } from '../../utils/validator';

Page({
  data: {
    inputs: inputFields,
    articleData: CreateEmptyArticle(),
    allSet: false,
    validUrl: false,
    userId: undefined as unknown as WechatMiniprogram.UserInfo,
    ready: false
  },
  inputChange(e: WechatMiniprogram.CustomEvent) {
    const values = this.data.articleData;
    values[e.currentTarget.dataset.key as ArticleField] = e.detail.value;
    const allSet = ValidateArticle(this.data.articleData);
    this.setData({
      allSet: allSet,
      validUrl: allSet && isURL(this.data.articleData["url"] ?? "")
    });
  },
  create() {
    this.data.articleData['url'] = this.data.articleData['url'].startsWith("http") ?
      this.data.articleData['url'] :
      "https://" + this.data.articleData['url'];
    getGlobalData().articleData = this.data.articleData;

    if (getGlobalData().openId !== undefined)
      report("CARD_CREATED", {});

    wx.navigateTo({
      url: "../display/display"
    });
  },
  onShow() {
    if (getGlobalData().openId !== undefined) {
      this.setData({ ready: true });
      return;
    }

    const sId = wx.getStorageSync("openId");
    if (sId) {
      getGlobalData().openId = sId;
      console.log("l:", sId);
      const frames = getGlobalData().serverFrames;
      if (!frames || frames.length < 1)
        getFrames().then((frames) => getGlobalData().serverFrames = frames);
      this.setData({ ready: true });
      return;
    }

    const self = this;
    wx.login({
      success(res) {
        getOpenId(res.code).then((openId) => {
          console.log(openId);
          getGlobalData().openId = openId;
          getFrames().then((frames) => getGlobalData().serverFrames = frames);
          wx.setStorageSync("openId", openId);
        }).catch(() => { })
          .finally(() => {
            self.setData({
              ready: true
            })
          })
      },
    });
  }
})
