export const validateField = (name, value, definition) => {
  if (definition.required) {
    if (value === undefined || value === null || value === "") {
      return "此项为必填项";
    }
  }
  
  if (value && definition.type === "number") {
    const num = Number(value);
    if (isNaN(num)) return "请输入有效的数字";
    if (definition.min !== undefined && num < definition.min) return `不能小于 ${definition.min}`;
    if (definition.max !== undefined && num > definition.max) return `不能大于 ${definition.max}`;
  }

  return null;
};
