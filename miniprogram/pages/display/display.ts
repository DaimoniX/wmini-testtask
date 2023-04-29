import { QrCode, Ecc } from "./qr/qrcodegen";
import { drawCanvasQR, canvasToFile } from "./qr/qrhelper";
import { renderPageOnCanvas } from "./pagesaver/pagesaver";

// pages/display/display.ts
Page({
  data: {
    articleData: Array<String>(),
    qrImage: "",
    pageImage: ""
  },
  onLoad() {
    const app = getApp<IAppOption>();
    const article = app.globalData.articleData;

    if (!article) {
      wx.navigateTo({ url: "../index/index" });
      return;
    }

    const self = this;
    const query = wx.createSelectorQuery();

    const url = article[2];
    this.setData({
      articleData: article
    });

    const qrCode = QrCode.encodeText(url, Ecc.MEDIUM);
    query.select('#qrc')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node as WechatMiniprogram.Canvas;
        drawCanvasQR(qrCode, 32, 2, "white", "black", canvas);
        canvasToFile(canvas, (file) => {
          this.setData({
            qrImage: file
          });
          query.select('#pagec')
            .fields({ node: true, size: true })
            .exec((res) => {
              const canvas = res[0].node as WechatMiniprogram.Canvas;
              renderPageOnCanvas(canvas, ".a-container", ".psaver", () => {
                wx.canvasToTempFilePath({
                  x: 0,
                  y: 0,
                  canvas: canvas,
                  destWidth: canvas.width,
                  destHeight: canvas.height,
                  success(res) {
                    self.setData({ pageImage: res.tempFilePath })
                  },
                  fail(res) {
                    console.log("FAILED", res)
                  }
                })
              })
            });
        });
      })
  },
  preview() {
    wx.previewImage({
      current: '',
      urls: [this.data.qrImage, this.data.pageImage],
      fail(res) {
        console.log("FAILED", res)
      }
    })
  },
  save() {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.pageImage,
      success() {
        wx.showToast({
          title: "File saved"
        })
      }
    })
  }
})