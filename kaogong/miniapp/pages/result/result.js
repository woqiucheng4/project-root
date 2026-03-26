const api = require('../../utils/api');

Page({
  data: {
    reportId: '',
    report: null,
    loading: true,
    levelColor: '#9ca3af'
  },

  onLoad(options) {
    const id = options.id;
    if (!id) {
      wx.showToast({ title: '缺少报告ID', icon: 'none' });
      this.setData({ loading: false });
      return;
    }
    this.setData({ reportId: id });
    this.fetchReport(id);
  },

  async fetchReport(id) {
    try {
      const data = await api.get(`/api/report?id=${id}`);
      const colorMap = { 'T0': '#ef4444', 'T1': '#f59e0b', '普通': '#3b82f6' };
      this.setData({
        report: data,
        levelColor: colorMap[data.free?.bonusLevel] || '#9ca3af',
        loading: false
      });
    } catch (err) {
      wx.showToast({ title: err.message, icon: 'none' });
      this.setData({ loading: false });
    }
  },

  goPayment() {
    wx.navigateTo({ url: `/pages/payment/payment?id=${this.data.reportId}` });
  }
});
