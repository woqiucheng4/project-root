const api = require('../../utils/api');

Page({
  data: {
    reportId: '',
    processing: false
  },

  onLoad(options) {
    this.setData({ reportId: options.id || '' });
  },

  async handlePay() {
    if (!this.data.reportId) {
      wx.showToast({ title: '订单异常', icon: 'none' });
      return;
    }

    this.setData({ processing: true });

    // MVP 阶段：沙盒模拟支付
    // V2 正式版：此处应替换为 wx.requestPayment 调起微信原生支付
    // 示例代码：
    // const payParams = await api.post('/api/wx-pay', { reportId: this.data.reportId });
    // wx.requestPayment({
    //   ...payParams,
    //   success: () => { /* 支付成功逻辑 */ },
    //   fail: () => { /* 支付失败逻辑 */ }
    // });

    try {
      const result = await api.post('/api/payment', { reportId: this.data.reportId });
      
      if (result.success) {
        wx.showToast({ title: '支付成功！', icon: 'success' });
        
        setTimeout(() => {
          // 返回结果页并刷新数据
          const pages = getCurrentPages();
          const resultPage = pages[pages.length - 2];
          if (resultPage) {
            resultPage.fetchReport(this.data.reportId);
          }
          wx.navigateBack();
        }, 1500);
      } else {
        wx.showToast({ title: result.error || '支付失败', icon: 'none' });
      }
    } catch (err) {
      wx.showToast({ title: err.message, icon: 'none' });
    } finally {
      this.setData({ processing: false });
    }
  }
});
