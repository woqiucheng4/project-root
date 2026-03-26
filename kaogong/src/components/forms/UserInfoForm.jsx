"use client";
import React, { useState } from 'react';
import { formSteps, fieldDefinitions } from '@/config/formFields';
import { validateField } from '@/utils/validators';
import FormField from './FormField';
import StepIndicator from './StepIndicator';

export default function UserInfoForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stepInfo = formSteps[currentStep];

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateCurrentStep = () => {
    const newErrors = {};
    let isValid = true;
    
    stepInfo.fields.forEach(fieldName => {
      const def = fieldDefinitions[fieldName];
      const errorMsg = validateField(fieldName, formData[fieldName], def);
      if (errorMsg) {
        newErrors[fieldName] = errorMsg;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (validateCurrentStep()) {
      setIsSubmitting(true);
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const result = await response.json();
        
        if (result.reportId) {
           window.location.href = `/result?id=${result.reportId}`;
        } else {
           alert("生成失败，错误：" + (result.error || "未知异常"));
           setIsSubmitting(false);
        }
      } catch (err) {
        alert("网络或系统异常：" + err.message);
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div>
      <StepIndicator 
        currentStep={currentStep} 
        totalSteps={formSteps.length} 
        titles={formSteps.map(s => s.title)} 
      />

      <div style={{ marginTop: '24px', animation: 'fadeIn 0.3s ease' }} key={currentStep}>
        {stepInfo.fields.map(fieldName => (
          <FormField
            key={fieldName}
            name={fieldName}
            definition={fieldDefinitions[fieldName]}
            value={formData[fieldName]}
            onChange={handleChange}
            error={errors[fieldName]}
          />
        ))}
      </div>

      <div style={{ 
        display: 'flex', flexDirection: 'column', gap: '12px', 
        marginTop: '24px', paddingBottom: '8px' 
      }}>
        {currentStep < formSteps.length - 1 ? (
          <button className="form-btn-primary" onClick={handleNext}>下一步</button>
        ) : (
          <button 
            className="form-btn-submit" 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            style={{ opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? '分析中...' : '🚀 生成测评报告'}
          </button>
        )}

        {currentStep > 0 && (
          <button className="form-btn-secondary" onClick={handlePrev} disabled={isSubmitting}>
            上一步
          </button>
        )}
      </div>
    </div>
  );
}
