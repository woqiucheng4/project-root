Component({
  properties: {
    name: String,
    definition: Object,
    value: null,
    error: String
  },
  methods: {
    onInput(e) {
      this.triggerEvent('change', { name: this.data.name, value: e.detail.value });
    },
    onPickerChange(e) {
      const val = this.data.definition.options[e.detail.value];
      this.triggerEvent('change', { name: this.data.name, value: val });
    },
    onRadioTap(e) {
      const { name, value } = e.currentTarget.dataset;
      // dataset 里 boolean 会被序列化为字符串，需要转换
      let realVal = value;
      if (value === 'true') realVal = true;
      if (value === 'false') realVal = false;
      this.triggerEvent('change', { name, value: realVal });
    }
  }
});
