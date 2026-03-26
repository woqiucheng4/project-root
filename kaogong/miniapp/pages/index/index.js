const { formSteps, fieldDefinitions } = require('../../utils/formConfig');
const api = require('../../utils/api');

Page({
  data: {
    currentStep: 0,
    totalSteps: formSteps.length,
    stepTitles: formSteps.map(s => s.title),
    currentFields: [],
    formData: {},
    errors: {},
    submitting: false
  },

  onLoad() {
    this.updateCurrentFields();
  },

  updateCurrentFields() {
    const step = formSteps[this.data.currentStep];
    const fields = step.fields.map(name => ({ name, def: fieldDefinitions[name] }));
    this.setData({ currentFields: fields });
  },

  onFieldChange(e) {
    const { name, value } = e.detail;
    this.setData({
      [`formData.${name}`]: value,
      [`errors.${name}`]: ''
    });
  },

  validateStep() {
    const step = formSteps[this.data.currentStep];
    let valid = true;
    const errors = {};
    
    step.fields.forEach(name => {
      const def = fieldDefinitions[name];
      const val = this.data.formData[name];
      if (def.required && (val === undefined || val === null || val === '')) {
        errors[name] = '此项为必填项';
        valid = false;
      }
    });
    
    this.setData({ errors });
    return valid;
  },

  nextStep() {
    if (this.validateStep()) {
      this.setData({ currentStep: this.data.currentStep + 1 });
      this.updateCurrentFields();
    }
  },

  prevStep() {
    this.setData({ currentStep: this.data.currentStep - 1 });
    this.updateCurrentFields();
  },

  async submitForm() {
    if (!this.validateStep()) return;
    this.setData({ submitting: true });
    
    try {
      const result = await api.post('/api/analyze', this.data.formData);
      if (result.reportId) {
        getApp().globalData.reportId = result.reportId;
        wx.navigateTo({ url: `/pages/result/result?id=${result.reportId}` });
      } else {
        wx.showToast({ title: result.error || '生成失败', icon: 'none' });
      }
    } catch (err) {
      wx.showToast({ title: err.message, icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  }
});
